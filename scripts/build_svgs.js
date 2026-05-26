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
// FRENTE  — logo dominante centralizado + manifesto compacto abaixo
// =========================================================================
function buildFront(logoHref) {
  // Logo bem maior e centralizado — usa a altura útil entre y=60 e y=300
  const lh = 240;                                  // altura do logo no viewBox
  const lw = +(lh * aspect).toFixed(2);            // largura derivada
  const lx = (960 - lw) / 2;
  const ly = 50;

  // Manifesto, fonte menor, duas linhas centralizadas abaixo do logo
  const HEAD = 30;
  const line1Y = 380;
  const line2Y = line1Y + HEAD * 1.25;             // line-height generoso

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560" width="960" height="560">
  <defs>
    <style>${STYLE}</style>
  </defs>

  <!-- fundo com sangria -->
  <rect x="0" y="0" width="960" height="560" fill="#1F3A35"/>

  <!-- logo (claro) dominante, centralizado -->
  <image href="${logoHref}" x="${lx}" y="${ly}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMin meet"/>

  <!-- MANIFESTO (menor, abaixo do logo) -->
  <text x="480" y="${line1Y}" text-anchor="middle" class="pf"
        font-size="${HEAD}" fill="#F5F1E8" letter-spacing="0.005em">
    A advocacia <tspan class="pfi" fill="#8FC9B8">mudou.</tspan>
  </text>
  <text x="480" y="${line2Y}" text-anchor="middle" class="pf"
        font-size="${HEAD}" fill="#F5F1E8" letter-spacing="0.005em">
    Só esqueceram de avisar os advogados.
  </text>

  <!-- indicador "vire" canto inferior direito -->
  <text x="900" y="500" text-anchor="end" class="inter"
        font-size="11" fill="#8FC9B8" opacity="0.6" letter-spacing="0.2em">
    vire →
  </text>
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

function buildBack(logoHrefDark, qrHrefMap) {
  // Logo (escuro) compacto no topo, centralizado
  const lh = 56;
  const lw = +(lh * aspect).toFixed(2);
  const lx = (960 - lw) / 2;
  const ly = 38;

  // Headline sem nicho de área
  const headlineY = 140;

  // Bloco das 3 colunas — y = 175 .. 415
  const yName  = 200;
  const yPhone = 232;
  const qrTop  = 252;
  const qrSize = 110;
  const yLabel = qrTop + qrSize + 12; // 374

  // Divisórias entre colunas — não cruzam a área da headline nem o rodapé
  const divX1 = 340, divX2 = 620;
  const divY1 = 180, divY2 = 405;

  // Rodapé com contatos do escritório
  const footY1 = 470;  // separador
  const footYText = 495;

  const personSvg = (p) => `
    <!-- ${p.name} -->
    <text x="${p.cx}" y="${yName}" text-anchor="middle" class="pf" font-size="22" fill="#1F3A35" letter-spacing="0.02em">${p.name}</text>
    <text x="${p.cx}" y="${yPhone}" text-anchor="middle" class="inter" font-size="14" fill="#1F3A35" font-weight="500">${p.phone}</text>
    <image href="${qrHrefMap[p.qr]}" x="${p.cx - qrSize/2}" y="${qrTop}" width="${qrSize}" height="${qrSize}"/>
    <text x="${p.cx}" y="${yLabel}" text-anchor="middle" class="inter" font-size="9" fill="#5A8578" letter-spacing="0.3em">whatsapp</text>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560" width="960" height="560">
  <defs>
    <style>${STYLE}</style>
  </defs>

  <!-- fundo com sangria -->
  <rect x="0" y="0" width="960" height="560" fill="#F1ECE0"/>

  <!-- logo (escuro) no topo, centralizado -->
  <image href="${logoHrefDark}" x="${lx}" y="${ly}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMin meet"/>

  <!-- HEADLINE (sem nicho de área) -->
  <text x="480" y="${headlineY}" text-anchor="middle" class="pf" font-size="24" fill="#1F3A35">
    Fale direto com um sócio.
  </text>

  <!-- divisórias verticais entre as colunas -->
  <line x1="${divX1}" y1="${divY1}" x2="${divX1}" y2="${divY2}" stroke="#1F3A35" stroke-opacity="0.2" stroke-width="1"/>
  <line x1="${divX2}" y1="${divY1}" x2="${divX2}" y2="${divY2}" stroke="#1F3A35" stroke-opacity="0.2" stroke-width="1"/>

  ${PEOPLE.map(personSvg).join('\n')}

  <!-- separador horizontal acima do rodapé -->
  <line x1="120" y1="${footY1}" x2="840" y2="${footY1}" stroke="#1F3A35" stroke-opacity="0.18" stroke-width="1"/>

  <!-- rodapé: contato do escritório -->
  <text x="480" y="${footYText}" text-anchor="middle" class="inter" font-size="12" fill="#1F3A35" letter-spacing="0.12em">
    ${FIRM.instagram}<tspan dx="14" fill="#5A8578">·</tspan><tspan dx="14">${FIRM.email}</tspan>
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
