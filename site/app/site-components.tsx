import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { careerChapters, characterSignals } from './career-story-data';
import { contact } from './contact-data';
import { homepageLegacyWork } from './legacy-career-visuals';
import type { PortfolioProject, ProjectArchitecture, ProjectTone } from './portfolio-data';
import { ArchitectureFlow, ImageDrift, NodePulse, Reveal } from './motion-elements';
import { ProjectMediaViewer } from './project-media-viewer';
import { SiteHeader } from './site-header';

type ToneStyle = CSSProperties & { '--chapter-tone': string };

const toneColors: Record<ProjectTone, string> = {
  red: '#ff4338',
  orange: '#ff6800',
  green: '#62e879',
};

export function CareerPortraitPreview() {
  return (
    <section className="career-portrait-preview" data-tone="orange" aria-labelledby="career-portrait-title">
      <Reveal className="career-portrait-heading">
        <p className="eyebrow">The long view</p>
        <h2 id="career-portrait-title">The current work has a history.</h2>
      </Reveal>
      <div className="career-portrait-layout">
        <p>
          Before React and applied AI, I was managing designers and programmers, building
          PHP and MySQL applications, prototyping immersive training systems, shaping
          Evidence.com workflows, and, yes, making graphics for GWAR. That earlier work still
          shapes how I engineer products now.
        </p>
        <ol className="career-portrait-steps">
          {careerChapters.map((chapter) => (
            <li key={chapter.number}>
              <span>{chapter.number}</span>
              <div>
                <small>{chapter.period}</small>
                <strong>{chapter.title}</strong>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="career-portrait-proof">
        <header>
          <p className="eyebrow">From the archive</p>
          <p>
            <span>Four selected examples</span>
            <span>Swipe to browse <span aria-hidden="true">→</span></span>
          </p>
        </header>
        <ol>
          {homepageLegacyWork.map((item) => (
            <li key={item.id}>
              <a href={`/archive#${item.id}`} aria-label={`View ${item.project} in the archive`}>
                <figure>
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    width={item.image.width}
                    height={item.image.height}
                    sizes="(max-width: 720px) 78vw, 25vw"
                    unoptimized
                  />
                </figure>
                <div>
                  <small>{item.context}</small>
                  <strong>{item.project}</strong>
                  <span aria-hidden="true">↗</span>
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
      <Link className="primary-action dark-action" href="/archive">
        Explore the career arc <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export function CharacterSignals() {
  return (
    <section className="character-signals" data-tone="red" aria-labelledby="character-signals-title">
      <header>
        <p className="eyebrow">How people describe the work</p>
        <h2 id="character-signals-title">The pattern shows up in other people’s words.</h2>
      </header>
      <div className="character-signal-grid">
        {characterSignals.map((signal) => (
          <figure key={signal.recommendationId}>
            <figcaption>{signal.label}</figcaption>
            <blockquote>
              <p>“{signal.quote}”</p>
            </blockquote>
            <p>{signal.attribution}</p>
          </figure>
        ))}
      </div>
      <Link className="primary-action" href="/recommendations">
        Read all recommendations <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export function SelectedArchive({
  showArchiveLink = true,
  archiveReturnHref,
}: {
  showArchiveLink?: boolean;
  archiveReturnHref?: string;
}) {
  return (
    <section id="yuco" className="selected-archive" data-tone="orange" aria-labelledby="selected-archive-title">
      <div className="selected-archive-heading">
        <div>
          <p className="eyebrow">Selected archive / 2006–2007</p>
          <h2 id="selected-archive-title">yU+co studio website</h2>
        </div>
        <p>
          An early interactive-development project built with ActionScript 2, video, XML,
          and multi-user technology. The studio site received a 2006 Graphic Design USA
          Certificate of Excellence in Communication and Graphic Design and was named a
          2006 Webby Awards Honoree.
        </p>
      </div>
      <div className="selected-archive-record">
        <figure className="selected-archive-art">
          <Image
            src="/archive/yuco-studio-site.png"
            alt="Minimal white yU+co website interface with branching navigation labeled Work, Clients, and News."
            width={620}
            height={400}
            sizes="(max-width: 1000px) 100vw, 58vw"
          />
          <figcaption>Archived interface</figcaption>
        </figure>
        <div>
          <p className="eyebrow">Carl’s contribution</p>
          <p>
            Carl contributed interactive development using ActionScript 2, video, XML, and
            multi-user technology. The two awards recognize the site and its team rather than
            sole authorship by any one contributor.
          </p>
          {showArchiveLink ? (
            <Link className="primary-action dark-action selected-archive-link" href="/archive">
              More of the story <span aria-hidden="true">→</span>
            </Link>
          ) : null}
          {archiveReturnHref ? (
            <Link className="archive-map-return" href={archiveReturnHref}>
              Archive map <span aria-hidden="true">↑</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div>
        <p className="eyebrow">Contact</p>
        <p className="footer-name">Carl Welch</p>
      </div>
      <div className="footer-links">
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <a href={contact.linkedinUrl}>LinkedIn ↗</a>
        <a href={contact.githubUrl}>GitHub ↗</a>
        <a href={contact.resumeUrl} download>
          Résumé ↓
        </a>
      </div>
    </footer>
  );
}

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

export function ArchitectureDiagram({
  architecture,
  tone,
  compact = false,
}: {
  architecture: ProjectArchitecture;
  tone: ProjectTone;
  compact?: boolean;
}) {
  const style = { '--chapter-tone': toneColors[tone] } as ToneStyle;
  const nodeById = new Map(architecture.nodes.map((node) => [node.id, node]));
  const markerId = `architecture-arrow-${architecture.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  const connectionPath = (fromId: string, toId: string) => {
    const from = nodeById.get(fromId);
    const to = nodeById.get(toId);
    if (!from || !to) return '';

    const fromWidth = from.width ?? 170;
    const toWidth = to.width ?? 170;
    const fromCenter = { x: from.x + fromWidth / 2, y: from.y + 40 };
    const toCenter = { x: to.x + toWidth / 2, y: to.y + 40 };
    const horizontal = Math.abs(toCenter.x - fromCenter.x) >= Math.abs(toCenter.y - fromCenter.y);

    if (horizontal) {
      const direction = toCenter.x >= fromCenter.x ? 1 : -1;
      const startX = fromCenter.x + direction * fromWidth / 2;
      const endX = toCenter.x - direction * toWidth / 2;
      const control = Math.max(34, Math.abs(endX - startX) * 0.45);
      return `M ${startX} ${fromCenter.y} C ${startX + direction * control} ${fromCenter.y}, ${endX - direction * control} ${toCenter.y}, ${endX} ${toCenter.y}`;
    }

    const direction = toCenter.y >= fromCenter.y ? 1 : -1;
    const startY = fromCenter.y + direction * 40;
    const endY = toCenter.y - direction * 40;
    const control = Math.max(30, Math.abs(endY - startY) * 0.45);
    return `M ${fromCenter.x} ${startY} C ${fromCenter.x} ${startY + direction * control}, ${toCenter.x} ${endY - direction * control}, ${toCenter.x} ${endY}`;
  };

  return (
    <figure
      className={`architecture-card${compact ? ' architecture-card-compact' : ''}`}
      style={style}
      aria-label={`${architecture.title} system architecture topology`}
    >
      <figcaption>
        <span>{architecture.title}</span>
        <span>{String(architecture.nodes.length).padStart(2, '0')} components · {String(architecture.edges.length).padStart(2, '0')} connections</span>
      </figcaption>
      <p className="architecture-summary">{architecture.summary}</p>
      <ArchitectureFlow className="architecture-map-motion">
        <div className="architecture-viewport" tabIndex={0} aria-label="Scrollable architecture diagram">
          <div className="architecture-map">
            {architecture.groups.map((group) => (
              <div
                className="architecture-group"
                data-architecture-group={group.id}
                key={group.id}
                style={{ left: group.x, top: group.y, width: group.width, height: group.height }}
              >
                <strong>{group.label}</strong>
                <span>{group.detail}</span>
              </div>
            ))}
            <svg
              className="architecture-connectors"
              viewBox="0 0 1000 620"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              {architecture.edges.map((edge) => (
                <g key={`${edge.from}-${edge.to}`}>
                  <path
                    className={edge.dashed ? 'architecture-edge-dashed' : undefined}
                    d={connectionPath(edge.from, edge.to)}
                    markerEnd={`url(#${markerId})`}
                    markerStart={edge.bidirectional ? `url(#${markerId})` : undefined}
                  />
                </g>
              ))}
            </svg>
            <ol className="architecture-track">
              {architecture.nodes.map((node, index) => (
              <li
                className="architecture-step"
                data-architecture-node={node.id}
                data-node-kind={node.kind}
                key={node.id}
                style={{ left: node.x, top: node.y, width: node.width ?? 170 }}
              >
                <div className="architecture-step-meta">
                  <small>{node.technology}</small>
                  <NodePulse delay={index * 0.22} />
                </div>
                <strong>{node.label}</strong>
                <p>{node.detail}</p>
              </li>
              ))}
            </ol>
          </div>
        </div>
      </ArchitectureFlow>
      <div className="architecture-legend" aria-label="Architecture component legend">
        {['surface', 'service', 'data', 'ai', 'integration', 'control', 'runtime'].map((kind) => (
          <span key={kind} data-node-kind={kind}><i aria-hidden="true" />{kind}</span>
        ))}
      </div>
      <details className="architecture-connections">
        <summary>Read system connections</summary>
        <ul>
          {architecture.edges.map((edge) => (
            <li key={`${edge.from}-${edge.to}-description`}>
              <strong>{nodeById.get(edge.from)?.label}</strong>
              <span>{edge.bidirectional ? ' ↔ ' : ' → '}</span>
              <strong>{nodeById.get(edge.to)?.label}</strong>
              {edge.label ? <small>{edge.label}</small> : null}
            </li>
          ))}
        </ul>
      </details>
    </figure>
  );
}

export function ProjectChapter({ project, priority = false }: { project: PortfolioProject; priority?: boolean }) {
  const style = { '--chapter-tone': toneColors[project.tone] } as ToneStyle;
  const previewMedia = project.gallery;

  return (
    <section
      id={`work-${project.slug}`}
      className="project-chapter"
      data-tone={project.tone}
      style={style}
      aria-labelledby={`${project.slug}-title`}
    >
      <Reveal className="section-heading">
        <div>
          <p className="eyebrow">Selected work / {project.number}</p>
          <h2
            id={`${project.slug}-title`}
            className={project.name.length >= 24 ? 'long-project-title' : undefined}
          >
            {project.name}
          </h2>
        </div>
        <div className="project-meta">
          <span>{project.category}</span>
          <span>{project.status}</span>
          <Link className="project-index-return" href="#work-index">
            Project index <span aria-hidden="true">↑</span>
          </Link>
        </div>
      </Reveal>

      <div className="project-image-wrap">
        <ImageDrift>
          <Link
            className="project-image-link"
            href={`/work/${project.slug}`}
            aria-label={`View ${project.name} case study`}
          >
            <Image
              className="project-image"
              src={project.image.src}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              priority={priority}
              sizes="(max-width: 1000px) 100vw, 88vw"
            />
            <span className="project-image-link-label" aria-hidden="true">View case study →</span>
          </Link>
        </ImageDrift>
      </div>

      <div
        className={`project-media-preview project-media-preview-${previewMedia.length}`}
        aria-label={`${project.name} additional project images`}
      >
        {previewMedia.map((item) => (
          <Link
            key={item.src}
            href={`/work/${project.slug}#project-gallery`}
            data-layout={item.layout ?? 'standard'}
          >
            <Image
              src={item.src}
              alt=""
              width={item.width}
              height={item.height}
              sizes="(max-width: 720px) 82vw, 30vw"
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="project-layout">
        <Reveal className="project-overview">
          <p>{project.summary}</p>
          <ul className="stack-list" aria-label={`${project.name} technologies`}>
            {project.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link className="primary-action dark-action" href={`/work/${project.slug}`}>
            View project <span aria-hidden="true">→</span>
          </Link>
        </Reveal>

        <ArchitectureDiagram architecture={project.architecture} tone={project.tone} compact />
      </div>
    </section>
  );
}

export function WorkIndex({ items }: { items: PortfolioProject[] }) {
  return (
    <nav id="work-index" className="work-index" aria-labelledby="work-index-title">
      <Reveal className="work-index-heading">
        <p className="eyebrow">Jump to a case study</p>
        <h2 id="work-index-title">Project index</h2>
        <p>Five flagship projects, organized for a quick scan.</p>
      </Reveal>
      <ol>
        {items.map((project) => (
          <li key={project.slug} style={{ '--chapter-tone': toneColors[project.tone] } as ToneStyle}>
            <Link href={`#work-${project.slug}`}>
              <span className="work-index-number">{project.number}</span>
              <strong>{project.name}</strong>
              <span className="work-index-category">{project.category}</span>
              <span className="work-index-status">{project.status}</span>
              <span className="work-index-arrow" aria-hidden="true">↓</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ProjectGallery({ project }: { project: PortfolioProject }) {
  return (
    <section id="project-gallery" className="project-gallery" aria-labelledby="project-gallery-title">
      <Reveal className="project-gallery-heading">
        <p className="eyebrow">Inside the work / {String(project.gallery.length + 1).padStart(2, '0')} views</p>
        <h2 id="project-gallery-title">{project.galleryTitle}</h2>
        <p>{project.gallerySummary}</p>
      </Reveal>

      <ProjectMediaViewer projectName={project.name} media={project.gallery} />
    </section>
  );
}

export function ProjectStory({ project }: { project: PortfolioProject }) {
  return (
    <section id="case-study" className="project-story" aria-labelledby="project-story-title">
      <Reveal className="project-story-heading">
        <p className="eyebrow">Case study</p>
        <h2 id="project-story-title">{project.story.heading}</h2>
      </Reveal>

      <div className="project-story-lead">
        <article>
          <p className="eyebrow">The problem</p>
          <p>{project.story.problem}</p>
        </article>
        <article>
          <p className="eyebrow">What I built</p>
          <p>{project.story.contribution}</p>
        </article>
      </div>

      <div className="project-story-decisions">
        <p className="eyebrow">Key decisions</p>
        <ol>
          {project.story.decisions.map((decision, index) => (
            <li key={decision.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{decision.title}</strong>
              <p>{decision.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function PageIntro({ eyebrow, title, summary }: { eyebrow: string; title: string; summary: string }) {
  return (
    <header className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{summary}</p>
    </header>
  );
}
