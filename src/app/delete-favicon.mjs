import { unlinkSync, existsSync } from 'fs';
const path = new URL('./favicon.ico', import.meta.url).pathname.slice(1);
if (existsSync(path)) { unlinkSync(path); console.log('deleted', path); }
else console.log('not found');
