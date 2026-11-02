// Oficina do Claude — cena 3D que encena o que o Claude Code está fazendo.
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

// ---------- palco ----------
const tela = document.getElementById("cena");
const render = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
render.setPixelRatio(Math.min(devicePixelRatio, 2));
render.shadowMap.enabled = true;
render.shadowMap.type = THREE.PCFSoftShadowMap;
render.toneMapping = THREE.ACESFilmicToneMapping;
render.outputColorSpace = THREE.SRGBColorSpace;

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
camera.position.set(19, 19, 21);
const controles = new OrbitControls(camera, tela);
controles.target.set(1.8, 0.5, 0.4);
controles.enableDamping = true;
controles.minDistance = 14; controles.maxDistance = 45;
controles.maxPolarAngle = Math.PI * 0.42;

cena.add(new THREE.HemisphereLight(0xCFE3FF, 0x3A2A20, 1.1));
const sol = new THREE.DirectionalLight(0xFFE2C4, 2.2);
sol.position.set(9, 16, 7);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14 });
sol.shadow.bias = -0.0005;
cena.add(sol);

function ajustar() {
  const w = innerWidth, h = innerHeight;
  render.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener("resize", ajustar);
ajustar();

// ---------- materiais e peças ----------
const mat = (cor, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: 0.75, metalness: 0.05, ...extra });
const caixa = (w, h, d, cor, r = 0.06) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), typeof cor === "object" ? cor : mat(cor));
  m.castShadow = m.receiveShadow = true;
  return m;
};
const cilindro = (r1, r2, h, cor, seg = 24) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), typeof cor === "object" ? cor : mat(cor));
  m.castShadow = m.receiveShadow = true;
  return m;
};
const em = (obj, x, y, z, ry = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; return obj; };

// chão de tábuas e paredes baixas (diorama)
function texturaTabuas() {
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const g = c.getContext("2d");
  for (let i = 0; i < 8; i++) {
    const tom = 120 + Math.random() * 25;
    g.fillStyle = `rgb(${tom + 40},${tom}, ${tom - 40})`;
    g.fillRect(0, i * 64, 512, 62);
    g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(0, i * 64 + 62, 512, 2);
    const corte = Math.random() * 512; g.fillRect(corte, i * 64, 2, 62);
    for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(60,30,10,${Math.random() * 0.08})`; g.fillRect(Math.random() * 512, i * 64 + Math.random() * 60, 40 + Math.random() * 80, 1); }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const chao = caixa(22, 0.5, 15, mat(0xffffff, { map: texturaTabuas(), roughness: 0.85 }), 0.15);
em(chao, 0, -0.25, 0); cena.add(chao);
const rodape = mat(0x2B3442);
cena.add(em(caixa(22, 0.9, 0.35, 0x3A4558), 0, 0.45, -7.65));
cena.add(em(caixa(0.35, 0.9, 15, 0x3A4558), -11.15, 0.45, 0));
const paredeFundo = em(caixa(22, 5.2, 0.3, 0x283140), 0, 2.6, -7.9); cena.add(paredeFundo);
const paredeLado = em(caixa(0.3, 5.2, 15.6, 0x222A36), -11.4, 2.6, 0); cena.add(paredeLado);
// janela com luz entrando
const janela = em(caixa(0.1, 2.2, 3.6, mat(0xFFE7B8, { emissive: 0xFFC46B, emissiveIntensity: 0.9 })), -11.22, 3.1, -1.6);
cena.add(janela);
cena.add(em(caixa(0.16, 2.2, 0.12, rodape), -11.15, 3.1, -1.6));
cena.add(em(caixa(0.16, 0.12, 3.6, rodape), -11.15, 3.1, -1.6));

// ---------- estações ----------
const ESTACOES = {};
function estacao(id, nome, x, z, montar, ponto) {
  const g = new THREE.Group(); g.position.set(x, 0, z); cena.add(g);
  const luz = new THREE.PointLight(0xFFAA55, 0, 5, 2); luz.position.set(0, 2.4, 0.8); g.add(luz);
  const extra = montar(g) || {};
  const el = document.createElement("div"); el.className = "etiqueta"; el.textContent = nome;
  document.getElementById("baloes").appendChild(el);
  ESTACOES[id] = { g, luz, el, nome, ponto: new THREE.Vector3(x + ponto[0], 0, z + ponto[1]), ...extra };
}

estacao("biblioteca", "Biblioteca", -8.3, -5.6, g => {
  const madeira = mat(0x5A3B28);
  g.add(em(caixa(3.4, 3.6, 0.12, madeira), 0, 1.8, -0.44));                       // fundo
  g.add(em(caixa(0.14, 3.6, 1, madeira), -1.63, 1.8, 0)); g.add(em(caixa(0.14, 3.6, 1, madeira), 1.63, 1.8, 0));
  g.add(em(caixa(3.4, 0.14, 1, madeira), 0, 3.55, 0));
  const cores = [0xD9573B, 0x3E7CB1, 0xE8B44C, 0x4FA36C, 0x8E5BB5, 0xEDE3D1];
  const livros = [];
  for (let p = 0; p < 3; p++) {
    g.add(em(caixa(3.1, 0.08, 0.85, 0x3E281A), 0, 0.55 + p * 1.05, 0.08));
    let x = -1.4;
    while (x < 1.35) {
      const w = 0.14 + Math.random() * 0.12, h = 0.6 + Math.random() * 0.28;
      const l = em(caixa(w, h, 0.62, cores[(Math.random() * cores.length) | 0], 0.02), x + w / 2, 0.6 + p * 1.05 + h / 2, 0.15);
      g.add(l); livros.push(l); x += w + 0.02;
    }
  }
  return { livros };
}, [0.6, 1.9]);

estacao("quadro", "Quadro de tarefas", -2, -6.9, g => {
  g.add(em(caixa(4.2, 2.4, 0.12, 0xF4F1EA), 0, 2.6, 0));
  g.add(em(caixa(4.4, 0.14, 0.2, 0x8A6A4A), 0, 1.36, 0.05));
  const cartoes = [];
  [0xFFD24D, 0x8FD3FF, 0xFF9E9E, 0xB8F2A0, 0xFFD24D, 0xD7B8FF].forEach((c, i) => {
    const k = em(caixa(0.7, 0.5, 0.03, c, 0.02), -1.3 + (i % 3) * 1.3, 3.2 - Math.floor(i / 3) * 0.75, 0.08);
    g.add(k); cartoes.push(k);
  });
  return { cartoes };
}, [0, 2.3]);

estacao("bancada", "Bancada", 3.6, -5.2, g => {
  g.add(em(caixa(4, 0.25, 1.6, 0x8B5A36), 0, 1.25, 0));
  for (const [x, z] of [[-1.8, -0.65], [1.8, -0.65], [-1.8, 0.65], [1.8, 0.65]]) g.add(em(caixa(0.18, 1.2, 0.18, 0x5A3B28), x, 0.6, z));
  g.add(em(caixa(0.9, 0.35, 0.5, 0x5B6573), -0.4, 1.55, 0));       // bigorna
  g.add(em(caixa(0.6, 0.3, 0.4, 0x3E7CB1), 1.1, 1.53, 0.2));       // caixa de peças
  const engrenagem = cilindro(0.35, 0.35, 0.1, 0xE8B44C, 10); engrenagem.rotation.x = Math.PI / 2; em(engrenagem, 1.1, 1.95, -0.4); g.add(engrenagem);
  g.add(em(caixa(4, 1.8, 0.1, 0x3A4558), 0, 2.4, -0.85));           // painel de ferramentas
  for (let i = 0; i < 6; i++) g.add(em(caixa(0.1, 0.6 + (i % 2) * 0.3, 0.06, 0xAEB6C2), -1.5 + i * 0.6, 2.5, -0.78));
  const faiscas = new THREE.Group(); faiscas.position.set(-0.4, 1.8, 0.1); g.add(faiscas);
  return { engrenagem, faiscas };
}, [0, 1.6]);

estacao("terminal", "Terminal", 8.4, -2.4, g => {
  g.add(em(caixa(1.8, 1.1, 1.3, 0x3A4558), 0, 0.55, 0));
  const monitor = em(caixa(2.2, 1.5, 0.25, 0x1D232D), 0, 1.95, -0.2); g.add(monitor);
  const c = document.createElement("canvas"); c.width = 256; c.height = 160;
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const telaT = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 1.25), new THREE.MeshBasicMaterial({ map: tex }));
  em(telaT, 0, 1.95, -0.07); g.add(telaT);
  g.add(em(caixa(1.4, 0.08, 0.5, 0x2B3442), 0, 1.14, 0.35));
  return { canvas: c, tex, linhas: ["$ pronto_"] };
}, [0, 1.7]);

estacao("antena", "Antena", 8.2, 4.4, g => {
  g.add(em(cilindro(0.5, 0.7, 0.4, 0x3A4558), 0, 0.2, 0));
  g.add(em(cilindro(0.08, 0.08, 1.8, 0xAEB6C2), 0, 1.3, 0));
  const prato = new THREE.Group(); prato.position.set(0, 2.25, 0); g.add(prato);
  const disco = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.32), mat(0xE9EDF2, { side: THREE.DoubleSide }));
  disco.rotation.x = -Math.PI / 2.4; disco.castShadow = true; prato.add(disco);
  const ponta = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 8), mat(0xFF8A3D, { emissive: 0xFF6A1A, emissiveIntensity: 1 }));
  ponta.position.set(0, 0.55, 0.7); prato.add(ponta);
  return { prato, ponta };
}, [-1.6, 0.4]);

estacao("reuniao", "Sala de reunião", 2.6, 3.4, g => {
  g.add(em(cilindro(1.5, 1.5, 0.15, 0x8B5A36, 40), 0, 1.0, 0));
  g.add(em(cilindro(0.2, 0.35, 1.0, 0x5A3B28), 0, 0.5, 0));
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + 0.4; g.add(em(caixa(0.6, 0.5, 0.6, 0x3E7CB1, 0.12), Math.cos(a) * 2.1, 0.25, Math.sin(a) * 2.1)); }
}, [-2.3, -0.3]);

estacao("sofa", "Cantinho do café", -6.2, 4.3, g => {
  g.add(em(caixa(3.2, 0.6, 1.3, 0xC8553D, 0.2), 0, 0.45, 0));
  g.add(em(caixa(3.2, 1.1, 0.4, 0xB24B35, 0.2), 0, 0.95, -0.55));
  g.add(em(caixa(0.4, 0.8, 1.3, 0xB24B35, 0.18), -1.6, 0.6, 0)); g.add(em(caixa(0.4, 0.8, 1.3, 0xB24B35, 0.18), 1.6, 0.6, 0));
  g.add(em(cilindro(0.5, 0.5, 0.08, 0x5A3B28), 2.6, 0.75, 0.3)); g.add(em(cilindro(0.06, 0.06, 0.75, 0x5A3B28), 2.6, 0.37, 0.3));
  g.add(em(cilindro(0.13, 0.11, 0.25, 0xF4F1EA), 2.6, 0.92, 0.3));
  const planta = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), mat(0x4FA36C, { flatShading: true })); em(planta, -2.6, 1.3, -0.4); planta.castShadow = true; g.add(planta);
  g.add(em(cilindro(0.35, 0.3, 0.6, 0xD9C7A8), -2.6, 0.3, -0.4));
}, [0, 1.3]);

estacao("correio", "Caixa de entrada", -9.4, 0.6, g => {
  g.add(em(caixa(0.18, 1.2, 0.18, 0x3A4558), 0, 0.6, 0));
  g.add(em(caixa(0.8, 0.6, 1.0, 0x3E7CB1, 0.25), 0, 1.45, 0));
  const bandeira = em(caixa(0.06, 0.4, 0.25, 0xE5484D, 0.02), 0.45, 1.6, 0.2); g.add(bandeira);
  return { bandeira };
}, [1.3, 0.2]);

// ---------- robô ----------
const PALETA = [0xFF8A3D, 0x3EC1D3, 0xB57BFF, 0x5BD47A, 0xFFD24D, 0xFF6B8B];
const FERRAMENTA_ESTACAO = [
  [/^(Read|Glob|Grep|LS|NotebookRead)$/, "biblioteca"],
  [/^(Edit|MultiEdit|Write|NotebookEdit)$/, "bancada"],
  [/^(Bash|BashOutput|KillShell|KillBash|PowerShell)$/, "terminal"],
  [/^(WebFetch|WebSearch)$|browser|navigate|chrome|playwright|fetch/i, "antena"],
  [/^(Task|Agent)$/, "reuniao"],
  [/^(TodoWrite|ExitPlanMode|EnterPlanMode)$|plan|todo|task/i, "quadro"],
];
const estacaoDe = f => (FERRAMENTA_ESTACAO.find(([re]) => re.test(f)) || [null, "bancada"])[1];

function rosto(canvas, expressao, piscando) {
  const g = canvas.getContext("2d");
  g.fillStyle = "#0E1A22"; g.fillRect(0, 0, 256, 192);
  g.strokeStyle = g.fillStyle = "#7DF9FF"; g.lineWidth = 14; g.lineCap = "round";
  g.shadowColor = "#7DF9FF"; g.shadowBlur = 18;
  const olho = (x) => {
    if (piscando || expressao === "sono") { g.beginPath(); g.moveTo(x - 22, 90); g.lineTo(x + 22, 90); g.stroke(); return; }
    if (expressao === "feliz") { g.beginPath(); g.arc(x, 100, 22, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return; }
    if (expressao === "foco") { g.fillRect(x - 24, 78, 48, 22); return; }
    if (expressao === "alerta") { g.beginPath(); g.arc(x, 88, 26, 0, Math.PI * 2); g.fill(); return; }
    g.beginPath(); g.ellipse(x, 88, 18, 26, 0, 0, Math.PI * 2); g.fill();
  };
  olho(88); olho(168);
  if (expressao === "alerta") { g.font = "bold 40px sans-serif"; g.fillText("!", 120, 170); }
  if (expressao === "sono") { g.font = "bold 30px sans-serif"; g.fillText("z", 200, 50); g.font = "bold 22px sans-serif"; g.fillText("z", 222, 30); }
}

class Robo {
  constructor(sessao, cor, pasta, escala = 1) {
    this.sessao = sessao; this.cor = cor; this.pasta = pasta;
    const g = this.g = new THREE.Group(); g.scale.setScalar(escala);
    const corpoMat = mat(cor, { roughness: 0.45, metalness: 0.15 });
    const cinza = mat(0x2B3442, { roughness: 0.5 });
    this.corpo = em(caixa(0.9, 0.85, 0.6, corpoMat, 0.18), 0, 1.0, 0); g.add(this.corpo);
    g.add(em(caixa(0.5, 0.25, 0.05, mat(0xF4F1EA), 0.04), 0, 1.05, 0.31));
    this.cabeca = new THREE.Group(); this.cabeca.position.set(0, 1.78, 0); g.add(this.cabeca);
    this.cabeca.add(caixa(1.05, 0.78, 0.75, cinza, 0.2));
    this.canvas = document.createElement("canvas"); this.canvas.width = 256; this.canvas.height = 192;
    this.tex = new THREE.CanvasTexture(this.canvas); this.tex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.6), new THREE.MeshBasicMaterial({ map: this.tex }));
    face.position.z = 0.38; this.cabeca.add(face);
    this.cabeca.add(em(cilindro(0.03, 0.03, 0.35, cinza), 0, 0.55, 0));
    this.luz = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 8), mat(cor, { emissive: cor, emissiveIntensity: 1.5 }));
    this.luz.position.y = 0.76; this.cabeca.add(this.luz);
    this.bracos = [-1, 1].map(s => { const b = new THREE.Group(); b.position.set(s * 0.56, 1.32, 0); b.add(em(caixa(0.2, 0.7, 0.2, cinza, 0.09), 0, -0.32, 0)); b.add(em(caixa(0.26, 0.2, 0.26, corpoMat, 0.1), 0, -0.72, 0)); g.add(b); return b; });
    this.pernas = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.24, 0.6, 0); p.add(em(caixa(0.24, 0.55, 0.24, cinza, 0.1), 0, -0.27, 0)); p.add(em(caixa(0.3, 0.14, 0.4, corpoMat, 0.06), 0, -0.55, 0.05)); g.add(p); return p; });
    this.alvo = null; this.estacao = null; this.acao = "parado"; this.expressao = "normal";
    this.proxPiscada = 2; this.t = Math.random() * 10;
    rosto(this.canvas, "normal"); this.tex.needsUpdate = true;
    this.balao = document.createElement("div"); this.balao.className = "balao"; this.balao.style.opacity = 0;
    document.getElementById("baloes").appendChild(this.balao);
    cena.add(g);
  }
  rosto(e) { this.expressao = e; rosto(this.canvas, e, false); this.tex.needsUpdate = true; }
  ir(estacaoId, desvio = 0) {
    const e = ESTACOES[estacaoId]; this.estacao = estacaoId;
    this.alvo = e.ponto.clone().add(new THREE.Vector3(desvio, 0, 0));
    this.olharPara = e.g.position.clone();
  }
  falar(html, classe = "", segundos = 6) {
    this.balao.innerHTML = html; this.balao.className = "balao " + classe; this.balao.style.opacity = 1;
    clearTimeout(this._t); this._t = setTimeout(() => (this.balao.style.opacity = 0), segundos * 1000);
  }
  passo(dt) {
    this.t += dt;
    const g = this.g;
    let andando = false;
    if (this.alvo) {
      const d = this.alvo.clone().sub(g.position); d.y = 0;
      const dist = d.length();
      if (dist > 0.05) {
        andando = true;
        const v = Math.min(dist, dt * 4.2);
        g.position.add(d.normalize().multiplyScalar(v));
        const ang = Math.atan2(d.x, d.z);
        g.rotation.y += ((((ang - g.rotation.y) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 10);
      } else if (this.olharPara) {
        const d2 = this.olharPara.clone().sub(g.position);
        const ang = Math.atan2(d2.x, d2.z);
        g.rotation.y += ((((ang - g.rotation.y) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 6);
      }
    }
    const s = Math.sin(this.t * 10);
    this.pernas[0].rotation.x = andando ? s * 0.6 : 0;
    this.pernas[1].rotation.x = andando ? -s * 0.6 : 0;
    this.corpo.position.y = 1.0 + (andando ? Math.abs(s) * 0.06 : Math.sin(this.t * 2) * 0.015);
    this.cabeca.position.y = this.corpo.position.y + 0.78;
    let bE = andando ? -s * 0.5 : 0, bD = andando ? s * 0.5 : 0;
    if (!andando) {
      const a = this.acao;
      if (a === "martelar") { bD = -1.4 + Math.abs(Math.sin(this.t * 9)) * 1.1; bE = -0.5; }
      else if (a === "digitar") { bE = -1.1 + Math.sin(this.t * 22) * 0.12; bD = -1.1 + Math.cos(this.t * 22) * 0.12; }
      else if (a === "ler") { bE = bD = -1.0; this.cabeca.rotation.x = 0.18; }
      else if (a === "escrever") { bD = -1.6 + Math.sin(this.t * 6) * 0.2; }
      else if (a === "acenar") { bD = -2.8 + Math.sin(this.t * 12) * 0.4; this.corpo.position.y += Math.abs(Math.sin(this.t * 6)) * 0.15; }
      else if (a === "antena") { bE = -2.6; this.cabeca.rotation.x = -0.25; }
      else if (a === "sentar") { this.corpo.position.y = 0.75; this.cabeca.position.y = 1.53; this.pernas.forEach(p => (p.rotation.x = -1.4)); }
      if (a !== "ler" && a !== "antena") this.cabeca.rotation.x *= 0.9;
    } else this.cabeca.rotation.x *= 0.9;
    this.bracos[0].rotation.x += (bE - this.bracos[0].rotation.x) * Math.min(1, dt * 12);
    this.bracos[1].rotation.x += (bD - this.bracos[1].rotation.x) * Math.min(1, dt * 12);
    this.luz.material.emissiveIntensity = 1.2 + Math.sin(this.t * 4) * 0.5;
    this.proxPiscada -= dt;
    if (this.proxPiscada < 0 && this.expressao === "normal") {
      rosto(this.canvas, this.expressao, true); this.tex.needsUpdate = true;
      setTimeout(() => this.rosto(this.expressao), 140);
      this.proxPiscada = 2.5 + Math.random() * 3;
    }
    const p = new THREE.Vector3(g.position.x, 2.9 * g.scale.y, g.position.z).project(camera);
    this.balao.style.left = ((p.x + 1) / 2) * innerWidth + "px";
    this.balao.style.top = ((1 - p.y) / 2) * innerHeight + "px";
  }
  remover() { cena.remove(this.g); this.balao.remove(); }
}

// ---------- som (Web Audio, panorâmico pela posição do robô) ----------
let audio = null;
const som = (tipo, x = 0) => {
  if (!audio) return;
  const t = audio.currentTime, pan = audio.createStereoPanner(); pan.pan.value = Math.max(-1, Math.min(1, x / 10));
  const vol = audio.createGain(); vol.connect(pan).connect(audio.destination);
  const osc = (f, ini, dur, forma = "sine", v = 0.15) => {
    const o = audio.createOscillator(); o.type = forma; o.frequency.value = f;
    const gg = audio.createGain(); gg.gain.setValueAtTime(v, t + ini); gg.gain.exponentialRampToValueAtTime(0.001, t + ini + dur);
    o.connect(gg).connect(vol); o.start(t + ini); o.stop(t + ini + dur);
  };
  if (tipo === "martelo") [0, 0.28, 0.56].forEach(d => osc(880 + Math.random() * 80, d, 0.12, "square", 0.05));
  if (tipo === "tecla") for (let i = 0; i < 6; i++) osc(1800 + Math.random() * 400, i * 0.07, 0.03, "square", 0.02);
  if (tipo === "pagina") osc(420, 0, 0.18, "triangle", 0.06);
  if (tipo === "sino") { osc(1318, 0, 0.9, "sine", 0.15); osc(1760, 0.15, 0.9, "sine", 0.1); }
  if (tipo === "chegou") { osc(660, 0, 0.12); osc(990, 0.1, 0.18); }
  if (tipo === "fim") { osc(784, 0, 0.2); osc(659, 0.15, 0.2); osc(523, 0.3, 0.35); }
};
document.getElementById("som").onclick = e => {
  if (audio) { audio.close(); audio = null; e.target.textContent = "🔇 Som"; }
  else { audio = new AudioContext(); e.target.textContent = "🔊 Som"; som("chegou"); }
};

// ---------- sessões e eventos ----------
const robos = new Map();
const mini = [];
const stats = { ferr: 0, arquivos: new Set(), cmd: 0, inicio: null, trabalhando: false, acumulado: 0 };
const ICONES = { biblioteca: "📚", bancada: "🔨", terminal: "💻", antena: "📡", reuniao: "👥", quadro: "📋", sofa: "☕", correio: "✉️" };
const VERBOS = { biblioteca: "Lendo", bancada: "Construindo", terminal: "Rodando", antena: "Pesquisando", reuniao: "Chamando ajuda para", quadro: "Organizando", correio: "Recebeu" };
const ACAO = { biblioteca: "ler", bancada: "martelar", terminal: "digitar", antena: "antena", reuniao: "parado", quadro: "escrever", sofa: "sentar", correio: "parado" };
const esc = t => String(t ?? "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

function robo(ev) {
  if (!robos.has(ev.sessao)) {
    const cor = PALETA[robos.size % PALETA.length];
    const r = new Robo(ev.sessao, cor, ev.pasta);
    r.g.position.copy(ESTACOES.correio.ponto).add(new THREE.Vector3(0.5, 0, robos.size * 0.9));
    r.indice = robos.size;
    robos.set(ev.sessao, r);
    desenharSessoes();
    document.getElementById("vazio").hidden = true;
  }
  return robos.get(ev.sessao);
}

function desenharSessoes() {
  document.getElementById("sessoes").innerHTML = [...robos.values()].map(r =>
    `<div class="sessao"><i style="background:#${r.cor.toString(16).padStart(6, "0")}"></i>${esc(r.pasta || "sessão")}<em>${r.sessao.slice(0, 6)}</em></div>`).join("");
}

function diario(icone, titulo, detalhe, erro = false) {
  const li = document.createElement("li");
  if (erro) li.className = "erro";
  li.innerHTML = `<span class="ic">${icone}</span><div><b>${esc(titulo)}</b><small>${esc(detalhe)}</small></div><time>${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>`;
  const ol = document.getElementById("diario");
  ol.prepend(li);
  while (ol.children.length > 80) ol.lastChild.remove();
}

function terminal(texto) {
  const t = ESTACOES.terminal;
  t.linhas.push("$ " + texto); if (t.linhas.length > 6) t.linhas.shift();
  const g = t.canvas.getContext("2d");
  g.fillStyle = "#0B1015"; g.fillRect(0, 0, 256, 160);
  g.font = "13px monospace"; g.fillStyle = "#5BD47A";
  t.linhas.forEach((l, i) => g.fillText(l.slice(0, 30), 10, 24 + i * 22));
  t.tex.needsUpdate = true;
}
terminal("oficina pronta");

function acender(id) {
  Object.entries(ESTACOES).forEach(([k, e]) => { e.alvoLuz = k === id ? 3 : 0; e.el.classList.toggle("ativa", k === id); });
}

function trabalhar(sim) {
  if (sim && !stats.trabalhando) stats.inicio = performance.now();
  if (!sim && stats.trabalhando) stats.acumulado += performance.now() - stats.inicio;
  stats.trabalhando = sim;
}

function tratar(ev, silencioso = false) {
  if (!ev.sessao) return;
  const r = robo(ev);
  if (ev.pasta) r.pasta = ev.pasta;
  const desvio = (r.indice % 3) * 0.7 - 0.7 * (r.indice % 3 ? 1 : 0);

  if (ev.tipo === "UserPromptSubmit") {
    r.ir("correio", desvio); r.acao = "parado"; r.rosto("feliz"); trabalhar(true);
    r.falar(`<b>Novo pedido:</b> ${esc(ev.mensagem || "…")}`);
    ESTACOES.correio.bandeira.rotation.z = -1.2; setTimeout(() => (ESTACOES.correio.bandeira.rotation.z = 0), 2500);
    diario("✉️", "Novo pedido", ev.mensagem); acender("correio"); if (!silencioso) som("chegou", r.g.position.x);
    return;
  }
  if (ev.tipo === "PreToolUse") {
    const id = estacaoDe(ev.ferramenta);
    stats.ferr++;
    if (["bancada", "biblioteca"].includes(id) && ev.detalhe) stats.arquivos.add(ev.detalhe);
    if (id === "terminal") { stats.cmd++; terminal(ev.detalhe || ev.ferramenta); }
    r.ir(id, desvio); r.acao = ACAO[id]; r.rosto(id === "reuniao" ? "feliz" : "foco"); trabalhar(true);
    const nome = ev.ferramenta.replace(/^mcp__[^_]+__/, "");
    r.falar(`${VERBOS[id]} <code>${esc(ev.detalhe || nome)}</code>`);
    diario(ICONES[id], `${VERBOS[id]} · ${nome}`, ev.detalhe);
    acender(id);
    if (id === "reuniao") chamarAjudante(r);
    if (!silencioso) som({ bancada: "martelo", terminal: "tecla", biblioteca: "pagina", quadro: "pagina", antena: "chegou" }[id], r.g.position.x);
    return;
  }
  if (ev.tipo === "PostToolUse" && ev.erro) {
    r.rosto("alerta"); r.falar("Ops, deu erro. Tentando de novo…", "alerta", 3);
    diario("⚠️", `Erro em ${ev.ferramenta}`, ev.detalhe, true);
    setTimeout(() => r.rosto("foco"), 1500);
    return;
  }
  if (ev.tipo === "Notification") {
    r.acao = "acenar"; r.rosto("alerta");
    r.falar(`<b>Preciso de você!</b>`, "alerta", 8);
    const a = document.getElementById("alerta");
    document.getElementById("alertaTexto").textContent = ev.mensagem || "Volte para o Claude Code.";
    a.hidden = false; clearTimeout(a._t); a._t = setTimeout(() => (a.hidden = true), 7000);
    diario("🔔", "Precisa de você", ev.mensagem);
    if (!silencioso) som("sino", r.g.position.x);
    return;
  }
  if (ev.tipo === "SubagentStop") { const m = mini.shift(); if (m) m.remover(); return; }
  if (ev.tipo === "Stop") {
    r.ir("sofa", desvio * 0.8); r.acao = "sentar"; r.rosto("sono"); trabalhar(false);
    r.falar("Pronto! Terminei. ☕", "", 5);
    diario("☕", "Terminou", ev.pasta); acender("sofa");
    mini.splice(0).forEach(m => m.remover());
    if (!silencioso) som("fim", r.g.position.x);
    return;
  }
  if (ev.tipo === "SessionEnd") { r.remover(); robos.delete(ev.sessao); desenharSessoes(); }
}

function chamarAjudante(r) {
  const m = new Robo("ajudante", r.cor, "", 0.55);
  m.g.position.copy(ESTACOES.reuniao.ponto).add(new THREE.Vector3(0, 0, 3));
  const a = mini.length * 1.2 + 1;
  m.alvo = ESTACOES.reuniao.g.position.clone().add(new THREE.Vector3(Math.cos(a) * 2.1, 0, Math.sin(a) * 2.1));
  m.olharPara = ESTACOES.reuniao.g.position.clone();
  m.rosto("feliz"); m.falar("Deixa comigo!", "", 3);
  mini.push(m);
  setTimeout(() => { const i = mini.indexOf(m); if (i >= 0) { mini.splice(i, 1); m.remover(); } }, 25000);
}

// ---------- conexão ----------
function conectar() {
  const fonte = new EventSource("/fluxo");
  const status = document.getElementById("status");
  fonte.onopen = () => { status.textContent = "ao vivo"; status.className = ""; };
  fonte.onerror = () => { status.textContent = "reconectando…"; status.className = "parado"; };
  fonte.addEventListener("historico", e => {
    JSON.parse(e.data).forEach(ev => tratar(ev, true));
    // quem abriu no meio do trabalho vê o robô já no lugar, sem a caminhada toda
    robos.forEach(r => { if (r.alvo) r.g.position.copy(r.alvo); r.balao.style.opacity = 0; });
    mini.splice(0).forEach(m => m.remover());
  });
  fonte.onmessage = e => tratar(JSON.parse(e.data));
}
conectar();

// ---------- laço ----------
const relogio = new THREE.Clock();
const faisca = new THREE.MeshBasicMaterial({ color: 0xFFC46B });
function animar() {
  const dt = Math.min(relogio.getDelta(), 0.05), t = relogio.elapsedTime;
  controles.update();
  robos.forEach(r => r.passo(dt));
  mini.forEach(m => m.passo(dt));
  Object.values(ESTACOES).forEach(e => {
    e.luz.intensity += ((e.alvoLuz || 0) - e.luz.intensity) * Math.min(1, dt * 4);
    const p = e.g.position.clone().add(new THREE.Vector3(0, 0.05, 1.5)).project(camera);
    e.el.style.left = ((p.x + 1) / 2) * innerWidth + "px";
    e.el.style.top = ((1 - p.y) / 2) * innerHeight + "px";
  });
  const ativo = id => [...robos.values()].some(r => r.estacao === id && r.alvo && r.g.position.distanceTo(r.alvo) < 0.1);
  ESTACOES.antena.prato.rotation.y = ativo("antena") ? t * 1.5 : Math.sin(t * 0.3) * 0.4;
  ESTACOES.antena.ponta.material.emissiveIntensity = ativo("antena") ? 1 + Math.sin(t * 12) : 0.6;
  ESTACOES.bancada.engrenagem.rotation.y = ativo("bancada") ? t * 3 : 0;
  // faíscas na bigorna quando o martelo bate
  const fa = ESTACOES.bancada.faiscas;
  if (ativo("bancada") && Math.random() < 0.3) {
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 2), faisca);
    p.userData.v = new THREE.Vector3((Math.random() - 0.5) * 3, 2 + Math.random() * 2, (Math.random() - 0.2) * 2); fa.add(p);
  }
  fa.children.slice().forEach(p => { p.userData.v.y -= 9 * dt; p.position.addScaledVector(p.userData.v, dt); if (p.position.y < -0.5) fa.remove(p); });
  ESTACOES.biblioteca.livros.forEach((l, i) => (l.position.z = 0.15 + (ativo("biblioteca") && i % 7 === Math.floor(t * 2) % 7 ? 0.25 : 0)));
  ESTACOES.quadro.cartoes.forEach((c, i) => (c.rotation.z = ativo("quadro") ? Math.sin(t * 3 + i) * 0.05 : 0));

  document.getElementById("nFerr").textContent = stats.ferr;
  document.getElementById("nArq").textContent = stats.arquivos.size;
  document.getElementById("nCmd").textContent = stats.cmd;
  const ms = stats.acumulado + (stats.trabalhando ? performance.now() - stats.inicio : 0);
  const seg = Math.floor(ms / 1000);
  document.getElementById("tempo").textContent = `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, "0")}`;

  render.render(cena, camera);
  requestAnimationFrame(animar);
}
animar();
