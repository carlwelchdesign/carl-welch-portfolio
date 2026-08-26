# Portfolio delivery policy

This repository is private at `https://github.com/carlwelchdesign/carl-welch-portfolio`. A change to repository visibility requires Carl's explicit approval. Publishing the portfolio is a separate decision from maintaining its source repository.

## Change flow

1. Start each implementation ticket from the current `main` branch on a dedicated `codex/<ticket>-<scope>` branch.
2. Preserve unrelated work and commit only the ticket's intended files.
3. Run the focused checks for the change and the full `pnpm check` command from `site/`.
4. Open a pull request that records the outcome, verification, remaining risks, and approval boundaries.
5. Require the `Portfolio container / build-and-smoke-test` workflow to pass before merge. That workflow builds the production image, rejects known fixed high or critical vulnerabilities, starts the hardened container, waits for health, and verifies its runtime and secret boundaries.
6. Merge through the pull request, delete the feature branch when practical, and require the post-merge `main` workflow to pass.
7. Record the branch, pull request, checks, and final run in the corresponding Asana ticket.

Direct pushes to `main`, skipped checks, and merging during an unresolved CI outage are prohibited by project policy. An emergency exception requires Carl's explicit approval and a documented follow-up verification run.

## Enforcement boundary

GitHub's enforced branch-protection feature is not available for this private repository on the current account tier. Until Carl approves either a supporting account change or a visibility change, the pull-request and required-check rules above are enforced as an owner policy rather than a GitHub ruleset.

This limitation must not be worked around by making the repository public, weakening the workflow, or treating a queued or missing check as successful. When enforced protection becomes available, configure `main` to require the `build-and-smoke-test` status and prevent force pushes and branch deletion.

## Secret and artifact boundary

- Never commit `.env`, credentials, private keys, provider tokens, private career evidence, Obsidian content, or Jolene private memory.
- Public `NEXT_PUBLIC_` values may configure the browser build; secrets must not use that prefix or Docker build arguments.
- Keep dependencies, build output, local deployment state, Git history, and environment files outside the Docker build context.
- Before the first push and after any sensitive integration change, scan tracked files and history by filename, credential signature, and oversized blob. Report only affected paths, never suspected secret values.
- Generated screenshots and review exports belong in approved artifact locations, not the production application bundle unless the site intentionally uses them.

## Approval gates that remain separate

Repository maintenance and green CI do not authorize deployment. Production origin selection, hosted configuration, recommendation publication, public Jolene activation, analytics, and release remain separately tracked approval gates.
