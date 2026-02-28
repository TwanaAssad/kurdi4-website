const mysql = require('mysql2/promise');
const connection = mysql.createConnection('mysql://u204474097_boss:pEI3l9cdy%405F@193.203.166.18:3306/u204474097_kurdi4org');
connection.then(conn => conn.query('SELECT title, image_url FROM posts LIMIT 5')).then(([rows]) => { console.log(rows); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
