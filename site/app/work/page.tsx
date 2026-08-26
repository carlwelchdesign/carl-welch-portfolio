import type { Metadata } from 'next';
import { ArchiveExplorer } from '../archive-explorer';
import { githubProjects } from '../github-projects';
import { MotionRuntime } from '../motion-elements';
import { projects } from '../portfolio-data';
import { PageFrame, PageIntro, ProjectChapter } from '../site-components';

export const metadata: Metadata = {
  title: 'Selected Work',
  description: 'Selected product engineering work by Carl Welch, with architecture and technical context.',
};

export default function WorkPage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content">
          <PageIntro
            eyebrow="Work / 2026"
            title="Selected work"
            summary={`Three detailed case studies, followed by all ${githubProjects.length} public repositories. Status, constraints, and older work remain visible instead of being rewritten as equal flagship projects.`}
          />
          {projects.map((project, index) => (
            <ProjectChapter key={project.slug} project={project} priority={index === 0} />
          ))}
          <ArchiveExplorer />
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
