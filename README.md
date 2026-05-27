# evidence-bundle-diff-action

[![CI](https://github.com/mizcausevic-dev/evidence-bundle-diff-action/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/evidence-bundle-diff-action/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE)

GitHub Action that **gates PRs touching an evidence-bundle manifest**. Retrieves the previous version via `git show <base.sha>:<manifest-path>`, diffs against HEAD via [`evidence-bundle-diff`](https://github.com/mizcausevic-dev/evidence-bundle-diff), posts the structured diff as a PR comment, and **fails the build on breaking changes** (item hash rewritten, item removed, signature removed/changed, purpose changed, expiry shortened).

**Fourth in the per-protocol diff Action quintet** (agent-card / mcp-tool-card / prompt-provenance / evidence-bundle / otel-genai).

Part of the [Kinetic Gain Suite](https://suite.kineticgain.com/).

---

## Usage

```yaml
name: Evidence Bundle gate
on:
  pull_request:
    paths: ["bundles/**/manifest.json"]

jobs:
  evidence-bundle-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # needed so the Action can `git show base.sha:path`
      - uses: mizcausevic-dev/evidence-bundle-diff-action@v0.1-shipped
        with:
          manifest-path: bundles/case-123/manifest.json
          fail-on-breaking: true
```

> **Important:** Your `checkout` step must use `fetch-depth: 0` so the Action can resolve the base SHA. Otherwise the previous version retrieval returns null and the diff is reported as "new manifest".

## Inputs

| input               | required | default       | description |
|---|---|---|---|
| `manifest-path`     | ✓        | —             | Path (relative to repo root) to the evidence-bundle manifest JSON file. |
| `base-sha`          |          | `pull_request.base.sha` | Override the base SHA. |
| `comment-on-pr`     |          | `auto`        | `auto` posts only on `pull_request` events. |
| `fail-on-breaking`  |          | `true`        | Fail when the diff is BREAKING. |
| `fail-on-any-change`|          | `false`       | Fail on ANY diff (frozen-bundle workflow). |
| `github-token`      |          | `${{ github.token }}` | Token used to post the PR comment. |

## Outputs

| output         | description |
|---|---|
| `breaking`     | `true` iff the diff is BREAKING. |
| `change-count` | Number of changes detected. |
| `new-manifest` | `true` iff the file didn't exist at base SHA (newly added manifest). |

## What it detects

Same change reasons as [`evidence-bundle-diff`](https://github.com/mizcausevic-dev/evidence-bundle-diff) — breaking reasons include `item-hash-changed`, `item-removed`, `signature-removed`, `signature-signer-changed`, `signature-algorithm-changed`, `bundle-id-changed`, `bundle-version-changed`, `bundle-purpose-changed`, `bundle-expires-shortened`.

## How it handles edge cases

- **New manifest** (file didn't exist at base SHA) → no diff, exits 0, sets `new-manifest=true`.
- **Malformed previous version** → warns and treats as new manifest.
- **manifest-path doesn't exist on disk** → exits 1 with a clear error.
- **Non-PR context** (push, manual dispatch) → skips PR comment; still emits diff to logs.

## Composes with

- [**`evidence-bundle-diff`**](https://github.com/mizcausevic-dev/evidence-bundle-diff) — the library this wraps.
- [**`evidence-bundle-fleet-summary-action`**](https://github.com/mizcausevic-dev/evidence-bundle-fleet-summary-action) — fleet-level companion.
- [**`evidence-bundle-builder`**](https://github.com/mizcausevic-dev/evidence-bundle-builder) · [**`evidence-bundle-readme-generator`**](https://github.com/mizcausevic-dev/evidence-bundle-readme-generator) · [**`evidence-bundle-spec`**](https://github.com/mizcausevic-dev/evidence-bundle-spec) — full evidence-bundle family.
- Sibling diff actions: [**`agent-card-diff-action`**](https://github.com/mizcausevic-dev/agent-card-diff-action) · [**`mcp-tool-card-diff-action`**](https://github.com/mizcausevic-dev/mcp-tool-card-diff-action) · [**`prompt-provenance-diff-action`**](https://github.com/mizcausevic-dev/prompt-provenance-diff-action) · otel-genai-diff-action (forthcoming).

## License

[AGPL-3.0-or-later](LICENSE)
