import type { Metadata } from 'next';
import Image from 'next/image';
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
      url: project.image.src,
      width: project.image.width,
      height: project.image.height,
      alt: project.image.alt,
    },
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) notFound();

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
            <h1>{project.name}</h1>
            <div className="project-detail-deck">
              <p>{project.summary}</p>
              <div className="project-meta">
                <span>{project.category}</span>
                <span>{project.status}</span>
              </div>
            </div>
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
            <ArchitectureDiagram nodes={project.architecture} tone={project.tone} />
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
              aria-label={`${project.name} current boundaries`}
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
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
