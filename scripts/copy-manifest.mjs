import fs from 'node:fs';
import path from 'node:path';

const file = 'manifest.json';
const src = path.resolve(file);
const dest = path.resolve('dist', file);
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
