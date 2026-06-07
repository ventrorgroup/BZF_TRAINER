const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const dir = 'C:\\Users\\yanni\\Downloads\\texte';
const files = fs.readdirSync(dir);

async function parseAll() {
  for (const file of files) {
    if (!file.endsWith('.pdf')) continue;
    const fullPath = path.join(dir, file);
    const dataBuffer = fs.readFileSync(fullPath);
    try {
      const p = new pdf.PDFParse(new Uint8Array(dataBuffer));
      const res = await p.getText();
      const baseName = path.basename(file, '.pdf');
      const outPath = `C:\\Users\\yanni\\source\\repos\\BZF_TRAINER\\scratch\\${baseName}.txt`;
      fs.writeFileSync(outPath, res.text);
      console.log(`Parsed ${file} -> ${baseName}.txt (${res.text.length} chars)`);
    } catch (err) {
      console.error(`Failed to parse ${file}:`, err);
    }
  }
}

parseAll();
