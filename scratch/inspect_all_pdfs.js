const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const dir = 'C:\\Users\\yanni\\Downloads\\texte';
const files = fs.readdirSync(dir);

async function inspect() {
  for (const file of files) {
    if (!file.endsWith('.pdf')) continue;
    const fullPath = path.join(dir, file);
    const dataBuffer = fs.readFileSync(fullPath);
    try {
      const p = new pdf.PDFParse(new Uint8Array(dataBuffer));
      const textRes = await p.getText();
      
      // Let's also check if it contains images/pages
      console.log(`File: ${file}`);
      console.log(`  Pages: ${textRes.total}`);
      console.log(`  Text length: ${textRes.text.length}`);
      
      // Check images
      try {
        const imgRes = await p.getImage();
        let imgCount = 0;
        imgRes.pages.forEach(page => {
          if (page.images) imgCount += page.images.length;
        });
        console.log(`  Images count: ${imgCount}`);
      } catch (err) {
        console.log(`  Images check failed: ${err.message}`);
      }
    } catch (err) {
      console.error(`  Failed to parse ${file}:`, err.message);
    }
  }
}

inspect();
