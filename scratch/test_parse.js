const fs = require('fs');
const pdf = require('pdf-parse');
const pdfFile = 'C:\\Users\\yanni\\Downloads\\texte\\898b9bcb-b196-4186-a487-4eedda5924c0_1_Kln-Bonn.pdf';
const dataBuffer = fs.readFileSync(pdfFile);

const p = new pdf.PDFParse(new Uint8Array(dataBuffer));
p.getText().then(res => {
  console.log('Got text successfully!');
  console.log('Num pages:', res.total);
  fs.writeFileSync('C:\\Users\\yanni\\source\\repos\\BZF_TRAINER\\scratch\\koeln-bonn-text.txt', res.text);
  console.log('Length:', res.text.length);
}).catch(err => {
  console.error('Error:', err);
});
