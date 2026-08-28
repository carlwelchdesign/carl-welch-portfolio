import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MotionRuntime, Reveal } from '../../motion-elements';
import { getProject, projects } from '../../portfolio-data';
import { ArchitectureDiagram, PageFrame, ProjectGallery, ProjectStory } from '../../site-components';
import { buildPageMetadata } from '../../site-metadata';
import { publicEvidenceAnchorId } from '../../jolene/public-evidence-navigation-core';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return {};

  return buildPageMetadata({
    title: project.name,
    description: project.summary,
    path: `/work/${project.slug}`,
    image: {
      url: `/social/${project.slug}.png`,
      width: 1200,
      height: 630,
      alt: `${project.name} case study by Carl Welch`,
    },
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

  const projectIndex = projects.findIndex((candidate) => candidate.slug === project.slug);
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content" className={`project-detail project-detail-${project.tone}`} data-tone={project.tone}>
          <header
            className="project-detail-hero"
            id={publicEvidenceAnchorId(project.sourceId)}
            data-evidence-target
            tabIndex={-1}
            aria-label={`${project.name} case study`}
          >
            <p className="eyebrow">Selected work / {project.number}</p>
            <h1 className={project.name.length >= 24 ? 'long-project-title' : undefined}>{project.name}</h1>
            <div className="project-detail-deck">
              <p>{project.summary}</p>
            </div>
            <dl className="project-facts" aria-label={`${project.name} project facts`}>
              <div>
                <dt>My role</dt>
                <dd>{project.role}</dd>
              </div>
              <div>
                <dt>Scope</dt>
                <dd>{project.scope}</dd>
              </div>
              <div>
                <dt>Stage</dt>
                <dd>{project.status}</dd>
              </div>
              <div>
                <dt>Core technologies</dt>
                <dd>{project.stack.slice(0, 4).join(' · ')}</dd>
              </div>
            </dl>
          </header>

          <Reveal className="project-detail-image">
            <Image
              src={project.image.src}
              alt={project.image.alt}
              width={project.image.width}
              height={project.image.height}
              priority
              sizes="100vw"
            />
          </Reveal>

          <ProjectStory project={project} />

          <ProjectGallery project={project} />

          <section id="architecture" className="project-detail-section" aria-labelledby="architecture-title">
            <p className="eyebrow">Technical view</p>
            <h2 id="architecture-title">Architecture</h2>
            <ArchitectureDiagram architecture={project.architecture} tone={project.tone} />
          </section>

          <section
            id="evidence"
            className="evidence-grid"
            data-evidence-target
            tabIndex={-1}
            aria-label={`${project.name} evidence and boundaries`}
          >
            <div>
              <p className="eyebrow">Built so far</p>
              <ul>
                {project.evidence.map((item) => (
                  <li
                    key={item.id}
                    id={publicEvidenceAnchorId(item.id)}
                    data-evidence-target
                    tabIndex={-1}
                    aria-label={item.text}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div
              id={publicEvidenceAnchorId(`portfolio:limitation:project:${project.slug}`)}
              data-evidence-target
              tabIndex={-1}
              aria-label={`${project.name} current status`}
            >
              <p className="eyebrow">Where it stands</p>
              <ul>
                {project.boundaries.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </section>

          <section className="project-links" aria-label="Project links">
            <a className="primary-action" href={project.repositoryUrl}>Repository <span aria-hidden="true">↗</span></a>
            {project.liveUrl ? <a className="primary-action" href={project.liveUrl}>Live demo <span aria-hidden="true">↗</span></a> : null}
          </section>

          <section className="project-continuation" aria-labelledby="project-continuation-title">
            <div className="project-continuation-heading">
              <div>
                <p className="eyebrow">Continue exploring</p>
                <h2 id="project-continuation-title">Next case study</h2>
              </div>
              <Link className="text-action" href="/work">View all selected work <span aria-hidden="true">→</span></Link>
            </div>

            <Link
              className="project-continuation-card"
              href={`/work/${nextProject.slug}`}
              data-tone={nextProject.tone}
              aria-label={`Next case study: ${nextProject.name}`}
            >
              <div className="project-continuation-copy">
                <p className="eyebrow">{nextProject.category}</p>
                <h3>{nextProject.name}</h3>
                <p>{nextProject.status}</p>
                <span>Open case study <span aria-hidden="true">→</span></span>
              </div>
              <div className="project-continuation-image">
                <Image
                  src={nextProject.image.src}
                  alt=""
                  width={nextProject.image.width}
                  height={nextProject.image.height}
                  sizes="(max-width: 720px) 100vw, 58vw"
                />
              </div>
            </Link>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
