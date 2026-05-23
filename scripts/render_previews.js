// Rasterize SVGs to PNG for quick visual validation via sharp (uses librsvg).
// Note: librsvg won't fetch Google Fonts, so the rasterized preview will use
// fallback fonts. The actual final preview will be the HTML version in a browser
// (which will load Playfair Display & Inter properly).
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const build = path.join(root, 'build');

async function render(name) {
  const src = path.join(build, `gtm_prospec_${name}_embed.svg`);
  const dst = path.join(build, `preview_${name}.png`);
  await sharp(src, { density: 300 })
    .resize({ width: 1920 })
    .png()
    .toFile(dst);
  console.log('wrote', dst);
}

(async () => {
  await render('front');
  await render('back');
})();
