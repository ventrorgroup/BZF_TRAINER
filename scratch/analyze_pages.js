const fs = require('fs');
const path = require('path');

function analyzeFile(fileName) {
  const filePath = path.join('C:\\Users\\yanni\\source\\repos\\BZF_TRAINER\\scratch', fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Split by page markers: e.g. -- 1 of 3 --
  const pages = content.split(/-- \d of \d --/);
  console.log(`\nFile: ${fileName}`);
  
  pages.forEach((pageText, idx) => {
    if (pageText.trim().length === 0) return;
    const lines = pageText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#') && !l.match(/^\d+$/));
    
    console.log(`  Page ${idx + 1}: ${lines.length} lines`);
    // print first 3 and last 3 lines
    if (lines.length > 0) {
      console.log(`    First: ${lines.slice(0, 3).join(' | ')}`);
      console.log(`    Last:  ${lines.slice(-3).join(' | ')}`);
    }
  });
}

analyzeFile('a50e35be-30ca-4635-b614-a2ed5750c9a7_4_Braunschweig.txt');
analyzeFile('663744be-95bd-4533-8e8b-c390212b6091_5_Stuttgart.txt');
analyzeFile('3969820d-f3d9-4c8f-b10b-bbbc13f93530_6_Berlin.txt');
