const fs = require('fs');
const lines = fs.readFileSync('src/app/admin/page.tsx', 'utf8').split('\n');
for(let i=0; i<lines.length; i++) {
  if(lines[i].toLowerCase().includes('fetch(\'/api/upload\'')) {
    console.log(`Line ${i}:`);
    console.log(lines.slice(Math.max(0, i-5), Math.min(lines.length, i+30)).join('\n'));
    break;
  }
}
