import type { Metadata } from 'next';
import { ArchiveExplorer } from '../archive-explorer';
import { githubProjects } from '../github-projects';
import { MotionRuntime } from '../motion-elements';
import { projects } from '../portfolio-data';
import { PageFrame, PageIntro, ProjectChapter, SelectedArchive, WorkIndex } from '../site-components';
import { buildPageMetadata } from '../site-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Selected Work',
  description: 'Selected product engineering work by Carl Welch, with architecture and technical context.',
  path: '/work',
});

export default function WorkPage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content" tabIndex={-1}>
          <PageIntro
            eyebrow="Work / 2026"
            title="Selected work"
            summary={`${projects.length} detailed case studies and ${githubProjects.length} selected public repositories spanning product systems, applied AI, audio software, and creative technology.`}
          />
          <WorkIndex items={projects} />
          {projects.map((project, index) => (
            <ProjectChapter key={project.slug} project={project} priority={index === 0} />
          ))}
          <SelectedArchive />
          <ArchiveExplorer />
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
