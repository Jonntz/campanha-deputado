// Verificação do site num navegador de verdade: layout nas duas larguras e as
// interações que precisam de JavaScript rodando.
import { mkdirSync } from "node:fs";
import { launch } from "./cdp.mjs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = process.argv[2] ?? "./out";
mkdirSync(OUT, { recursive: true });

const browser = await launch({ port: 9333 });
let failures = 0;
const check = (label, pass, extra = "") => {
  if (!pass) failures++;
  console.log(`${pass ? "  ok  " : " FALHA"}  ${label}${extra ? `  — ${extra}` : ""}`);
};
const pressEscape = () =>
  browser.send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key: "Escape",
    code: "Escape",
    windowsVirtualKeyCode: 27,
  });

for (const [name, width, height, mobile] of [
  ["desktop", 1440, 900, false],
  ["mobile", 390, 844, true],
]) {
  console.log(`\n=== ${name} (${width}px) ===`);
  browser.problems.length = 0;
  await browser.viewport(width, height, mobile);
  await browser.reducedMotion(true);
  await browser.goto(`${BASE}/`);
  await browser.screenshot(`${OUT}/${name}-topo.png`);

  // No topo só pode estar marcado o link da abertura — e só se ela estiver no
  // menu. Qualquer outra seção acesa ali é o scrollspy errando.
  const initialActive = await browser.eval(
    "document.querySelector('header nav a[aria-current=\"true\"]')?.getAttribute('href') ?? null",
  );
  if (!mobile) {
    check(
      "no topo, nenhuma seção abaixo aparece marcada",
      initialActive === null || initialActive === "#inicio",
      `marcado: ${initialActive ?? "nenhum"}`,
    );
  }

  const overflow = await browser.eval(
    "document.documentElement.scrollWidth - document.documentElement.clientWidth",
  );
  check("sem rolagem horizontal da página", overflow <= 0, `${overflow}px a mais`);

  const fonts = await browser.eval(
    `document.fonts.ready.then(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.weight + " " + f.style).join(", "))`,
  );
  const h1Font = await browser.eval("getComputedStyle(document.querySelector('h1')).fontFamily");
  check("Amsi carregada no título", /amsi/i.test(h1Font) && fonts.length > 0, `pesos: ${fonts}`);

  await browser.loadAllImages();
  const broken = await browser.eval(
    "[...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src)",
  );
  check("nenhuma imagem quebrada", broken.length === 0, broken.join(" "));
  const pending = await browser.eval(
    "[...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.alt || i.currentSrc)",
  );
  check("todas as imagens carregadas", pending.length === 0, pending.join(" | "));

  await browser.eval(`document.querySelector('#galeria [class*="grid"]').scrollIntoView({ block: "center", behavior: "instant" })`);
  await browser.wait(900);
  await browser.screenshot(`${OUT}/${name}-galeria.png`);
  await browser.eval("window.scrollTo(0, 0)");

  const facts = await browser.eval(`({
    h1: document.querySelector("h1").innerText.replace(/\\s+/g, " "),
    ctas: [...document.querySelectorAll("#inicio a")].map((a) => a.innerText.trim() + " → " + a.getAttribute("href")),
    sections: [...document.querySelectorAll("main > section, main > div > section")].map((s) => s.id || s.getAttribute("aria-label")),
    footer: document.querySelector("footer").innerText.replace(/\\s+/g, " "),
  })`);
  console.log(`        título: ${facts.h1}`);
  console.log(`        botões: ${facts.ctas.join(" | ")}`);
  console.log(`        seções: ${facts.sections.join(" · ")}`);
  check("CNPJ no rodapé", /CNPJ: \d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/.test(facts.footer), facts.footer.slice(0, 120));

  await browser.screenshot(`${OUT}/${name}.png`, { full: true });

  // --- propostas: expandir e recolher -------------------------------------
  const proposal = await browser.eval(`(async () => {
    const button = document.querySelector("#propostas h3 button");
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const before = { expanded: button.getAttribute("aria-expanded"), inert: panel.inert, h: panel.offsetHeight };
    button.click();
    await new Promise((r) => setTimeout(r, 450));
    const open = { expanded: button.getAttribute("aria-expanded"), inert: panel.inert, h: panel.offsetHeight };
    button.click();
    await new Promise((r) => setTimeout(r, 450));
    const closed = { expanded: button.getAttribute("aria-expanded"), inert: panel.inert, h: panel.offsetHeight };
    return { before, open, closed };
  })()`);
  check(
    "proposta abre",
    proposal.open.expanded === "true" && !proposal.open.inert && proposal.open.h > 40,
    `altura ${proposal.before.h} → ${proposal.open.h}px`,
  );
  check(
    "proposta fecha e sai da leitura",
    proposal.closed.expanded === "false" && proposal.closed.inert && proposal.closed.h === 0,
    `altura ${proposal.closed.h}px, inert=${proposal.closed.inert}`,
  );

  // --- galeria: lightbox --------------------------------------------------
  const opened = await browser.eval(`(async () => {
    document.querySelector("#galeria button[aria-label]").click();
    await new Promise((r) => setTimeout(r, 300));
    const d = document.querySelector("dialog[open]");
    return d ? { title: d.querySelector("p")?.innerText, img: !!d.querySelector("img") } : null;
  })()`);
  check("foto amplia no lightbox", Boolean(opened?.img), opened?.title ?? "não abriu");
  await pressEscape();
  await browser.wait(300);
  check("Escape fecha o lightbox", !(await browser.eval("!!document.querySelector('dialog[open]')")));

  // --- vídeos: dar play num pausa o outro -----------------------------------
  const videos = await browser.eval(`(async () => {
    const [a, b] = document.querySelectorAll("#galeria video");
    a.muted = b.muted = true;
    try { await a.play(); await b.play(); } catch (e) { return { error: String(e) }; }
    await new Promise((r) => setTimeout(r, 300));
    const result = { aPaused: a.paused, bPaused: b.paused };
    b.pause();
    return result;
  })()`);
  check(
    "play num vídeo pausa o outro",
    videos.aPaused === true && videos.bPaused === false,
    videos.error ?? `primeiro pausado=${videos.aPaused}`,
  );

  // --- carrossel de credenciais -----------------------------------------------
  const carousel = await browser.eval(`(async () => {
    const tabs = [...document.querySelectorAll('[role="tablist"] [role="tab"]')];
    if (!tabs.length) return null;
    const selected = () => tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const before = selected();
    tabs.at(-1).closest("[aria-roledescription]").querySelectorAll("button:not([role])")[1].click();
    await new Promise((r) => setTimeout(r, 200));
    return { count: tabs.length, before, after: selected() };
  })()`);
  check(
    "carrossel avança",
    carousel && carousel.after === (carousel.before + 1) % carousel.count,
    carousel ? `${carousel.count} itens, ${carousel.before} → ${carousel.after}` : "ausente",
  );

  if (!mobile) {
    // --- scrollspy ------------------------------------------------------------
    await browser.eval("document.getElementById('propostas').scrollIntoView({ behavior: 'instant' })");
    await browser.wait(500);
    const active = await browser.eval(
      "document.querySelector('header nav a[aria-current=\"true\"]')?.textContent ?? null",
    );
    check("scrollspy marca a seção visível", active !== null, `ativo: ${active}`);
  } else {
    // --- menu do celular ----------------------------------------------------
    await browser.eval("window.scrollTo(0, 0)");
    const menu = await browser.eval(`(async () => {
      const toggle = document.querySelector('header button[aria-controls="mobile-menu"]');
      const sheet = document.getElementById("mobile-menu");
      const donateHidden = getComputedStyle(document.querySelector("header .button")).display === "none";
      toggle.click();
      await new Promise((r) => setTimeout(r, 350));
      const open = sheet.open;
      const links = [...sheet.querySelectorAll("nav a")].map((a) => a.textContent.trim());
      sheet.querySelector("nav a").click();
      await new Promise((r) => setTimeout(r, 350));
      return { donateHidden, open, links, closedAfterLink: !sheet.open, hash: location.hash };
    })()`);
    check("botão de apoio some no topo do celular", menu.donateHidden);
    check("menu abre", menu.open, menu.links.join(" · "));
    check("tocar num link fecha o menu", menu.closedAfterLink, `foi para ${menu.hash}`);

    await browser.eval("document.querySelector('header button[aria-controls=\"mobile-menu\"]').click()");
    await browser.wait(300);
    await pressEscape();
    await browser.wait(300);
    check("Escape fecha o menu", !(await browser.eval("document.getElementById('mobile-menu').open")));

    const strip = await browser.eval(`(() => {
      const grid = document.querySelector("#galeria video").closest('[class*="videos"]');
      return { scrollable: grid.scrollWidth > grid.clientWidth, overflow: getComputedStyle(grid).overflowX };
    })()`);
    check("vídeos rolam de lado dentro da faixa", strip.scrollable, `overflow-x: ${strip.overflow}`);
  }

  const problems = [...new Set(browser.problems)];
  check("sem erro de JavaScript nem de CSP", problems.length === 0, problems.slice(0, 4).join(" | "));
}

await browser.close();
console.log(failures === 0 ? "\nTudo certo." : `\n${failures} falha(s).`);
process.exit(failures ? 1 : 0);
