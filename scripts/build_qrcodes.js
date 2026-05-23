// Generate WhatsApp QR codes for João, Giovanna, Rafael.
// Dark color: #1F3A35 to match the back card foreground.
// Background: #F1ECE0 to blend with the back bege.
const QRCode = require('qrcode');
const path = require('path');

const dest = path.join(__dirname, '..', 'assets');

const items = [
  {
    file: 'qr_joao.png',
    url: 'https://wa.me/5561999454564?text=Ol%C3%A1%20Jo%C3%A3o%2C%20peguei%20o%20cart%C3%A3o%20da%20GTM%20e%20gostaria%20de%20conversar%20sobre%20uma%20quest%C3%A3o%20trabalhista.',
  },
  {
    file: 'qr_giovanna.png',
    url: 'https://wa.me/5561996958863?text=Ol%C3%A1%20Giovanna%2C%20peguei%20o%20cart%C3%A3o%20da%20GTM%20e%20gostaria%20de%20conversar%20sobre%20uma%20quest%C3%A3o%20de%20direito%20digital.',
  },
  {
    file: 'qr_rafael.png',
    url: 'https://wa.me/5561992697534?text=Ol%C3%A1%20Rafael%2C%20peguei%20o%20cart%C3%A3o%20da%20GTM%20e%20gostaria%20de%20conversar%20sobre%20uma%20quest%C3%A3o%20envolvendo%20servi%C3%A7o%20p%C3%BAblico.',
  },
];

(async () => {
  for (const it of items) {
    await QRCode.toFile(path.join(dest, it.file), it.url, {
      errorCorrectionLevel: 'H',
      margin: 1,
      scale: 10,
      color: {
        dark: '#1F3A35',
        light: '#F1ECE0',
      },
    });
    console.log('wrote', it.file);
  }
})();
