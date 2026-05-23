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

// Logo dims after trim — read from the actual processed PNG so the SVG
// always matches the real bbox.
const sharp = require('sharp');
async function getAspect() {
  const m = await sharp(path.join(assets, 'gtm_logo_dark.png')).metadata();
  return { w: m.width, h: m.height, aspect: m.width / m.height };
}
let LOGO_W, LOGO_H, aspect;

// ---------- FRONT ----------
function buildFront(logoHref) {
  // Logo placement (front)
  const lh = 80;                 // logo height in viewBox units
  const lw = +(lh * aspect).toFixed(2); // ≈ 98.31
  const lx = 80, ly = 80;

  // Headline sizing — line 2 ("Só esqueceram de avisar os advogados.") would
  // overflow the safe area at 60px (Playfair Display). We pick 48px so the
  // longest line fits comfortably inside the 840px safe zone while keeping
  // the spec's "respiração visual" non-negotiable rule.
  const HEAD = 48;

  // line-height 1.15
  const line1Y = 250;                // first baseline
  const line2Y = line1Y + HEAD * 1.15;

  // Subheadline ~50px below last headline baseline
  const subY = line2Y + 60;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560" width="960" height="560">
  <defs>
    <style><![CDATA[
      @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
      .pf  { font-family: 'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif; font-weight: 400; }
      .pfi { font-family: 'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif; font-weight: 400; font-style: italic; }
      .inter { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-weight: 400; }
      .interi { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-weight: 400; font-style: italic; }
    ]]></style>
  </defs>

  <!-- background covers full bleed -->
  <rect x="0" y="0" width="960" height="560" fill="#1F3A35"/>

  <!-- logo (light) top-left -->
  <image href="${logoHref}" x="${lx}" y="${ly}" width="${lw}" height="${lh}" preserveAspectRatio="xMinYMin meet"/>

  <!-- HEADLINE -->
  <text x="480" y="${line1Y}" text-anchor="middle" class="pf"
        font-size="${HEAD}" fill="#F5F1E8" letter-spacing="0.005em">
    A advocacia <tspan class="pfi" fill="#8FC9B8">mudou.</tspan>
  </text>
  <text x="480" y="${line2Y}" text-anchor="middle" class="pf"
        font-size="${HEAD}" fill="#F5F1E8" letter-spacing="0.005em">
    Só esqueceram de avisar os advogados.
  </text>

  <!-- SUBHEADLINE -->
  <text x="480" y="${subY}" text-anchor="middle" class="inter"
        font-size="18" fill="#F5F1E8" opacity="0.7" letter-spacing="0.01em">
    Sem juridiquês. Sem distância. Sem <tspan class="interi">“vou ver com a equipe”.</tspan>
  </text>

  <!-- "vire" indicator bottom-right -->
  <text x="900" y="500" text-anchor="end" class="inter"
        font-size="11" fill="#8FC9B8" opacity="0.6" letter-spacing="0.2em">
    vire →
  </text>
</svg>
`;
}

// ---------- BACK ----------
const PEOPLE = [
  {
    cx: 200,
    name: 'João Giovanini',
    area: 'Direito Trabalhista',
    phone: '(61) 99945-4564',
    qr: 'qr_joao.png',
  },
  {
    cx: 480,
    name: 'Giovanna Trombini',
    area: 'Direito Digital',
    phone: '(61) 99695-8863',
    qr: 'qr_giovanna.png',
  },
  {
    cx: 760,
    name: 'Rafael Mansur',
    area: 'Direito do Servidor Público',
    phone: '(61) 99269-7534',
    qr: 'qr_rafael.png',
  },
];

function buildBack(logoHrefDark, qrHrefMap) {
  // Logo top centered, y=70 top, height 50
  const lh = 50;
  const lw = +(lh * aspect).toFixed(2); // ≈ 61.44
  const lx = (960 - lw) / 2;
  const ly = 70;

  // Header sentence at y=160 (baseline)
  const headlineY = 160;

  // Column dividers: between col1/col2 at x=340, col2/col3 at x=620
  const divX1 = 340, divX2 = 620;

  // Vertical layout within column (block starts at y=240)
  // Name baseline (20px font) – y=260
  // Area baseline (12px) – y=260 + 10 (gap) + 12 = 282
  // Phone baseline (14px) – y=282 + 16 (gap) + 14 = 312
  // QR top – y=312 + 14 (gap) = 326, QR is 110x110, bottom = 436
  // Label baseline (9px) – y=436 + 6 + 9 = 451
  const yName  = 260;
  const yArea  = 282;
  const yPhone = 312;
  const qrTop  = 326;
  const qrSize = 110;
  const yLabel = qrTop + qrSize + 6 + 9; // 451

  const personSvg = (p) => `
    <!-- ${p.name} -->
    <text x="${p.cx}" y="${yName}" text-anchor="middle" class="pf" font-size="20" fill="#1F3A35" letter-spacing="0.02em">${p.name}</text>
    <text x="${p.cx}" y="${yArea}" text-anchor="middle" class="interi" font-size="12" fill="#5A8578">${p.area}</text>
    <text x="${p.cx}" y="${yPhone}" text-anchor="middle" class="inter" font-size="14" fill="#1F3A35" font-weight="500">${p.phone}</text>
    <image href="${qrHrefMap[p.qr]}" x="${p.cx - qrSize/2}" y="${qrTop}" width="${qrSize}" height="${qrSize}"/>
    <text x="${p.cx}" y="${yLabel}" text-anchor="middle" class="inter" font-size="9" fill="#5A8578" letter-spacing="0.3em">whatsapp</text>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560" width="960" height="560">
  <defs>
    <style><![CDATA[
      @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');
      .pf  { font-family: 'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif; font-weight: 400; }
      .pfi { font-family: 'Playfair Display', 'Cormorant Garamond', 'Times New Roman', serif; font-weight: 400; font-style: italic; }
      .inter { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-weight: 400; }
      .interi { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-weight: 400; font-style: italic; }
    ]]></style>
  </defs>

  <!-- background with bleed -->
  <rect x="0" y="0" width="960" height="560" fill="#F1ECE0"/>

  <!-- logo (dark) centered top -->
  <image href="${logoHrefDark}" x="${lx}" y="${ly}" width="${lw}" height="${lh}" preserveAspectRatio="xMidYMin meet"/>

  <!-- HEADLINE -->
  <text x="480" y="${headlineY}" text-anchor="middle" class="pf" font-size="26" fill="#1F3A35">
    Fale direto com o sócio especialista no seu caso.
  </text>

  <!-- divider lines -->
  <line x1="${divX1}" y1="240" x2="${divX1}" y2="480" stroke="#1F3A35" stroke-opacity="0.2" stroke-width="1"/>
  <line x1="${divX2}" y1="240" x2="${divX2}" y2="480" stroke="#1F3A35" stroke-opacity="0.2" stroke-width="1"/>

  ${PEOPLE.map(personSvg).join('\n')}
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
