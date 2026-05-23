// Build the side-by-side HTML preview.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const front = fs.readFileSync(path.join(root, 'build', 'gtm_prospec_front_embed.svg'), 'utf8');
const back  = fs.readFileSync(path.join(root, 'build', 'gtm_prospec_back_embed.svg'),  'utf8');

const html = `<!doctype html>
<html lang="pt-br"><head>
<meta charset="utf-8"/>
<title>GTM Advocacia — Cartão de Visitas — Preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
<style>
  *,html,body { margin:0; padding:0; box-sizing:border-box; }
  body {
    background: #2A2A2A;
    color: #DDD;
    font-family: 'Inter', system-ui, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    gap: 56px;
  }
  h1 {
    font-family: 'Playfair Display', serif;
    font-weight: 400;
    font-size: 28px;
    letter-spacing: 0.02em;
    color: #F5F1E8;
  }
  .meta {
    font-size: 12px;
    color: #888;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 2px;
  }
  .cards {
    display: flex;
    flex-wrap: wrap;
    gap: 60px;
    justify-content: center;
    align-items: flex-start;
  }
  .card-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }
  .card {
    width: 96mm;
    height: 56mm;
    box-shadow: 0 30px 60px rgba(0,0,0,0.4), 0 6px 14px rgba(0,0,0,0.25);
    position: relative;
    overflow: visible;
  }
  .card svg {
    display: block;
    width: 96mm;
    height: 56mm;
  }
  .card.guides::before {
    /* dashed red bleed guide — only when guides class present */
    content: '';
    position: absolute;
    inset: 3mm;
    border: 1px dashed #E74C3C;
    pointer-events: none;
  }
  .label {
    font-family: 'Inter', sans-serif;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: #BBB;
    text-transform: uppercase;
  }
  .controls {
    display: flex;
    gap: 18px;
    align-items: center;
    font-size: 13px;
    color: #aaa;
  }
  .controls label { display: inline-flex; gap:6px; align-items:center; cursor:pointer; }
  footer {
    text-align: center;
    color: #777;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    margin-top: 24px;
  }
  @media (max-width: 720px) {
    .cards { flex-direction: column; gap: 40px; }
  }
</style>
</head>
<body>
  <header style="text-align:center">
    <h1>GTM Advocacia — Cartão de Visitas</h1>
    <div class="meta">PROSPECÇÃO FRIA · 90 × 50 mm · sangria 3 mm · cmyk-ready</div>
  </header>

  <div class="controls">
    <label><input type="checkbox" id="toggle"> Mostrar área de corte (3 mm bleed)</label>
  </div>

  <div class="cards">
    <div class="card-wrap">
      <div class="card" id="card-front">${front}</div>
      <div class="label">FRENTE</div>
    </div>
    <div class="card-wrap">
      <div class="card" id="card-back">${back}</div>
      <div class="label">VERSO</div>
    </div>
  </div>

  <footer>cores: #1F3A35 · #F1ECE0 · #8FC9B8 · #5A8578 · #F5F1E8</footer>

<script>
  const t = document.getElementById('toggle');
  t.addEventListener('change', () => {
    document.querySelectorAll('.card').forEach(c => c.classList.toggle('guides', t.checked));
  });
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'gtm_prospec_preview.html'), html);
console.log('wrote gtm_prospec_preview.html');
