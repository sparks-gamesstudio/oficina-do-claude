#!/usr/bin/env node
// Hook do Claude Code: manda cada evento para a Oficina (servidor local).
// Nunca atrapalha o Claude: se a Oficina estiver fechada, sai em silêncio.

const http = require("http");
const path = require("path");

const PORTA = Number(process.env.OFICINA_PORTA || 4003);

function resumo(nome, entrada = {}) {
  const arq = entrada.file_path || entrada.notebook_path || entrada.path;
  if (arq) return path.basename(String(arq));
  if (entrada.command) return String(entrada.command).split("\n")[0].slice(0, 80);
  if (entrada.pattern) return String(entrada.pattern).slice(0, 60);
  if (entrada.url) return String(entrada.url).replace(/^https?:\/\//, "").slice(0, 60);
  if (entrada.query) return String(entrada.query).slice(0, 60);
  if (entrada.description) return String(entrada.description).slice(0, 60);
  if (entrada.prompt) return String(entrada.prompt).slice(0, 60);
  return "";
}

let bruto = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", c => (bruto += c));
process.stdin.on("end", () => {
  let e = {};
  try { e = JSON.parse(bruto || "{}"); } catch { process.exit(0); }

  // só o necessário: nada de conteúdo de arquivo ou resposta inteira sai daqui
  const evento = {
    tipo: e.hook_event_name,
    sessao: e.session_id,
    pasta: e.cwd ? path.basename(e.cwd) : "",
    ferramenta: e.tool_name || "",
    detalhe: resumo(e.tool_name, e.tool_input),
    erro: Boolean(e.tool_response && (e.tool_response.is_error || e.tool_response.error)),
    mensagem: (e.message || e.prompt || "").slice(0, 140),
    t: Date.now(),
  };

  const corpo = JSON.stringify(evento);
  const req = http.request(
    { host: "127.0.0.1", port: PORTA, path: "/evento", method: "POST", timeout: 600,
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(corpo) } },
    res => { res.resume(); res.on("end", () => process.exit(0)); }
  );
  req.on("error", () => process.exit(0));
  req.on("timeout", () => { req.destroy(); process.exit(0); });
  req.end(corpo);
});
