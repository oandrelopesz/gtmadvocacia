// Merge front + back into a single 2-page PDF for the gráfica.
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const root = path.join(__dirname, '..');
const build = path.join(root, 'build');

(async () => {
  const merged = await PDFDocument.create();
  for (const side of ['front', 'back']) {
    const bytes = fs.readFileSync(path.join(build, `gtm_prospec_${side}.pdf`));
    const src = await PDFDocument.load(bytes);
    const [page] = await merged.copyPages(src, [0]);
    merged.addPage(page);
  }
  merged.setTitle('GTM Advocacia — Cartão de Visitas (Prospecção Fria)');
  merged.setAuthor('GTM Advocacia');
  merged.setSubject('Print-ready 90x50mm com sangria 3mm');
  merged.setProducer('GTM design pipeline');
  const out = await merged.save();
  fs.writeFileSync(path.join(root, 'gtm_prospec_GRAFICA_FINAL.pdf'), out);
  console.log('wrote gtm_prospec_GRAFICA_FINAL.pdf');

  // also keep front/back as standalone outputs at the project root
  fs.copyFileSync(path.join(build, 'gtm_prospec_front.pdf'), path.join(root, 'gtm_prospec_front.pdf'));
  fs.copyFileSync(path.join(build, 'gtm_prospec_back.pdf'),  path.join(root, 'gtm_prospec_back.pdf'));
  console.log('copied front/back PDFs to root');
})();
