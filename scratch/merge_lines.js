const fs = require('fs');
const path = require('path');

function mergeWrappedLines(fileName) {
  const filePath = path.join('C:\\Users\\yanni\\source\\repos\\BZF_TRAINER\\scratch', fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Split by pages first
  const pages = content.split(/-- \d of \d --/);
  const resultPages = [];
  
  pages.forEach((pageText, pIdx) => {
    if (pageText.trim().length === 0) return;
    const rawLines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const cleanLines = [];
    
    // Filter out page headers/footers
    rawLines.forEach(line => {
      if (line.match(/^#\d/) && cleanLines.length > 0) return; // ignore headers except first
      if (line.match(/^#\d+\s+\w+/)) return; // ignore page headers like "#4 Braunschweig 1"
      cleanLines.push(line);
    });
    
    // Merge wrapped lines
    const turns = [];
    let currentTurn = '';
    
    cleanLines.forEach(line => {
      // Check if it's a new turn
      const isNewTurn = 
        line.startsWith('💡') ||
        line.match(/^(Braunschweig|Stuttgart|Berlin|Langen|Bremen|Hannover|Leipzig|Nürnberg|Hamburg|D EPAH|D AH|E EPAH|E AH|D-EPAH|D-AH|E-EPAH|E-AH|Taxi to|Taxiing|Rolle|Rollen|Rolle zum|Rolle zur|Will leave|Werde|Holding|Halte|When airborne|Steige nach|Approved to|Verlassen der|Verlasse die|Proceeding|Fliege|Flieger|Shortening|Verkürze|Runway|Piste|Going around|Starte durch|Joining|Fliege in|Number 2|Nummer 2|Vacate|Verlasse|Leaving|verlasse)/i) ||
        // Instructions
        line.match(/^(neue Frequenz|Zum Holding|Steigen und|Weiter bis|Genehmigung für|Abflug|Wieder Berlin|jetzt Langen)/i);
      
      if (isNewTurn) {
        if (currentTurn) {
          turns.push(currentTurn);
        }
        currentTurn = line;
      } else {
        if (currentTurn) {
          currentTurn += ' ' + line;
        } else {
          currentTurn = line;
        }
      }
    });
    if (currentTurn) {
      turns.push(currentTurn);
    }
    
    resultPages.push(turns);
  });
  
  return resultPages;
}

const bsPages = mergeWrappedLines('a50e35be-30ca-4635-b614-a2ed5750c9a7_4_Braunschweig.txt');
console.log('Braunschweig merged turns per page:');
bsPages.forEach((turns, idx) => {
  console.log(`Page ${idx+1}: ${turns.length} turns`);
  turns.slice(0, 5).forEach(t => console.log('  ', t));
});
