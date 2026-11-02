#!/usr/bin/env node
// Oficina do Claude: recebe os eventos dos hooks e transmite para a página 3D.
//   node servidor.js            abre em http://localhost:4003
//   node servidor.js --demo     encena uma sessão de exemplo (sem precisar do Claude Code)

const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORTA = Number(process.env.OFICINA_PORTA || 4003);
const PAGINA = path.join(__dirname, "pagina");
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png" };

const ouvintes = new Set();
const recentes = []; // os últimos eventos, para quem abrir a página no meio do trabalho

function transmitir(ev) {
  recentes.push(ev);
  if (recentes.length > 200) recentes.shift();
  const linha = `data: ${JSON.stringify(ev)}\n\n`;
  for (const res of ouvintes) res.write(linha);
}

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "POST" && url.pathname === "/evento") {
    let corpo = "";
    req.on("data", c => (corpo += c).length > 1e5 && req.destroy());
    req.on("end", () => {
      try { transmitir(JSON.parse(corpo)); } catch {}
      res.writeHead(204).end();
    });
    return;
  }

  if (url.pathname === "/fluxo") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
    res.write(`event: historico\ndata: ${JSON.stringify(recentes)}\n\n`);
    ouvintes.add(res);
    const pulso = setInterval(() => res.write(": ping\n\n"), 20000);
    req.on("close", () => { ouvintes.delete(res); clearInterval(pulso); });
    return;
  }

  const arquivo = path.join(PAGINA, url.pathname === "/" ? "index.html" : path.normalize(url.pathname));
  if (!arquivo.startsWith(PAGINA)) return res.writeHead(403).end();
  fs.readFile(arquivo, (erro, dados) => {
    if (erro) return res.writeHead(404).end("não encontrado");
    res.writeHead(200, { "Content-Type": (TIPOS[path.extname(arquivo)] || "application/octet-stream") + "; charset=utf-8" });
    res.end(dados);
  });
});

function abrirNavegador(url) {
  const cmd = process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
  exec(cmd);
}

// ---------- demonstração ----------
function demo() {
  const s = "demo-" + Date.now();
  const roteiro = [
    ["UserPromptSubmit", "", "", 1500, "adiciona um botão de modo escuro no site"],
    ["PreToolUse", "Glob", "src/**/*.css", 1800], ["PreToolUse", "Read", "estilos.css", 2600], ["PreToolUse", "Read", "index.html", 2200],
    ["PreToolUse", "TodoWrite", "3 tarefas", 2200],
    ["PreToolUse", "Edit", "estilos.css", 3200], ["PreToolUse", "Edit", "index.html", 3000], ["PreToolUse", "Write", "tema.js", 3200],
    ["PreToolUse", "WebSearch", "prefers-color-scheme suporte", 2600],
    ["PreToolUse", "Task", "revisar acessibilidade", 4200],
    ["PreToolUse", "Bash", "npm test", 3400], ["Notification", "", "", 3500, "Claude precisa da sua permissão para rodar npm run build"],
    ["PreToolUse", "Bash", "npm run build", 3200], ["Stop", "", "", 6000],
  ];
  let i = 0;
  const passo = () => {
    const [tipo, ferramenta, detalhe, espera, mensagem] = roteiro[i % roteiro.length];
    transmitir({ tipo, sessao: s, pasta: "meu-site", ferramenta, detalhe, mensagem: mensagem || "", erro: false, t: Date.now() });
    i++;
    setTimeout(passo, espera);
  };
  setTimeout(passo, 1500);
}

servidor.listen(PORTA, "127.0.0.1", () => {
  const url = `http://localhost:${PORTA}`;
  console.log(`Oficina do Claude aberta em ${url}  (Ctrl+C para fechar)`);
  if (process.argv.includes("--demo")) { console.log("Modo demonstração ligado."); demo(); }
  if (!process.argv.includes("--sem-navegador")) abrirNavegador(url);
});
servidor.on("error", e => {
  if (e.code === "EADDRINUSE") { console.log(`A Oficina já está aberta em http://localhost:${PORTA}`); process.exit(0); }
  throw e;
});
