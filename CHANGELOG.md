# Changelog

## v0.1.0 — 2026-05-27

- Initial release: GitHub Action wrapping `evidence-bundle-diff` as a per-PR evidence-bundle breaking-change gate.
- Inputs: `manifest-path` (required), `base-sha` (default `pull_request.base.sha`), `comment-on-pr` (auto/true/false), `fail-on-breaking` (default true), `fail-on-any-change` (default false), `github-token`.
- Outputs: `breaking`, `change-count`, `new-manifest`.
- Vendored `diffManifests()` + `toMarkdown` from `evidence-bundle-diff`.
- Same diff-action template as `agent-card-diff-action` / `mcp-tool-card-diff-action` / `prompt-provenance-diff-action`.
- Handles 3 edge cases: newly-added manifest (no previous version), malformed previous version, missing manifest-path on disk.
- Composite Node 20 action with `dist/index.js` committed for SHA/tag pinning.
- 14 tests with injected `gitShow` for hermetic execution.
- 3 fixtures inherited from `evidence-bundle-diff` (v1, v2-breaking, v2-nonbreaking).
- **Fourth in the per-protocol diff Action quintet** — follows `agent-card-diff-action`, `mcp-tool-card-diff-action`, `prompt-provenance-diff-action`; next up: otel-genai-diff-action (completes the quintet).
- Node 20/22 CI (lint, typecheck, coverage, build, `npm audit`), AGPL-3.0-or-later, Dependabot.
