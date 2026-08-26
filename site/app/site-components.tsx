import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { contact } from './contact-data';
import type { ArchitectureNode, PortfolioProject, ProjectTone } from './portfolio-data';
import { ArchitectureFlow, ImageDrift, NodePulse, Reveal } from './motion-elements';

type ToneStyle = CSSProperties & { '--chapter-tone': string };

const toneColors: Record<ProjectTone, string> = {
  red: '#ff4338',
  orange: '#ff6800',
  green: '#62e879',
};

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Carl Welch home">
        <span className="wordmark-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>Carl Welch</span>
      </Link>

      <nav aria-label="Primary navigation">
        <Link href="/work">Work</Link>
        <Link href="/capabilities">Capabilities</Link>
        <Link href="/experience">Experience</Link>
        <Link href="/recommendations">Recommendations</Link>
      </nav>

      <details className="mobile-navigation">
        <summary>Menu</summary>
        <nav aria-label="Mobile navigation">
          <Link href="/work">Work</Link>
          <Link href="/capabilities">Capabilities</Link>
          <Link href="/experience">Experience</Link>
          <Link href="/recommendations">Recommendations</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </details>

      <Link className="build-label" href="/contact">Contact →</Link>
    </header>
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
  nodes,
  tone,
  compact = false,
}: {
  nodes: ArchitectureNode[];
  tone: ProjectTone;
  compact?: boolean;
}) {
  const style = { '--chapter-tone': toneColors[tone] } as ToneStyle;

  return (
    <figure className={`architecture-card${compact ? ' architecture-card-compact' : ''}`} style={style}>
      <figcaption>
        <span>System architecture</span>
        <span>Repository-grounded</span>
      </figcaption>
      <ArchitectureFlow>
        <div className="architecture-track" aria-hidden="true">
          {nodes.map((node, index) => (
            <div className="architecture-step" key={node.id}>
              <NodePulse delay={index * 0.22} />
              <strong>{node.label}</strong>
              <small>{String(index + 1).padStart(2, '0')}</small>
            </div>
          ))}
        </div>
      </ArchitectureFlow>
      <ol className="architecture-legend">
        {nodes.map((node) => (
          <li key={node.id}>
            <strong>{node.label}</strong>
            <span>{node.detail}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

export function ProjectChapter({ project, priority = false }: { project: PortfolioProject; priority?: boolean }) {
  const style = { '--chapter-tone': toneColors[project.tone] } as ToneStyle;

  return (
    <section
      className="project-chapter"
      data-tone={project.tone}
      style={style}
      aria-labelledby={`${project.slug}-title`}
    >
      <Reveal className="section-heading">
        <div>
          <p className="eyebrow">Selected work / {project.number}</p>
          <h2 id={`${project.slug}-title`}>{project.name}</h2>
        </div>
        <div className="project-meta">
          <span>{project.category}</span>
          <span>{project.status}</span>
        </div>
      </Reveal>

      <div className="project-image-wrap">
        <ImageDrift>
          <Image
            className="project-image"
            src={project.image.src}
            alt={project.image.alt}
            width={project.image.width}
            height={project.image.height}
            priority={priority}
            sizes="(max-width: 1000px) 100vw, 88vw"
          />
        </ImageDrift>
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

        <ArchitectureDiagram nodes={project.architecture} tone={project.tone} compact />
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
