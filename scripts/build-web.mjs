import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

const entries = [
  'index.html',
  'styles.css',
  'app-shell.js',
  'game.js',
  'manifest.webmanifest',
  'sw.js',
  'sprites.png',
  'backend',
  'app-icons',
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  await cp(path.join(root, entry), path.join(dist, entry), { recursive: true });
}

console.log(`Built Bellbound Academy web shell to ${dist}`);
