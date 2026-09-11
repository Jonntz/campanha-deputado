// Driver mínimo do Chrome via DevTools Protocol, sem dependências.
//
// Existe porque dois defeitos deste projeto passaram por testes que só falavam
// HTTP: a CSP que impedia o React de hidratar e o SITE_URL ausente. Nenhum dos
// dois aparece sem um navegador executando JavaScript de verdade.
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch({ port = 9333 } = {}) {
  const profile = mkdtempSync(join(tmpdir(), "cdp-"));
  const proc = spawn(
    CHROME,
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--autoplay-policy=no-user-gesture-required",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let page;
  for (let i = 0; i < 60 && !page; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      page = list.find((t) => t.type === "page");
    } catch {}
    if (!page) await wait(200);
  }
  if (!page) throw new Error("Chrome não abriu a porta de depuração");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let seq = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      for (const listener of listeners) listener(msg);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const once = (method, timeout = 30000) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`sem ${method} em ${timeout}ms`)), timeout);
      const listener = (msg) => {
        if (msg.method !== method) return;
        clearTimeout(timer);
        listeners.delete(listener);
        resolve(msg.params);
      };
      listeners.add(listener);
    });

  // Erros de JavaScript, console.error e violações de CSP — o que um teste por
  // HTTP nunca vê.
  const problems = [];
  listeners.add((msg) => {
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      problems.push(`exceção: ${d.exception?.description ?? d.text}`);
    }
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
      problems.push(`console.error: ${msg.params.args.map((a) => a.value ?? a.description).join(" ")}`);
    }
    if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
      problems.push(`log: ${msg.params.entry.text} ${msg.params.entry.url ?? ""}`.trim());
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  const api = {
    send,
    problems,
    async viewport(width, height, mobile = false) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
      });
    },
    async reducedMotion(on = true) {
      await send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: on ? "reduce" : "no-preference" }],
      });
    },
    async goto(url) {
      const loaded = once("Page.loadEventFired");
      await send("Page.navigate", { url });
      await loaded;
      await wait(700);
    },
    async eval(expression) {
      const r = await send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      }
      return r.result.value;
    },
    /** Força imagens preguiçosas a carregar, para a captura da página inteira. */
    async loadAllImages() {
      await api.eval(`(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = "eager"));
        await Promise.all([...document.images].map((img) =>
          img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
      })()`);
      await wait(400);
    },
    async screenshot(path, { full = false } = {}) {
      let params = { format: "png" };
      if (full) {
        const metrics = await send("Page.getLayoutMetrics");
        const { width, height } = metrics.cssContentSize ?? metrics.contentSize;
        params = {
          ...params,
          captureBeyondViewport: true,
          clip: { x: 0, y: 0, width, height, scale: 1 },
        };
      }
      const { data } = await send("Page.captureScreenshot", params);
      writeFileSync(path, Buffer.from(data, "base64"));
    },
    wait,
    async close() {
      try {
        ws.close();
      } catch {}
      proc.kill();
    },
  };
  return api;
}
