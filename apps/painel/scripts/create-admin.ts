/**
 * Cria o primeiro administrador do painel.
 *
 * Existe porque o cadastro público está desligado — e continua desligado. Roda
 * localmente, contra o banco, uma vez.
 *
 * A senha nunca vem de argumento: argumento fica no histórico do shell e na
 * lista de processos. No terminal, é perguntada; canalizada (`pass show … |`),
 * é lida da entrada padrão, uma resposta por linha.
 *
 * Quem nasce aqui ainda passa pelo cadastro obrigatório do segundo fator no
 * primeiro acesso — este script não dá nenhum atalho.
 */
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { auth } from "../lib/auth";

const LABELS = ["Nome: ", "E-mail: ", "Senha (mínimo 12 caracteres): "];

async function readAnswers(): Promise<string[]> {
  if (stdin.isTTY) {
    const rl = createInterface({ input: stdin, output: stdout });
    const answers: string[] = [];
    for (const label of LABELS) answers.push(await rl.question(label));
    rl.close();
    return answers;
  }

  // Entrada canalizada: `readline.question` não avança de linha sem TTY.
  const text = await new Promise<string>((resolve) => {
    let buffer = "";
    stdin.setEncoding("utf8");
    stdin.on("data", (chunk) => (buffer += chunk));
    stdin.on("end", () => resolve(buffer));
  });
  return text.split("\n");
}

// Envolvido numa função porque o app não é ESM: top-level await não compila.
async function main() {
  const [rawName, rawEmail, password] = await readAnswers();
  const name = rawName?.trim();
  const email = rawEmail?.trim();

  if (!name || !email || !password) {
    console.error("Informe nome, e-mail e senha.");
    process.exit(1);
  }

  if (password.length < 12) {
    console.error("A senha precisa de pelo menos 12 caracteres.");
    process.exit(1);
  }

  const result = await auth.api.createUser({
    body: { name, email, password, role: "admin" },
  });

  console.log(`\n${result.user.email} criado.`);
  console.log("No primeiro acesso o painel exigirá o cadastro do 2FA.");
}

main().catch((error) => {
  console.error("\nFalhou:", error instanceof Error ? error.message : error);
  process.exit(1);
});
