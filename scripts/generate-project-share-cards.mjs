import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';
import { loadTypescriptData } from './load-typescript-data.mjs';
import { assertSocialCardCurrent, assertSocialCardRich } from './social-card-integrity.mjs';

const [{ projects }] = await Promise.all([
  loadTypescriptData(resolve(process.cwd(), 'app/portfolio-data.ts')),
]);
const homepageManifest = JSON.parse(
  await readFile(resolve(process.cwd(), 'docs/home-social-card.v1.json'), 'utf8'),
);

const checkOnly = process.argv.includes('--check');
const outputDirectory = resolve(process.cwd(), 'public/social');
const size = homepageManifest.dimensions;
const toneColors = {
  red: '#ff4338',
  orange: '#ff6800',
  green: '#62e879',
};

const homepageCard = {
  slug: 'carl-welch-portfolio',
  images: homepageManifest.sources.map(({ src }) => src),
};

assert.equal(homepageManifest.output, `/social/${homepageCard.slug}.png`);
assert.equal(homepageManifest.sources.length, 3);
assert.equal(new Set(homepageCard.images).size, 3);

const homepagePixels = Array.from({ length: 108 }, (_, index) => ({
  left: 565 + ((index * 83) % 620),
  top: 20 + ((index * 137) % 590),
  size: 2 + (index % 3),
  opacity: 0.26 + ((index % 5) * 0.09),
}));

function imagePanel({ imageDataUri, label, left, top, width, height, rotate, tone }) {
  return h(
    'div',
    {
      style: {
        position: 'absolute',
        left,
        top,
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        border: '7px solid #090c09',
        background: '#090c09',
        boxShadow: '13px 14px 0 rgba(9, 12, 9, 0.82)',
        transform: `rotate(${rotate}deg)`,
        overflow: 'hidden',
      },
    },
    h(
      'div',
      {
        style: {
          height: 34,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          color: '#f2f2eb',
          fontSize: 11,
          letterSpacing: 1.6,
        },
      },
      h('span', { style: { color: tone } }, label),
      h('span', null, 'VIEW / SYSTEM'),
    ),
    h('img', {
      src: imageDataUri,
      style: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' },
    }),
  );
}

function homepageCardComposition([jobSearchImage, flightTrackerImage, echoAtlasImage]) {
  const { copy, sources } = homepageManifest;
  return h(
    'div',
    {
      style: {
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        background: '#ff4338',
        color: '#f2f2eb',
        fontFamily: 'Arial, sans-serif',
      },
    },
    ...Array.from({ length: 13 }, (_, index) => h('div', {
      key: `column-${index}`,
      style: {
        position: 'absolute',
        left: 540 + (index * 55),
        top: 0,
        width: 1,
        height: 630,
        background: 'rgba(9, 12, 9, 0.16)',
      },
    })),
    ...Array.from({ length: 9 }, (_, index) => h('div', {
      key: `row-${index}`,
      style: {
        position: 'absolute',
        left: 540,
        top: index * 79,
        width: 660,
        height: 1,
        background: 'rgba(9, 12, 9, 0.16)',
      },
    })),
    ...homepagePixels.map((pixel, index) => h('div', {
      key: `pixel-${index}`,
      style: {
        position: 'absolute',
        left: pixel.left,
        top: pixel.top,
        width: pixel.size,
        height: pixel.size,
        background: '#090c09',
        opacity: pixel.opacity,
      },
    })),
    h('div', {
      style: {
        position: 'absolute',
        right: -160,
        bottom: -260,
        width: 610,
        height: 610,
        border: '2px solid rgba(9, 12, 9, 0.42)',
        borderRadius: 610,
      },
    }),
    h('div', {
      style: {
        position: 'absolute',
        right: -20,
        bottom: -130,
        width: 410,
        height: 410,
        border: '2px dashed rgba(9, 12, 9, 0.48)',
        borderRadius: 410,
      },
    }),
    h(
      'div',
      {
        style: {
          position: 'relative',
          width: 550,
          height: 630,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '42px 45px 38px',
          background: '#090c09',
          boxShadow: '16px 0 0 rgba(9, 12, 9, 0.24)',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: 15, fontSize: 18, fontWeight: 700 } },
        h('span', { style: { color: '#ff6800', fontSize: 31, letterSpacing: -5 } }, '///'),
        h('span', null, copy.brand),
      ),
      h(
        'div',
        {
          style: {
            marginTop: 76,
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          },
        },
        h(
          'div',
          { style: { color: '#a9afa5', fontSize: 12, letterSpacing: 2.2 } },
          copy.eyebrow,
        ),
        h(
          'div',
          { style: { fontSize: 55, fontWeight: 700, lineHeight: 0.98, letterSpacing: -2.8 } },
          copy.headline,
        ),
      ),
      h(
        'div',
        {
          style: {
            marginTop: 'auto',
            paddingTop: 18,
            borderTop: '1px solid rgba(242, 242, 235, 0.28)',
            display: 'flex',
            gap: 17,
            color: '#f2f2eb',
            fontSize: 10,
            letterSpacing: 1.55,
          },
        },
        h('span', { style: { color: '#ff4338' } }, 'APPLIED AI'),
        h('span', { style: { color: '#ff6800' } }, 'PRODUCT SYSTEMS'),
        h('span', { style: { color: '#62e879' } }, 'CREATIVE SOFTWARE'),
      ),
    ),
    h(
      'div',
      { style: { position: 'relative', width: 650, height: 630, display: 'flex' } },
      imagePanel({
        imageDataUri: jobSearchImage,
        label: sources[0].label,
        left: 30,
        top: 66,
        width: 485,
        height: 300,
        rotate: -2.4,
        tone: '#ff4338',
      }),
      imagePanel({
        imageDataUri: flightTrackerImage,
        label: sources[1].label,
        left: 112,
        top: 326,
        width: 455,
        height: 255,
        rotate: 2.1,
        tone: '#ff6800',
      }),
      imagePanel({
        imageDataUri: echoAtlasImage,
        label: sources[2].label,
        left: 350,
        top: 22,
        width: 270,
        height: 178,
        rotate: 3.4,
        tone: '#62e879',
      }),
      h(
        'div',
        {
          style: {
            position: 'absolute',
            right: 28,
            bottom: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 11px',
            border: '3px solid #090c09',
            background: '#f2f2eb',
            color: '#090c09',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.3,
          },
        },
        h('span', null, copy.callToAction),
        h('span', { style: { color: '#ff4338', fontSize: 18 } }, '→'),
      ),
    ),
  );
}

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

async function renderHomepageCard() {
  const imageDataUris = await Promise.all(homepageCard.images.map(async (source) => {
    const image = await readFile(resolve(process.cwd(), `public${source}`));
    return `data:image/png;base64,${image.toString('base64')}`;
  }));
  const response = new ImageResponse(homepageCardComposition(imageDataUris), size);
  assert.equal(response.headers.get('content-type'), 'image/png');
  return Buffer.from(await response.arrayBuffer());
}

await mkdir(outputDirectory, { recursive: true });

const homepageOutputPath = resolve(outputDirectory, `${homepageCard.slug}.png`);
const renderedHomepage = await renderHomepageCard();
assertSocialCardRich(renderedHomepage, homepageCard.slug, homepageManifest.minimumBytes);

if (checkOnly) {
  const existing = await readFile(homepageOutputPath);
  assertSocialCardCurrent(existing, renderedHomepage, homepageCard.slug);
} else {
  await writeFile(homepageOutputPath, renderedHomepage);
}

for (const project of projects) {
  const outputPath = resolve(outputDirectory, `${project.slug}.png`);
  const rendered = await renderCard(project);

  if (checkOnly) {
    const existing = await readFile(outputPath);
    assertSocialCardCurrent(existing, rendered, project.slug);
  } else {
    await writeFile(outputPath, rendered);
  }
}

console.log(
  `${checkOnly ? 'Verified' : 'Generated'} one homepage and ${projects.length} project share cards at ${size.width}×${size.height}.`,
);
