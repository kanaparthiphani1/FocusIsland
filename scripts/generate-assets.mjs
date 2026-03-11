import fs from 'node:fs';
import path from 'node:path';

const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn7n3sAAAAASUVORK5CYII=';

function writeFile(relPath, content, encoding) {
  const filePath = path.resolve('dist', relPath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, encoding ? { encoding } : undefined);
}

[16, 32, 48, 128].forEach((size) => {
  writeFile(`assets/icons/icon${size}.png`, tinyPngBase64, 'base64');
});

writeFile('assets/sound.mp3', Buffer.from('ID3'));
