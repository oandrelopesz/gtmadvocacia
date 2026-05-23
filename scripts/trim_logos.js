// Trim transparent borders so the logo fills its bounding box.
const sharp = require('sharp');
const path = require('path');

async function trim(file) {
  const input = path.join(__dirname, '..', 'assets', file);
  const tmp = input + '.tmp.png';
  // Step 1: drop the stray 1px stripe at the top of the source.
  const pre = await sharp(input).metadata();
  const buf = await sharp(input)
    .extract({ left: 0, top: 2, width: pre.width, height: pre.height - 2 })
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = buf;
  const W = info.width, H = info.height;
  // Step 2: scan alpha to find tight bounding box of any pixel with alpha >= MIN_A.
  const MIN_A = 16;
  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = data[(y * W + x) * 4 + 3];
      if (a >= MIN_A) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .extract({ left: minX, top: minY, width: cw, height: ch })
    .png({ compressionLevel: 9 })
    .toFile(tmp);
  require('fs').renameSync(tmp, input);
  const meta = await sharp(input).metadata();
  console.log(file, meta.width, 'x', meta.height);
}

(async () => {
  await trim('gtm_logo_dark.png');
  await trim('gtm_logo_light.png');
})();
