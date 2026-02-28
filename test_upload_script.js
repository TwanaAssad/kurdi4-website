const fs = require('fs');
async function test() {
  const formData = new FormData();
  formData.append('file', new Blob([fs.readFileSync('test2.txt')]), 'test2.txt');
  const res = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData });
  console.log(await res.json());
}
test();