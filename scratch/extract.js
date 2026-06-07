const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const pdfFile = 'C:\\Users\\yanni\\Downloads\\texte\\898b9bcb-b196-4186-a487-4eedda5924c0_1_Kln-Bonn.pdf';

const dataBuffer = fs.readFileSync(pdfFile);

pdfParse(dataBuffer).then(function(data) {
    fs.writeFileSync('C:\\Users\\yanni\\source\\repos\\BZF_TRAINER\\scratch\\koeln-bonn-extracted.txt', data.text);
    console.log('PDF text length:', data.text.length);
}).catch(err => {
    console.error(err);
});
