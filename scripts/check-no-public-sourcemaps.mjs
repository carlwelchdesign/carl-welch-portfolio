import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Vinext's standalone server may retain third-party package maps inside its
// private runtime dependency tree. Only dist/client is directly web-served.
const outputDirectory = fileURLToPath(new URL('../dist/client/', import.meta.url));

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

const files = await walk(outputDirectory);
const maps = files.filter((file) => file.endsWith('.map'));
assert.deepEqual(maps, [], `Public build contains source maps: ${maps.join(', ')}`);

for (const file of files.filter((candidate) => candidate.endsWith('.js'))) {
  const source = await readFile(file, 'utf8');
  assert.equal(
    /\/[#@]\s*sourceMappingURL=/i.test(source),
    false,
    `Public bundle exposes a sourceMappingURL directive: ${file}`,
  );
}

console.log(`Public source-map boundary passed across ${files.length} build artifacts`);
