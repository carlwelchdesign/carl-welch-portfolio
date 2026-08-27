# Portfolio production operations runbook

Production origin: `https://carl-welch-portfolio.flakeysaturation.chatgpt.site`

This runbook covers the static portfolio release. Public Jolene, the contact-intent handoff, analytics, and the avatar remain disabled and use separate release gates.

## Publish

1. Require a merged `main` commit with a green `Portfolio container` workflow.
2. Build with `NEXT_PUBLIC_SITE_URL` set to the production origin.
3. Push the exact commit to the configured Sites source repository.
4. Package the successful build, save a Sites version, and deploy that saved version.
5. Wait for deployment success before running public checks.
6. Run `check:routes` and `check:production` against the exact production origin.

## Roll back

1. Select the newest previously verified Sites version; never rebuild old source during an incident.
2. Deploy that saved version and wait for a successful terminal status.
3. Verify the homepage and one version-specific route or marker.
4. Record the rollback version, deployment result, reason, and owner in the release ticket.
5. Restore a corrected current version through the same saved-version deployment path.
6. Repeat the full public route and production-performance checks.

## Verified rehearsal

On August 27, 2026, version 3 (`main` commit `234ac70437491a21aa495ad5a92cf633a87774ac`) was deployed, rolled back to version 2, and restored to version 3. During rollback the homepage returned `200` and the version-3-only `/archive` route returned `404`. After restoration, all 11 public routes, metadata, images, evidence anchors, sitemap, and résumé passed again.

## Incident boundary

- A static-site incident is handled by rollback or a reviewed pull request. Do not enable Jolene, analytics, or contact intent as an incident workaround.
- Never place provider credentials, visitor data, job descriptions, transcripts, private career evidence, or Obsidian content in logs or tickets.
- Sentry alerts must link to a deduplicated incident record. Automated agents may investigate and prepare a pull request, but may not deploy or change production access without the release workflow.
