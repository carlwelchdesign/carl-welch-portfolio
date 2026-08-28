import Link from 'next/link';
import { capabilities } from './capabilities-data';
import { MotionRuntime, Orbit, Reveal } from './motion-elements';
import { experience, projects } from './portfolio-data';
import { recommendations } from './recommendations-data';
import { CareerPortraitPreview, CharacterSignals, PageFrame, ProjectChapter, WorkIndex } from './site-components';

export function PortfolioHome() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content">
          <section id="top" className="hero" data-tone="red" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">Senior Product Engineer · Creative Technologist</p>
              <h1 id="hero-title">Carl Welch</h1>
              <p className="hero-summary">
                I build complex product interfaces and the systems behind them. My work spans
                enterprise security, analytics, mobility, applied AI, and creative software, grounded
                in two decades of interactive and product work.
              </p>
              <div className="hero-actions">
                <a className="primary-action" href="#work">
                  View selected work <span aria-hidden="true">↓</span>
                </a>
                <Link className="text-action" href="/contact">
                  Discuss a role or project
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
                <span>{String(projects.length).padStart(2, '0')}</span>
              </div>
            </div>

            <div className="signal-rail" aria-hidden="true">
              <span className="red" />
              <span className="orange" />
              <span className="green" />
            </div>
          </section>

          <section className="home-proof" data-tone="orange" aria-label="Portfolio at a glance">
            <p className="eyebrow">At a glance</p>
            <dl>
              <div>
                <dt>Years across interactive and product work</dt>
                <dd>20+</dd>
              </div>
              <div>
                <dt>Product engineering roles since 2016</dt>
                <dd>{experience.length}</dd>
              </div>
              <div>
                <dt>Professional recommendations</dt>
                <dd>{recommendations.length}</dd>
              </div>
              <div>
                <dt>Flagship projects with full case studies</dt>
                <dd>{projects.length}</dd>
              </div>
            </dl>
          </section>

          <CareerPortraitPreview />

          <div id="work">
            <WorkIndex items={projects} />
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
              Explore capabilities <span aria-hidden="true">→</span>
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

          <CharacterSignals />

          <section className="home-closing" data-tone="green" aria-labelledby="home-closing-title">
            <p className="eyebrow">Next step</p>
            <div className="home-closing-copy">
              <h2 id="home-closing-title">Let’s talk about what you’re building.</h2>
              <p>
                If you’re hiring for senior product engineering, need a technical partner for a
                difficult interface, or want to talk through the work, I’d be glad to hear from you.
              </p>
              <div className="home-closing-actions">
                <Link className="primary-action dark-action" href="/contact">
                  Start a conversation <span aria-hidden="true">→</span>
                </Link>
                <a className="home-closing-resume" href="/carl-welch-resume.pdf" download>
                  Résumé <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
