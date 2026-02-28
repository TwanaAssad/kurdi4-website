const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection('mysql://u204474097_boss:pEI3l9cdy%405F@193.203.166.18:3306/u204474097_kurdi4org');
  const [rows] = await conn.execute('SELECT id, title, image_url FROM posts ORDER BY created_at DESC LIMIT 5');
  console.log(rows);
  conn.end();
}
run();