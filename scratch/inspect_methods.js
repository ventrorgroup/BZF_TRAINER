const pdf = require('pdf-parse');
const keys = Object.getOwnPropertyNames(pdf.PDFParse.prototype);
console.log('Methods of PDFParse:', keys);
