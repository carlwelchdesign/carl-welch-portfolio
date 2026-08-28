import Image from 'next/image';
import { legacyClientMarks, legacyWorkImages } from './legacy-career-visuals';
import { LegacyWorkingGallery } from './legacy-working-gallery';
import { Reveal } from './motion-elements';

export function LegacyClientField() {
  return (
    <section className="legacy-client-field" aria-labelledby="legacy-client-field-title">
      <header>
        <div>
          <p className="eyebrow">Client and project range</p>
          <Reveal>
            <h2 id="legacy-client-field-title">
              The work moved from defense and finance to entertainment, commerce, and culture.
            </h2>
          </Reveal>
        </div>
        <p>
          Some were direct roles. Many came through agencies, studios, and project teams. Together,
          they show the range of audiences, systems, deadlines, and production environments I
          learned to navigate.
        </p>
      </header>

      <ul className="legacy-client-mark-grid" aria-label="Organizations and properties represented in Carl's professional archive">
        {legacyClientMarks.map((mark) => (
          <li key={mark.name}>
            <Image
              src={mark.src}
              alt=""
              width={170}
              height={170}
              sizes="(max-width: 620px) 30vw, (max-width: 1000px) 18vw, 12vw"
              unoptimized
            />
            <span>{mark.name}</span>
          </li>
        ))}
        <li className="legacy-client-mark-note">
          <p>Work across direct roles, agencies, studios, and client teams.</p>
        </li>
      </ul>
    </section>
  );
}

export function LegacyWorkingArchive() {
  return (
    <section className="legacy-working-archive" data-tone="dark" aria-labelledby="legacy-working-archive-title">
      <header>
        <div>
          <p className="eyebrow">A wider look</p>
          <Reveal>
            <h2 id="legacy-working-archive-title">The hands-on years left a lot of fingerprints.</h2>
          </Reveal>
        </div>
        <p>
          These smaller frames fill in the space between the feature projects: immersive systems,
          full-stack campaign work, art direction, commerce, entertainment, and independently built
          products. The originals are modest in size, so they are presented as an editorial contact
          sheet rather than stretched into hero images.
        </p>
      </header>

      <LegacyWorkingGallery items={legacyWorkImages} />
    </section>
  );
}
