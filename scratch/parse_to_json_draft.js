const fs = require('fs');
const path = require('path');

function cleanLine(line) {
  return line.replace(/\s+/g, ' ').trim();
}

function parseFile(fileName) {
  const filePath = path.join('C:\\Users\\yanni\\source\\repos\\BZF_TRAINER\\scratch', fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').map(cleanLine).filter(l => l.length > 0);
  
  // We need to group by pages/blocks.
  // The pages end with something like "#4 Braunschweig 1" and "-- 1 of 3 --".
  // Let's filter out page numbers and separators.
  const cleanLines = [];
  lines.forEach(line => {
    if (line.match(/^#\d/) && cleanLines.length > 0) return; // ignore headers except first
    if (line.match(/^-- \d of \d --/)) return; // ignore page numbers
    if (line.match(/^#\d+\s+\w+/)) return; // ignore page headers like "#4 Braunschweig 1"
    if (line.match(/^#\d+\s+\w+\s+\d+/)) return; // ignore headers
    cleanLines.push(line);
  });
  
  return cleanLines;
}

console.log('Braunschweig lines count:', parseFile('a50e35be-30ca-4635-b614-a2ed5750c9a7_4_Braunschweig.txt').length);
console.log('Stuttgart lines count:', parseFile('663744be-95bd-4533-8e8b-c390212b6091_5_Stuttgart.txt').length);
console.log('Berlin lines count:', parseFile('3969820d-f3d9-4c8f-b10b-bbbc13f93530_6_Berlin.txt').length);
