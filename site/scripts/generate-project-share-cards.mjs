import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';
import { loadTypescriptData } from './load-typescript-data.mjs';

const [{ projects }] = await Promise.all([
  loadTypescriptData(resolve(process.cwd(), 'app/portfolio-data.ts')),
]);

const checkOnly = process.argv.includes('--check');
const outputDirectory = resolve(process.cwd(), 'public/social');
const size = { width: 1200, height: 630 };
const toneColors = {
  red: '#ff4338',
  orange: '#ff6800',
  green: '#62e879',
};

function projectCard(project, imageDataUri) {
  const tone = toneColors[project.tone];
  const titleSize = project.name.length >= 24 ? 57 : 68;

  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '42px 46px 38px',
        background: '#090c09',
        color: '#f2f2eb',
        fontFamily: 'Arial, sans-serif',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 22,
          borderBottom: '1px solid rgba(242, 242, 235, 0.28)',
          fontSize: 15,
          letterSpacing: 2.2,
        },
      },
      h('span', { style: { color: tone } }, `SELECTED WORK / ${project.number}`),
      h('span', null, 'CARL WELCH · PRODUCT ENGINEER'),
    ),
    h(
      'div',
      { style: { flex: 1, display: 'flex', gap: 42, paddingTop: 34 } },
      h(
        'div',
        { style: { width: 402, display: 'flex', flexDirection: 'column' } },
        h(
          'div',
          {
            style: {
              display: 'flex',
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 0.92,
              letterSpacing: -3.6,
            },
          },
          project.name,
        ),
        h(
          'div',
          {
            style: {
              marginTop: 'auto',
              paddingTop: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 11,
              borderTop: '1px solid rgba(242, 242, 235, 0.28)',
            },
          },
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
            h('span', { style: { color: '#92998f', fontSize: 12, letterSpacing: 1.7 } }, 'MY ROLE'),
            h('span', { style: { fontSize: 19 } }, project.role),
          ),
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 } },
            h('span', { style: { color: '#92998f', fontSize: 12, letterSpacing: 1.7 } }, 'STAGE'),
            h('span', { style: { color: tone, fontSize: 14, textAlign: 'right' } }, project.status),
          ),
        ),
      ),
      h(
        'div',
        {
          style: {
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            border: '1px solid rgba(242, 242, 235, 0.32)',
            background: '#e9e5dc',
            boxShadow: `10px 10px 0 ${tone}`,
            overflow: 'hidden',
          },
        },
        h('img', {
          src: imageDataUri,
          width: project.image.width,
          height: project.image.height,
          style: { width: '100%', height: '100%', objectFit: 'contain' },
        }),
      ),
    ),
  );
}

async function renderCard(project) {
  const sourcePath = resolve(process.cwd(), `public${project.image.src}`);
  const sourceImage = await readFile(sourcePath);
  const imageDataUri = `data:image/png;base64,${sourceImage.toString('base64')}`;
  const response = new ImageResponse(projectCard(project, imageDataUri), size);
  assert.equal(response.headers.get('content-type'), 'image/png');
  return Buffer.from(await response.arrayBuffer());
}

await mkdir(outputDirectory, { recursive: true });

for (const project of projects) {
  const outputPath = resolve(outputDirectory, `${project.slug}.png`);
  const rendered = await renderCard(project);

  if (checkOnly) {
    const existing = await readFile(outputPath);
    assert.deepEqual(existing, rendered, `${project.slug} share card is stale; run pnpm generate:social-cards.`);
  } else {
    await writeFile(outputPath, rendered);
  }
}

console.log(`${checkOnly ? 'Verified' : 'Generated'} ${projects.length} project share cards at ${size.width}×${size.height}.`);
