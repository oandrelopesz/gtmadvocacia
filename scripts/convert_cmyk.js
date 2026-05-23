// Convert the RGB PDFs to CMYK using Ghostscript, then merge.
// Requires Ghostscript installed and on PATH (gswin64c on Windows, gs elsewhere).
//   Windows: https://www.ghostscript.com/releases/gsdnld.html  (install AGPL release)
//   Mac:    brew install ghostscript
//   Linux:  apt-get install -y ghostscript
//
// After installing, run:
//   node scripts/convert_cmyk.js
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gs = process.platform === 'win32' ? 'gswin64c' : 'gs';
const root = path.join(__dirname, '..');

function run(args) {
  const r = spawnSync(gs, args, { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error('Ghostscript failed (is it installed and on PATH?).');
    process.exit(r.status || 1);
  }
}

const baseArgs = [
  '-dSAFER', '-dBATCH', '-dNOPAUSE',
  '-sDEVICE=pdfwrite',
  '-sProcessColorModel=DeviceCMYK',
  '-sColorConversionStrategy=CMYK',
  '-dOverrideICC',
];

for (const side of ['front', 'back']) {
  const inPdf = path.join(root, `gtm_prospec_${side}.pdf`);
  const outPdf = path.join(root, `gtm_prospec_${side}_cmyk.pdf`);
  run([...baseArgs, `-o`, outPdf, inPdf]);
  console.log('wrote', outPdf);
}

// Concatenate CMYK pages
run([
  '-dSAFER', '-dBATCH', '-dNOPAUSE',
  '-sDEVICE=pdfwrite',
  '-o', path.join(root, 'gtm_prospec_GRAFICA_FINAL.pdf'),
  path.join(root, 'gtm_prospec_front_cmyk.pdf'),
  path.join(root, 'gtm_prospec_back_cmyk.pdf'),
]);
console.log('wrote gtm_prospec_GRAFICA_FINAL.pdf (CMYK)');
