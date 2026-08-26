import Link from 'next/link';
import { capabilities } from './capabilities-data';
import { MotionRuntime, Orbit, Reveal } from './motion-elements';
import { experience, projects, recommendationReview } from './portfolio-data';
import { PageFrame, ProjectChapter } from './site-components';

export function PortfolioHome() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content">
          <section id="top" className="hero" data-tone="red" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">Product Engineer</p>
              <h1 id="hero-title">Carl Welch</h1>
              <p className="hero-summary">
                Applied AI, product interfaces, and creative software. Selected projects,
                architecture, and professional experience.
              </p>
              <div className="hero-actions">
                <a className="primary-action" href="#work">
                  View selected work <span aria-hidden="true">↓</span>
                </a>
                <Link className="text-action" href="/contact">
                  Email Carl
                </Link>
                <a className="text-action" href="/carl-welch-resume.pdf" download>
                  Résumé ↓
                </a>
              </div>
            </div>

            <div className="hero-field" aria-hidden="true">
              <div className="hero-grid" />
              <Orbit variant="one" />
              <Orbit variant="two" />
              <div className="hero-index">
                <span>01</span>
                <span>03</span>
              </div>
            </div>

            <div className="signal-rail" aria-hidden="true">
              <span className="red" />
              <span className="orange" />
              <span className="green" />
            </div>
          </section>

          <div id="work">
            {projects.map((project, index) => (
              <ProjectChapter key={project.slug} project={project} priority={index === 0} />
            ))}
          </div>

          <section className="capabilities-preview" data-tone="orange" aria-labelledby="capabilities-title">
            <Reveal className="capabilities-preview-heading">
              <p className="eyebrow">Capabilities</p>
              <h2 id="capabilities-title">What I do, linked to the work behind it.</h2>
            </Reveal>
            <ol>
              {capabilities.slice(0, 4).map((capability) => (
                <li key={capability.id}>
                  <Link href={`/capabilities#${capability.id}`}>
                    <span>{capability.number}</span>
                    <strong>{capability.name}</strong>
                    <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link className="primary-action dark-action" href="/capabilities">
              View evidence map <span aria-hidden="true">→</span>
            </Link>
          </section>

          <section className="experience-preview" data-tone="green" aria-labelledby="experience-title">
            <Reveal className="experience-preview-heading">
              <p className="eyebrow">Experience</p>
              <h2 id="experience-title">Product engineering across security, analytics, mobility, and consumer software.</h2>
            </Reveal>
            <ol className="experience-preview-list">
              {experience.slice(0, 3).map((item) => (
                <li key={item.company}>
                  <span>{item.dates}</span>
                  <strong>{item.company}</strong>
                  <span>{item.role}</span>
                </li>
              ))}
            </ol>
            <Link className="primary-action dark-action" href="/experience">
              Full experience <span aria-hidden="true">→</span>
            </Link>
          </section>

          <section className="recommendations-preview" data-tone="red" aria-labelledby="recommendations-title">
            <div>
              <p className="eyebrow">Recommendations</p>
              <h2 id="recommendations-title">From people I’ve worked with</h2>
            </div>
            <div>
              <p>{recommendationReview.description}</p>
              <Link className="primary-action" href="/recommendations">
                Review collection <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
