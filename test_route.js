async function test() {
  const res = await fetch('http://localhost:3000/uploads/1769251879956-2a9bnde2sjj.png');
  console.log(res.status, await res.text());
}
test();