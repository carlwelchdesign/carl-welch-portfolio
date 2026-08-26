# Carl Welch Portfolio

Motion-led portfolio site for Carl Welch. The application is intentionally kept local until content, recommendation publication, domain, and deployment are approved.

## Development

- `pnpm dev` starts the local site.
- `pnpm check` runs lint, content-integrity checks, the public Jolene contract checks, and the production build.
- `pnpm check:jolene-contract` compiles and exercises the proposed public Jolene v1 contract, deterministic fixtures, runtime validation, citation integrity, and failure states.
- `pnpm check:github` compares the checked-in public-repository snapshot with Carl's current public GitHub repositories.
- `pnpm check:routes` checks the running local site's page structure, metadata, indexing gates, sitemap, archive images, and résumé response.

The application requires Node.js 22.13 or newer.

## Content boundaries

- `app/portfolio-data.ts` contains the detailed case studies and verified experience summaries.
- `app/capabilities-data.ts` maps capability claims to case studies, repositories, experience, and attributed recommendations. Content checks prevent broken evidence references.
- `app/contact-data.ts` contains the résumé-verified public contact routes used by the header, footer, and contact page.
- `app/github-projects.ts` contains the curated public GitHub archive snapshot. Repository descriptions and verified live links remain hand-reviewed; a live check reports repository-list, language, URL, and update-date drift but does not overwrite copy.
- `app/recommendations-data.ts` contains recommendation candidates from the working LinkedIn fixture. The route remains excluded from search until it is reconciled with an official export and approved.
- `public/github/` contains local copies of GitHub preview imagery so the archive does not depend on GitHub's image rate limits at runtime.

## Public Jolene development boundary

The files under `app/jolene/` define a proposed public v1 contract, runtime validation, a narrow portfolio-side adapter, and deterministic development fixtures. They do not call a live Jolene service and do not imply that the proposed public endpoints exist.

The portfolio must never call Jolene's private API, mount or read Obsidian, access private durable memory, or invoke private MCP tools. A future live adapter may consume only the reviewed, content-minimized public evidence export and public delegate created by `JOL-CAREER-004` and `JOL-CAREER-005`. Until those dependencies pass their own security and evaluation gates, UI work must remain in fixture mode.

Set `NEXT_PUBLIC_SITE_URL` to the approved production origin before publication.
