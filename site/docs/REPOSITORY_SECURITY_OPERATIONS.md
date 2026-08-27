# Repository security operations

Status recorded 2026-08-27 for the private `carlwelchdesign/carl-welch-portfolio` repository.

## Active controls

- GitHub vulnerability alerts are enabled.
- GitHub automated security fixes are enabled and not paused.
- Dependabot checks pnpm dependencies in `/site`, the production Dockerfile in `/site`, and pinned GitHub Actions in `/` every Monday morning in `America/Los_Angeles`.
- Routine minor and patch npm updates are grouped by production or development scope. Major updates remain separately reviewable.
- Dependabot PRs are bounded to five npm, two Docker, and three Actions updates at a time and use the `dependencies` and `security` labels.
- Every pull request and push to `main` rebuilds the production image, scans operating-system and library packages with Trivy, fails on fixed HIGH or CRITICAL vulnerabilities, starts the hardened container, and verifies its health and runtime boundary.
- Dependency updates are ordinary pull requests. They must pass the same review, browser, container, security, and production-deployment process as human-authored changes.

## Account-plan boundary

GitHub's APIs reported secret scanning and code scanning unavailable or disabled for this private repository at the time of review. They are not claimed as active. Do not add a CodeQL workflow that will fail without the required GitHub Advanced Security entitlement.

The current compensating controls are pinned action SHAs, repository and build-time credential scans, privacy checks, dependency lockfiles, Dependabot, vulnerability alerts, automated security fixes, and Trivy image scanning. If the repository becomes public or the account gains GitHub Advanced Security, create a separate reviewed change to enable secret scanning, push protection, and CodeQL, then prove their alert APIs and required checks are active.

## Review and response

- Review grouped minor/patch updates for release notes, runtime or browser behavior, and lockfile integrity.
- Review majors individually; never merge a major because its checks merely compile.
- Treat a reachable critical vulnerability or exposed secret as P0. Disable affected production capability, rotate credentials, preserve minimal evidence, and create a private incident ticket.
- Treat a reachable high vulnerability as P1 and prioritize a bounded remediation PR.
- Do not paste scanner payloads, tokens, local paths, Sentry visitor content, or private Jolene context into public PRs or logs.
- Recheck repository security settings quarterly and after visibility, billing, organization, or ownership changes.
