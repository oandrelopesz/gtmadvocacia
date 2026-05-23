// Process gtm_logo_original.png into two color variants with transparent background.
// Strategy: the logo is dark green on a near-uniform cream background.
// We threshold by luminance: dark pixels => opaque, light pixels => transparent.
// Then we paint the alpha with the target color.

const sharp = require('sharp');
const path = require('path');

const SRC = path.join(__dirname, '..', 'gtm_logo_original.png');
const OUT_DARK = path.join(__dirname, '..', 'assets', 'gtm_logo_dark.png');   // #1F3A35
const OUT_LIGHT = path.join(__dirname, '..', 'assets', 'gtm_logo_light.png'); // #F5F1E8

function hexToRgb(hex) {
  const m = hex.replace('#', '');
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}

async function build(color, outPath) {
  const [r, g, b] = hexToRgb(color);

  // Load raw RGBA pixels
  const img = sharp(SRC).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const out = Buffer.alloc(width * height * 4);

  // Threshold using luminance. Background ~ #ECE9DE (~230-ish), logo ~ #1F3A35 (~50).
  // Use linear blend: alpha = 1 - (luma - DARK) / (LIGHT - DARK), clamped.
  const DARK = 50;    // logo luminance
  const LIGHT = 220;  // background luminance

  for (let i = 0; i < width * height; i++) {
    const idx = i * channels;
    const R = data[idx];
    const G = data[idx + 1];
    const B = data[idx + 2];
    const A = data[idx + 3];
    // perceived luminance
    const luma = 0.299 * R + 0.587 * G + 0.114 * B;
    let alpha;
    if (luma <= DARK) alpha = 255;
    else if (luma >= LIGHT) alpha = 0;
    else alpha = Math.round(255 * (1 - (luma - DARK) / (LIGHT - DARK)));

    // Multiply by source alpha (transparent input stays transparent)
    alpha = Math.round((alpha * A) / 255);

    const o = i * 4;
    out[o] = r;
    out[o + 1] = g;
    out[o + 2] = b;
    out[o + 3] = alpha;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log('wrote', outPath);
}

(async () => {
  await build('#1F3A35', OUT_DARK);
  await build('#F5F1E8', OUT_LIGHT);
})();
