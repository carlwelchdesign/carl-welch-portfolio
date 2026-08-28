import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const roots = ['app', 'public'];
const textExtensions = new Set([
  '.css', '.html', '.js', '.jsx', '.json', '.md', '.mjs', '.svg', '.ts', '.tsx', '.txt', '.xml',
]);
const prohibited = [
  { label: 'Unicode em dash', value: String.fromCodePoint(0x2014) },
  { label: 'HTML named em dash', value: '&mdash;' },
  { label: 'HTML numeric em dash', value: '&#8212;' },
  { label: 'escaped Unicode em dash', value: '\\u2014' },
];

async function collectTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectTextFiles(target));
    else if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push(target);
  }

  return files;
}

const files = (await Promise.all(roots.map(collectTextFiles))).flat();
const violations = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  for (const rule of prohibited) {
    if (source.includes(rule.value)) violations.push(`${file}: ${rule.label}`);
  }
}

assert.deepEqual(
  violations,
  [],
  `Visitor-facing portfolio sources must not contain em dashes:\n${violations.join('\n')}`,
);

console.log(`Em-dash copy boundary passed across ${files.length} visitor-facing source files.`);
