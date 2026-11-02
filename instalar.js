#!/usr/bin/env node
// Liga (ou desliga) os hooks da Oficina no Claude Code.
//   node instalar.js                  para todas as pastas (~/.claude/settings.json)
//   node instalar.js --projeto PASTA  só para um projeto (PASTA/.claude/settings.json)
//   node instalar.js --remover        desliga (também aceita --projeto)
// Faz backup do settings.json antes de mexer e não toca nos outros hooks.

const fs = require("fs");
const os = require("os");
const path = require("path");

const EVENTOS = ["UserPromptSubmit", "PreToolUse", "PostToolUse", "Notification", "Stop", "SubagentStop", "SessionStart", "SessionEnd"];
const HOOK = path.join(__dirname, "hook.js");
const MARCA = "oficina-do-claude";
const comando = `node "${HOOK.replace(/\\/g, "/")}" # ${MARCA}`;

const args = process.argv.slice(2);
const remover = args.includes("--remover");
const iProj = args.indexOf("--projeto");
const base = iProj >= 0 ? path.join(path.resolve(args[iProj + 1] || "."), ".claude") : path.join(os.homedir(), ".claude");
const arquivo = path.join(base, "settings.json");

let cfg = {};
if (fs.existsSync(arquivo)) {
  try {
    cfg = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  } catch {
    console.error(`Não consegui ler ${arquivo} (JSON inválido). Corrija o arquivo e tente de novo.`);
    process.exit(1);
  }
  const backup = `${arquivo}.antes-da-oficina-${Date.now()}.bak`;
  fs.copyFileSync(arquivo, backup);
  console.log(`Backup: ${backup}`);
}

cfg.hooks = cfg.hooks || {};
for (const ev of EVENTOS) {
  // tira qualquer versão antiga da Oficina e mantém os hooks de outras ferramentas
  const grupos = (cfg.hooks[ev] || [])
    .map(g => ({ ...g, hooks: (g.hooks || []).filter(h => !String(h.command || "").includes(MARCA)) }))
    .filter(g => g.hooks.length);
  if (!remover) grupos.push({ ...(ev.endsWith("ToolUse") ? { matcher: "*" } : {}), hooks: [{ type: "command", command: comando, timeout: 3 }] });
  if (grupos.length) cfg.hooks[ev] = grupos;
  else delete cfg.hooks[ev];
}
if (!Object.keys(cfg.hooks).length) delete cfg.hooks;

fs.mkdirSync(base, { recursive: true });
fs.writeFileSync(arquivo, JSON.stringify(cfg, null, 2) + "\n");

if (remover) {
  console.log(`Oficina desligada em ${arquivo}.`);
} else {
  console.log(`Oficina ligada em ${arquivo}.`);
  console.log("Agora abra a oficina com:  node servidor.js");
  console.log("e use o Claude Code normalmente (sessões já abertas podem precisar ser reiniciadas).");
}
