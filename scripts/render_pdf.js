// Render the embedded SVGs to PDF via headless Chromium.
// Chromium loads the Google Fonts (Playfair Display + Inter) at runtime
// and produces a PDF with the fonts EMBEDDED as subsets. No system fonts needed.
//
// Output is a print-ready PDF at exact 96mm × 56mm (sangria de 3mm já incluída no SVG).
//
// Also exports a high-res PNG preview alongside each PDF for visual review.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.join(__dirname, '..');
const build = path.join(root, 'build');

// Card dims with bleed:
// SVG viewBox = 960 × 560, where viewBox unit ≈ 0.1mm
// Physical with bleed = 96mm × 56mm
const WIDTH_MM = 96;
const HEIGHT_MM = 56;

const htmlTemplate = (svg) => `<!doctype html>
<html><head><meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;1,400&family=Playfair+Display:ital,wght@0,400;1,400&display=swap" rel="stylesheet">
<style>
  *,html,body { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${WIDTH_MM}mm; height:${HEIGHT_MM}mm; overflow:hidden; }
  svg { display:block; width:${WIDTH_MM}mm; height:${HEIGHT_MM}mm; }
</style>
</head><body>${svg}</body></html>
`;

async function renderSide(side) {
  const svg = fs.readFileSync(path.join(build, `gtm_prospec_${side}_embed.svg`), 'utf8');
  const html = htmlTemplate(svg);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
  // Make sure fonts have loaded
  await page.evaluate(() => document.fonts.ready);

  const pdfPath = path.join(build, `gtm_prospec_${side}.pdf`);
  await page.pdf({
    path: pdfPath,
    width: `${WIDTH_MM}mm`,
    height: `${HEIGHT_MM}mm`,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    pageRanges: '1',
    preferCSSPageSize: false,
  });
  console.log('wrote', pdfPath);

  // Hi-res PNG preview – clip exactly to the card. mm→px at 96dpi: 1mm = 3.7795px
  const PX_PER_MM = 96 / 25.4;
  const cw = Math.round(WIDTH_MM * PX_PER_MM);
  const ch = Math.round(HEIGHT_MM * PX_PER_MM);
  await page.setViewport({ width: cw, height: ch, deviceScaleFactor: 4 });
  // Reload to re-flow at new viewport
  await page.setContent(html, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  const pngPath = path.join(build, `preview_${side}_real.png`);
  await page.screenshot({ path: pngPath, type: 'png', clip: { x: 0, y: 0, width: cw, height: ch } });
  console.log('wrote', pngPath);

  await browser.close();
}

(async () => {
  await renderSide('front');
  await renderSide('back');
})();
