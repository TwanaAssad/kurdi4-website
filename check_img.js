const fs = require('fs');
const lines = fs.readFileSync('src/app/admin/page.tsx', 'utf8').split('\n');
lines.forEach((line, i) => {
  if (line.includes('<img ')) {
    console.log(`Line ${i}: ${line.trim()}`);
  }
});
