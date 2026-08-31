import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(siteRoot, 'dist', 'standalone');
const destination = resolve(siteRoot, '.vinext-preview');

await stat(resolve(source, 'server.js'));
await rm(destination, { force: true, recursive: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });

console.log(`[preview:lan] Staged immutable standalone build at ${destination}`);
