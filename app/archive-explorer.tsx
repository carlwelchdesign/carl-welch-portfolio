'use client';

import Image from 'next/image';
import { AnimatePresence, LayoutGroup, m, useReducedMotion } from 'motion/react';
import { useDeferredValue, useMemo, useState } from 'react';
import { githubProjects, githubSnapshotDate, githubSnapshotLabel, type GitHubProject } from './github-projects';

type ArchiveFilter = 'all' | 'current' | 'library' | 'earlier';
type ArchiveSort = 'updated' | 'name' | 'language';

const filters: Array<{ value: ArchiveFilter; label: string }> = [
  { value: 'all', label: 'All repositories' },
  { value: 'current', label: 'Current work' },
  { value: 'library', label: 'Libraries' },
  { value: 'earlier', label: 'Earlier work' },
];

const languages = Array.from(
  new Set(githubProjects.flatMap((project) => (project.language ? [project.language] : []))),
).sort();

function matchesFilter(project: GitHubProject, filter: ArchiveFilter) {
  if (filter === 'current') return project.kind === 'application';
  if (filter === 'library') return project.kind === 'library';
  if (filter === 'earlier') return project.kind === 'legacy';
  return true;
}

function matchesQuery(project: GitHubProject, query: string) {
  if (!query) return true;
  const searchable = [project.name, project.description, project.language ?? '', ...project.topics]
    .join(' ')
    .toLocaleLowerCase();
  return searchable.includes(query.toLocaleLowerCase());
}

function sortProjects(projects: GitHubProject[], sort: ArchiveSort) {
  return projects.toSorted((left, right) => {
    if (sort === 'name') return left.name.localeCompare(right.name);
    if (sort === 'language') return (left.language ?? 'Unspecified').localeCompare(right.language ?? 'Unspecified');
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  });
}

function githubPreview(project: GitHubProject) {
  return `/github/${project.name}.png`;
}

export function ArchiveExplorer() {
  const [filter, setFilter] = useState<ArchiveFilter>('all');
  const [language, setLanguage] = useState('all');
  const [sort, setSort] = useState<ArchiveSort>('updated');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim());
  const reduceMotion = useReducedMotion();

  const visibleProjects = useMemo(() => {
    const matches = githubProjects.filter(
      (project) =>
        matchesFilter(project, filter) &&
        (language === 'all' || project.language === language) &&
        matchesQuery(project, deferredQuery),
    );
    return sortProjects(matches, sort);
  }, [deferredQuery, filter, language, sort]);

  return (
    <section id="public-repositories" className="archive" aria-labelledby="archive-title">
      <header className="archive-heading">
        <div>
          <p className="eyebrow">GitHub archive</p>
          <h2 id="archive-title">Public repositories</h2>
        </div>
        <p>
          A selection of current products, useful libraries, experiments, and earlier code. Updated <time dateTime={githubSnapshotDate}>{githubSnapshotLabel}</time>. The case studies above tell the deeper product and architecture stories.
        </p>
      </header>

      <div className="archive-controls" role="search" aria-label="Filter public repositories">
        <label className="archive-search">
          <span>Search repositories</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by project, stack, or topic"
          />
        </label>

        <div className="archive-filter-group" aria-label="Repository group">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="archive-select">
          <span>Language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="all">All languages</option>
            {languages.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label className="archive-select">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as ArchiveSort)}>
            <option value="updated">Recently updated</option>
            <option value="name">Project name</option>
            <option value="language">Language</option>
          </select>
        </label>
      </div>

      <div className="archive-result-bar">
        <p aria-live="polite">{visibleProjects.length} of {githubProjects.length} repositories</p>
        {(query || filter !== 'all' || language !== 'all') ? (
          <button type="button" onClick={() => { setQuery(''); setFilter('all'); setLanguage('all'); }}>
            Clear filters
          </button>
        ) : null}
      </div>

      <LayoutGroup>
        <m.ul className="archive-grid" layout={!reduceMotion}>
          <AnimatePresence initial={false} mode="popLayout">
            {visibleProjects.map((project) => (
              <m.li
                key={project.name}
                layout={!reduceMotion}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <article className="archive-card">
                  <a
                    className="archive-image-link"
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${project.name} repository preview on GitHub (opens in a new tab)`}
                  >
                    <Image
                      src={githubPreview(project)}
                      alt=""
                      width={1200}
                      height={600}
                      sizes="(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </a>
                  <div className="archive-card-body">
                    <div className="archive-card-meta">
                      <span>{project.language ?? 'Profile'}</span>
                      <span>{new Date(project.updatedAt).getUTCFullYear()}</span>
                    </div>
                    <h3>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${project.name} repository on GitHub (opens in a new tab)`}
                      >
                        {project.name}
                      </a>
                    </h3>
                    <p>{project.description}</p>
                    <ul aria-label={`${project.name} topics`}>
                      {project.topics.slice(0, 4).map((topic) => <li key={topic}>{topic}</li>)}
                    </ul>
                    <div className="archive-card-links">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${project.name} repository on GitHub (opens in a new tab)`}
                      >
                        Repository ↗
                      </a>
                      {project.homepage ? (
                        <a
                          href={project.homepage}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Open ${project.name} live site (opens in a new tab)`}
                        >
                          Live site ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              </m.li>
            ))}
          </AnimatePresence>
        </m.ul>
      </LayoutGroup>

      {visibleProjects.length === 0 ? (
        <div className="archive-empty">
          <h3>No repositories match those filters.</h3>
          <button type="button" onClick={() => { setQuery(''); setFilter('all'); setLanguage('all'); }}>
            Show the full archive
          </button>
        </div>
      ) : null}
    </section>
  );
}
