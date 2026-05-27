// Diff two evidence-bundle manifests per evidence-bundle-spec v0.1.
// Reference: https://github.com/mizcausevic-dev/evidence-bundle-spec
/**
 * Reasons that invalidate a downstream consumer's prior assumptions about
 * the bundle's integrity, scope, or origin. Hash changes on existing items
 * are the headline case — items must be replaced, not silently rewritten.
 */
export const BREAKING_REASONS = new Set([
    "bundle-version-changed",
    "bundle-id-changed",
    "item-hash-changed",
    "item-removed",
    "signature-removed",
    "signature-signer-changed",
    "signature-algorithm-changed",
    "bundle-expires-shortened",
    "bundle-purpose-changed"
]);
