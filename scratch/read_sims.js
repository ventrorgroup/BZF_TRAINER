const fs = require('fs');
const path = require('path');
const sims = JSON.parse(fs.readFileSync('C:\\Users\\yanni\\source\\repos\\BZF_TRAINER\\backend\\data\\sprechfunk-simulationen.json', 'utf8'));

console.log('Simulations found:');
sims.forEach(sim => {
  console.log(`- ID: ${sim.id}, Title: ${sim.title}, Steps: ${sim.steps.length}`);
});
