<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0A09,100:D97757&height=170&section=header&text=Oficina%20do%20Claude&fontSize=50&fontColor=F3EDE6&fontAlignY=36&desc=O%20Claude%20Code%20trabalhando%20em%203D%20%C2%B7%20gr%C3%A1tis%20da%20F%C3%A1brica%20de%20Canais&descAlignY=58&descSize=16" width="100%" alt="Oficina do Claude" />

<a href="https://sparks-gamesstudio.github.io/fabrica-de-canais/"><img src="https://sparks-gamesstudio.github.io/fabrica-de-canais/marca/simbolo-1024.png" width="84" alt="Fábrica de Canais" /></a>

**Veja o Claude Code trabalhando numa oficina 3D, ao vivo, enquanto ele mexe no seu projeto.**

<p>
  <img src="https://img.shields.io/badge/gr%C3%A1tis-0B0A09?style=for-the-badge" alt="Grátis" />
  <img src="https://img.shields.io/badge/roda%20no%20Windows-D97757?style=for-the-badge&logo=windows&logoColor=white" alt="Roda no Windows" />
  <img src="https://img.shields.io/badge/s%C3%B3%20Node.js-F3EDE6?style=for-the-badge&logo=nodedotjs&logoColor=0B0A09" alt="Só Node.js" />
  <img src="https://img.shields.io/badge/nada%20sai%20do%20PC-0B0A09?style=for-the-badge" alt="Nada sai do PC" />
</p>

<p>
  <a href="#instalacao"><img src="https://img.shields.io/badge/%E2%AC%87%EF%B8%8F%20Como%20instalar-D97757?style=for-the-badge" alt="Como instalar" /></a>
  <a href="https://sparks-gamesstudio.github.io/fabrica-de-canais/github.html"><img src="https://img.shields.io/badge/Mais%20projetos%20gr%C3%A1tis-0B0A09?style=for-the-badge&logo=github&logoColor=D97757" alt="Mais projetos grátis" /></a>
  <img src="https://img.shields.io/github/stars/sparks-gamesstudio/oficina-do-claude?style=for-the-badge&color=D97757&label=%E2%AD%90" alt="Estrelas" />
</p>

<img src="docs/bancada.jpg" width="100%" alt="O robô construindo na bancada da oficina" />

</div>

## 👋 O Rebite explica

<img align="right" src="https://raw.githubusercontent.com/sparks-gamesstudio/sparks-gamesstudio/main/assets/rebite/acenar.jpg" width="170" alt="Rebite, o mascote da Fábrica de Canais" />

> Sabe aquela hora em que o Claude Code está trabalhando e você fica olhando um monte de texto passar? Aqui cada ferramenta que ele usa vira uma estação de uma oficina, e um robozinho anda de uma para outra fazendo o serviço. Dá para acompanhar tudo de longe, e quando ele precisa de você, toca um sino.

<br clear="right" />

## 🛠️ O que você vê

| Quando o Claude… | O robô… |
|---|---|
| recebe um pedido seu | vai buscar a carta na **caixa de entrada** |
| lê ou procura arquivos | folheia livros na **biblioteca** |
| cria ou edita arquivos | martela na **bancada**, soltando faíscas |
| roda um comando | digita no **terminal**, que mostra o comando na tela |
| pesquisa na web | gira a **antena** |
| organiza tarefas ou planos | cola cartões no **quadro de tarefas** |
| chama um subagente | um **mini-robô ajudante** senta na sala de reunião |
| precisa da sua permissão | acena, toca um sino e mostra um alerta amarelo |
| termina | senta no **cantinho do café** e cochila |

Tem também um diário de bordo com tudo o que aconteceu, um placar (ferramentas, arquivos, comandos e tempo trabalhando), som opcional e um robô de cor diferente para cada sessão do Claude Code aberta ao mesmo tempo.

| | |
|---|---|
| ![Lendo na biblioteca](docs/biblioteca.jpg) | ![Pesquisando na antena](docs/antena.jpg) |
| ![O Claude precisa de você](docs/alerta.jpg) | |

<a id="instalacao"></a>
## ⬇️ Instalação

Precisa do [Claude Code](https://claude.com/claude-code) e do [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
git clone https://github.com/sparks-gamesstudio/oficina-do-claude.git
cd oficina-do-claude
node instalar.js
node servidor.js
```

O `instalar.js` liga os hooks no seu `~/.claude/settings.json`. Ele faz backup antes e não mexe nos hooks que você já tem. O `servidor.js` abre a oficina em http://localhost:4003. Depois é só usar o Claude Code normalmente. Sessões que já estavam abertas podem precisar ser reiniciadas.

<table>
<tr>
<td width="100"><img src="https://raw.githubusercontent.com/sparks-gamesstudio/sparks-gamesstudio/main/assets/rebite/joinha.jpg" width="90" alt="Rebite fazendo joinha" /></td>
<td>Só quer ver como é? Rode <code>node servidor.js --demo</code>: a oficina encena uma sessão de exemplo, sem precisar do Claude Code.</td>
</tr>
</table>

| Comando | O que faz |
|---|---|
| `node instalar.js --projeto C:\meu\projeto` | liga só para um projeto |
| `node instalar.js --remover` | desliga (aceita `--projeto` também) |
| `OFICINA_PORTA=5000 node servidor.js` | usa outra porta |

## 🔒 Privacidade

<table>
<tr>
<td width="100"><img src="https://raw.githubusercontent.com/sparks-gamesstudio/sparks-gamesstudio/main/assets/rebite/pensar.jpg" width="90" alt="Rebite pensando" /></td>
<td>O hook manda para o servidor local só o tipo do evento, o nome da ferramenta e um resumo curto (nome do arquivo, primeira linha do comando, termo pesquisado). Nunca manda conteúdo de arquivo nem resposta do Claude. Tudo fica em <code>127.0.0.1</code>, e se a oficina estiver fechada o hook sai em silêncio, sem atrasar o Claude.</td>
</tr>
</table>

## 🧩 Por dentro

| Arquivo | O que faz |
|---|---|
| `hook.js` | recebe o evento do Claude Code e repassa para a oficina (Node puro, sem bash nem jq) |
| `servidor.js` | servidor local sem dependências; transmite os eventos para a página |
| `instalar.js` | liga e desliga os hooks com backup |
| `pagina/oficina.js` | a cena 3D (Three.js): estações, robôs, animações, sons e balões |

## 🙌 Créditos

Inspirado no [Vibecraft](https://github.com/Nearcyan/vibecraft) (MIT), que mostra o Claude Code em 3D no macOS e no Linux. Esta versão foi escrita do zero, roda também no Windows, não precisa de tmux nem de jq e está toda em português.

---

<div align="center">

<a href="https://sparks-gamesstudio.github.io/fabrica-de-canais/"><img src="https://sparks-gamesstudio.github.io/fabrica-de-canais/marca/simbolo-1024.png" width="56" alt="Fábrica de Canais" /></a>

Feito pela **[Fábrica de Canais](https://sparks-gamesstudio.github.io/fabrica-de-canais/)**, skills de Claude Code para canais de vídeo no piloto automático.

<a href="https://instagram.com/afabricadecanais"><img src="https://img.shields.io/badge/@afabricadecanais-E4405F?style=flat-square&logo=instagram&logoColor=white" alt="Instagram" /></a>
<a href="https://github.com/sparks-gamesstudio"><img src="https://img.shields.io/badge/mais%20projetos-0B0A09?style=flat-square&logo=github&logoColor=D97757" alt="Mais projetos" /></a>

<sub>Licença MIT · use, modifique e compartilhe. Se ajudou, deixa uma ⭐</sub>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:D97757,100:0B0A09&height=90&section=footer" width="100%" alt="" />

</div>
