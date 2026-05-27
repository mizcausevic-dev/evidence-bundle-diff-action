const REASON_LABEL = {
    "bundle-version-changed": "Bundle schema version changed",
    "bundle-id-changed": "Bundle id changed",
    "bundle-subject-changed": "Bundle subject changed",
    "bundle-purpose-changed": "Bundle purpose changed",
    "bundle-creator-changed": "Bundle creator changed",
    "bundle-expires-extended": "Expiration extended",
    "bundle-expires-shortened": "Expiration shortened",
    "bundle-expires-removed": "Expiration removed",
    "bundle-expires-added": "Expiration added",
    "item-added": "Item added",
    "item-removed": "Item removed",
    "item-hash-changed": "Item content hash changed",
    "item-size-changed": "Item size changed",
    "item-media-type-changed": "Item media type changed",
    "item-source-uri-changed": "Item source URI changed",
    "relationship-added": "Relationship added",
    "relationship-removed": "Relationship removed",
    "provenance-changed": "Provenance block changed",
    "signature-added": "Signature added",
    "signature-removed": "Signature removed",
    "signature-signer-changed": "Signer identity changed",
    "signature-algorithm-changed": "Signature algorithm changed"
};
export function toMarkdown(diff) {
    if (diff.changes.length === 0)
        return `**No changes.** Manifests are equivalent.`;
    const lines = [];
    lines.push(diff.breaking ? `## Evidence Bundle diff (**BREAKING**)` : `## Evidence Bundle diff`);
    lines.push(``);
    lines.push(`| change | detail |`);
    lines.push(`|---|---|`);
    for (const c of diff.changes) {
        lines.push(`| ${REASON_LABEL[c.reason] ?? c.reason} | ${c.detail ?? ""} |`);
    }
    return lines.join("\n");
}
export function toSummary(diff) {
    if (diff.changes.length === 0)
        return "no changes";
    return `${diff.breaking ? "BREAKING " : ""}${diff.changes.length} change${diff.changes.length === 1 ? "" : "s"}`;
}
