// Build the front and back SVGs.
// Two outputs per side:
//   gtm_prospec_<side>.svg          — uses relative href to PNGs in assets/ (small file, easy to edit)
//   build/gtm_prospec_<side>_embed.svg — same SVG with PNGs embedded as base64 data URIs (self-contained, used for PDF conversion)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');
const build = path.join(root, 'build');
if (!fs.existsSync(build)) fs.mkdirSync(build);

function b64(file) {
  const buf = fs.readFileSync(path.join(assets, file));
  return 'data:image/png;base64,' + buf.toString('base64');
}

// =========================================================================
// EDIT-ME: contatos do escritório (rodapé do verso)
// Troque pelos dados reais antes de mandar pra gráfica.
// =========================================================================
const FIRM = {
  instagram: '@gtm.advocacia',
  email:     'contato@gtmadvocacia.com.br',
};

// Logo dims after trim — read from the actual processed PNG so the SVG
// always matches the real bbox.
const sharp = require('sharp');
async function getAspect() {
  const m = await sharp(path.join(assets, 'gtm_logo_dark.png')).metadata();
  return { w: m.width, h: m.height, aspect: m.width / m.height };
}
let LOGO_W, LOGO_H, aspect;

const STYLE = `<![CDATA[
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
  .pf  { font-family: 'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif; font-weight: 400; }
  .pfi { font-family: 'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif; font-weight: 400; font-style: italic; }
  .inter { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-weight: 400; }
  .interi { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-weight: 400; font-style: italic; }
]]>`;

// =========================================================================
// FRENTE  — logo dominante + decoração + manifesto compacto
// =========================================================================
function buildFront(logoHref) {
  // Logo grande, deslocado um pouco para cima pra abrir espaço pra ornamento
  const lh = 230;
  const lw = +(lh * aspect).toFixed(2);
  const lx = (960 - lw) / 2;
  const ly = 55;

  // Ornamento decorativo (linha fina + pontilhado) logo abaixo do logo
  const ornY = 320;

  // Manifesto em duas linhas — sem encostar nas margens, com line-height generoso
  const HEAD = 28;
  const line1Y = 385;
  const line2Y = line1Y + HEAD * 1.3;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560" width="960" height="560">
  <defs>
    <style>${STYLE}</style>
    <radialGradient id="bgFront" cx="50%" cy="42%" r="80%">
      <stop offset="0%" stop-color="#26443D"/>
      <stop offset="60%" stop-color="#1F3A35"/>
      <stop offset="100%" stop-color="#162923"/>
    </radialGradient>
  </defs>

  <!-- fundo com sangria — gradiente radial sutil pra dar profundidade -->
  <rect x="0" y="0" width="960" height="560" fill="url(#bgFront)"/>

  <!-- logo (claro) dominante, centralizado -->
  <image href="${logoHref}" x="${lx}" y="${ly}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMin meet"/>

  <!-- ornamento: linhas finas com pontilhado central -->
  <g fill="none" stroke="#8FC9B8" stroke-opacity="0.55" stroke-linecap="round">
    <line x1="350" y1="${ornY}" x2="430" y2="${ornY}" stroke-width="0.6"/>
    <circle cx="450" cy="${ornY}" r="1.4" fill="#8FC9B8" fill-opacity="0.7" stroke="none"/>
    <circle cx="480" cy="${ornY}" r="1.4" fill="#8FC9B8" fill-opacity="0.7" stroke="none"/>
    <circle cx="510" cy="${ornY}" r="1.4" fill="#8FC9B8" fill-opacity="0.7" stroke="none"/>
    <line x1="530" y1="${ornY}" x2="610" y2="${ornY}" stroke-width="0.6"/>
  </g>

  <!-- MANIFESTO -->
  <text x="480" y="${line1Y}" text-anchor="middle" class="pf"
        font-size="${HEAD}" fill="#F5F1E8" letter-spacing="0.01em">
    A advocacia <tspan class="pfi" fill="#8FC9B8">mudou.</tspan>
  </text>
  <text x="480" y="${line2Y}" text-anchor="middle" class="pf"
        font-size="${HEAD}" fill="#F5F1E8" letter-spacing="0.01em">
    Só esqueceram de avisar os advogados.
  </text>

  <!-- @ Instagram (canto inferior esquerdo) -->
  <text x="60" y="508" text-anchor="start" class="inter"
        font-size="10" fill="#8FC9B8" fill-opacity="0.78" letter-spacing="0.16em" font-weight="500">
    ${FIRM.instagram}
  </text>

  <!-- indicador "vire" — refinado com linha curta de acompanhamento -->
  <g>
    <line x1="800" y1="505" x2="860" y2="505" stroke="#8FC9B8" stroke-opacity="0.45" stroke-width="0.6"/>
    <text x="900" y="508" text-anchor="end" class="inter"
          font-size="10" fill="#8FC9B8" fill-opacity="0.75" letter-spacing="0.32em" font-weight="500">
      VIRE
    </text>
  </g>
</svg>
`;
}

// =========================================================================
// VERSO — 3 colunas (nome / telefone / QR / whatsapp) + rodapé com contato do escritório
// Sem áreas — o escritório atua em múltiplas frentes, então não nichamos.
// =========================================================================
const PEOPLE = [
  { cx: 200, name: 'João Giovanini',    phone: '(61) 99945-4564', qr: 'qr_joao.png'     },
  { cx: 480, name: 'Giovanna Trombini', phone: '(61) 99695-8863', qr: 'qr_giovanna.png' },
  { cx: 760, name: 'Rafael Mansur',     phone: '(61) 99269-7534', qr: 'qr_rafael.png'   },
];

// Áreas atendidas pelo escritório — faixa única (não atribuída a sócio).
// Editar aqui para incluir/excluir áreas.
const PRACTICE_AREAS = [
  'Trabalhista', 'Digital', 'Servidor Público',
  'Cível', 'Penal', 'Administrativo',
];

function buildBack(logoHrefDark, qrHrefMap) {
  // Logo (escuro) no topo, centralizado
  const lh = 54;
  const lw = +(lh * aspect).toFixed(2);
  const lx = (960 - lw) / 2;
  const ly = 36;

  // Ornamento ecoando o da frente — pontilhado em mint escuro
  const ornY = 122;

  // Headline em itálico Playfair
  const headlineY = 158;

  // Bloco das 3 colunas — sem linha de área por sócio (áreas vão numa faixa única abaixo)
  const yName  = 200;
  const yPhone = 232;
  const qrTop  = 252;
  const qrSize = 108;
  const yLabel = qrTop + qrSize + 14; // 374

  // Divisórias entre colunas (mais sutis, com pontinho central)
  const divX1 = 340, divX2 = 620;
  const divY1 = 188, divY2 = 382;
  const divCY = (divY1 + divY2) / 2;

  // Faixa de áreas (entre as colunas e o rodapé)
  const areasY = 420;
  const areasText = PRACTICE_AREAS.join('  ·  ');

  // Rodapé com contatos do escritório
  const footY1 = 460;
  const footYText = 490;

  const personSvg = (p) => `
    <!-- ${p.name} -->
    <text x="${p.cx}" y="${yName}" text-anchor="middle" class="pf" font-size="22" fill="#1F3A35" letter-spacing="0.02em">${p.name}</text>
    <text x="${p.cx}" y="${yPhone}" text-anchor="middle" class="inter" font-size="14" fill="#1F3A35" font-weight="500" letter-spacing="0.03em">${p.phone}</text>
    <image href="${qrHrefMap[p.qr]}" x="${p.cx - qrSize/2}" y="${qrTop}" width="${qrSize}" height="${qrSize}"/>
    <text x="${p.cx}" y="${yLabel}" text-anchor="middle" class="inter" font-size="9" fill="#5A8578" letter-spacing="0.4em" font-weight="500">WHATSAPP</text>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560" width="960" height="560">
  <defs>
    <style>${STYLE}</style>
    <radialGradient id="bgBack" cx="50%" cy="50%" r="80%">
      <stop offset="0%" stop-color="#F4EFE4"/>
      <stop offset="100%" stop-color="#ECE6D8"/>
    </radialGradient>
  </defs>

  <!-- fundo com sangria — variação muito sutil de bege -->
  <rect x="0" y="0" width="960" height="560" fill="url(#bgBack)"/>

  <!-- logo (escuro) no topo, centralizado -->
  <image href="${logoHrefDark}" x="${lx}" y="${ly}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMin meet"/>

  <!-- ornamento decorativo (ecoa o da frente) -->
  <g stroke="#5A8578" stroke-opacity="0.55" stroke-linecap="round">
    <line x1="370" y1="${ornY}" x2="440" y2="${ornY}" stroke-width="0.6"/>
    <circle cx="455" cy="${ornY}" r="1.4" fill="#5A8578" fill-opacity="0.75" stroke="none"/>
    <circle cx="480" cy="${ornY}" r="1.4" fill="#5A8578" fill-opacity="0.75" stroke="none"/>
    <circle cx="505" cy="${ornY}" r="1.4" fill="#5A8578" fill-opacity="0.75" stroke="none"/>
    <line x1="520" y1="${ornY}" x2="590" y2="${ornY}" stroke-width="0.6"/>
  </g>

  <!-- HEADLINE — itálico Playfair, ar boutique -->
  <text x="480" y="${headlineY}" text-anchor="middle" class="pfi" font-size="24" fill="#1F3A35" letter-spacing="0.01em">
    Fale direto com um sócio.
  </text>

  <!-- divisórias verticais entre as colunas — com pontinho central -->
  <g stroke="#1F3A35" stroke-opacity="0.18" stroke-width="0.8" stroke-linecap="round">
    <line x1="${divX1}" y1="${divY1}" x2="${divX1}" y2="${divCY - 5}"/>
    <line x1="${divX1}" y1="${divCY + 5}" x2="${divX1}" y2="${divY2}"/>
    <line x1="${divX2}" y1="${divY1}" x2="${divX2}" y2="${divCY - 5}"/>
    <line x1="${divX2}" y1="${divCY + 5}" x2="${divX2}" y2="${divY2}"/>
  </g>
  <circle cx="${divX1}" cy="${divCY}" r="1.6" fill="#1F3A35" fill-opacity="0.35"/>
  <circle cx="${divX2}" cy="${divCY}" r="1.6" fill="#1F3A35" fill-opacity="0.35"/>

  ${PEOPLE.map(personSvg).join('\n')}

  <!-- faixa de áreas atendidas — sem nichoizar por sócio -->
  <text x="480" y="${areasY}" text-anchor="middle" class="inter"
        font-size="10.5" fill="#5A8578" letter-spacing="0.08em">
    ${areasText}
  </text>

  <!-- separador horizontal acima do rodapé -->
  <g stroke="#1F3A35" stroke-opacity="0.18" stroke-width="0.6" stroke-linecap="round">
    <line x1="120" y1="${footY1}" x2="460" y2="${footY1}"/>
    <line x1="500" y1="${footY1}" x2="840" y2="${footY1}"/>
  </g>
  <circle cx="480" cy="${footY1}" r="1.6" fill="#1F3A35" fill-opacity="0.35"/>

  <!-- rodapé: contato do escritório -->
  <text x="480" y="${footYText}" text-anchor="middle" class="inter" font-size="11" fill="#1F3A35" letter-spacing="0.16em">
    ${FIRM.instagram}<tspan dx="18" fill="#5A8578">·</tspan><tspan dx="18">${FIRM.email}</tspan>
  </text>
</svg>
`;
}

(async () => {
const meta = await getAspect();
LOGO_W = meta.w; LOGO_H = meta.h; aspect = meta.aspect;
console.log('logo bbox', LOGO_W, 'x', LOGO_H, '(aspect', aspect.toFixed(3) + ')');

// Write the relative-href versions
const frontRel = buildFront('assets/gtm_logo_light.png');
const backRel  = buildBack('assets/gtm_logo_dark.png', {
  'qr_joao.png':     'assets/qr_joao.png',
  'qr_giovanna.png': 'assets/qr_giovanna.png',
  'qr_rafael.png':   'assets/qr_rafael.png',
});
fs.writeFileSync(path.join(root, 'gtm_prospec_front.svg'), frontRel);
fs.writeFileSync(path.join(root, 'gtm_prospec_back.svg'),  backRel);

// Write the embedded versions for PDF conversion
const logoLightB64 = b64('gtm_logo_light.png');
const logoDarkB64  = b64('gtm_logo_dark.png');
const qrJoao  = b64('qr_joao.png');
const qrGio   = b64('qr_giovanna.png');
const qrRafa  = b64('qr_rafael.png');

const frontEmbed = buildFront(logoLightB64);
const backEmbed  = buildBack(logoDarkB64, {
  'qr_joao.png':     qrJoao,
  'qr_giovanna.png': qrGio,
  'qr_rafael.png':   qrRafa,
});
fs.writeFileSync(path.join(build, 'gtm_prospec_front_embed.svg'), frontEmbed);
fs.writeFileSync(path.join(build, 'gtm_prospec_back_embed.svg'),  backEmbed);

console.log('SVGs built');
})();
