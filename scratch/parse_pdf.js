const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\yanni\\Downloads\\2024Pruefungsfragen_BZFII_BZFI_pdf.pdf';

async function parsePdf() {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    // Save text to a file for investigation
    fs.writeFileSync('pdf_text.txt', data.text);
    console.log('PDF text extracted to pdf_text.txt');
    console.log('Total pages:', data.numpages);
}

parsePdf().catch(console.error);
