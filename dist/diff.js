import { BREAKING_REASONS } from "./types.js";
function relKey(r) {
    return `${r.subject} ${r.predicate} ${r.object}`;
}
/** Diff two evidence-bundle manifests; classify each change and flag breaking. */
export function diffManifests(previous, next, _opts = {}) {
    assertManifest(previous, "previous");
    assertManifest(next, "next");
    const changes = [];
    const push = (reason, detail) => {
        const e = { reason };
        if (detail !== undefined)
            e.detail = detail;
        changes.push(e);
    };
    // ─── bundle meta ───────────────────────────────────────────────────────
    if (previous.evidence_bundle_version !== next.evidence_bundle_version) {
        push("bundle-version-changed", `${previous.evidence_bundle_version} → ${next.evidence_bundle_version}`);
    }
    if (previous.bundle.id !== next.bundle.id)
        push("bundle-id-changed", `${previous.bundle.id} → ${next.bundle.id}`);
    if (previous.bundle.subject !== next.bundle.subject)
        push("bundle-subject-changed");
    if ((previous.bundle.purpose ?? "") !== (next.bundle.purpose ?? "")) {
        push("bundle-purpose-changed", `${previous.bundle.purpose ?? "—"} → ${next.bundle.purpose ?? "—"}`);
    }
    if (previous.bundle.creator !== next.bundle.creator) {
        push("bundle-creator-changed", `${previous.bundle.creator} → ${next.bundle.creator}`);
    }
    // expires_at
    const prevExp = previous.bundle.expires_at ? Date.parse(previous.bundle.expires_at) : NaN;
    const nextExp = next.bundle.expires_at ? Date.parse(next.bundle.expires_at) : NaN;
    if (previous.bundle.expires_at && !next.bundle.expires_at)
        push("bundle-expires-removed");
    if (!previous.bundle.expires_at && next.bundle.expires_at)
        push("bundle-expires-added", next.bundle.expires_at);
    if (!Number.isNaN(prevExp) && !Number.isNaN(nextExp)) {
        if (nextExp > prevExp)
            push("bundle-expires-extended", `${previous.bundle.expires_at} → ${next.bundle.expires_at}`);
        else if (nextExp < prevExp)
            push("bundle-expires-shortened", `${previous.bundle.expires_at} → ${next.bundle.expires_at}`);
    }
    // ─── items ─────────────────────────────────────────────────────────────
    const prevItems = new Map();
    for (const i of previous.items)
        prevItems.set(i.id, i);
    const nextItems = new Map();
    for (const i of next.items)
        nextItems.set(i.id, i);
    const addedItems = [];
    const removedItems = [];
    for (const id of nextItems.keys()) {
        if (!prevItems.has(id)) {
            addedItems.push(id);
            push("item-added", id);
        }
    }
    for (const id of prevItems.keys()) {
        if (!nextItems.has(id)) {
            removedItems.push(id);
            push("item-removed", id);
        }
    }
    for (const [id, prev] of prevItems) {
        const next2 = nextItems.get(id);
        if (!next2)
            continue;
        if (prev.sha256 !== next2.sha256)
            push("item-hash-changed", `${id} (${prev.sha256.slice(0, 12)}… → ${next2.sha256.slice(0, 12)}…)`);
        if (prev.size_bytes !== next2.size_bytes)
            push("item-size-changed", `${id} (${prev.size_bytes} → ${next2.size_bytes})`);
        if (prev.media_type !== next2.media_type)
            push("item-media-type-changed", `${id} (${prev.media_type} → ${next2.media_type})`);
        if ((prev.source_uri ?? "") !== (next2.source_uri ?? ""))
            push("item-source-uri-changed", id);
    }
    // ─── relationships ─────────────────────────────────────────────────────
    const prevRels = new Set((previous.relationships ?? []).map(relKey));
    const nextRels = new Set((next.relationships ?? []).map(relKey));
    const addedRels = [];
    const removedRels = [];
    for (const r of nextRels)
        if (!prevRels.has(r)) {
            addedRels.push(r);
            push("relationship-added", r);
        }
    for (const r of prevRels)
        if (!nextRels.has(r)) {
            removedRels.push(r);
            push("relationship-removed", r);
        }
    // ─── provenance (treated as one opaque blob — change-or-not) ──────────
    if (JSON.stringify(previous.provenance ?? null) !== JSON.stringify(next.provenance ?? null)) {
        push("provenance-changed");
    }
    // ─── signature ─────────────────────────────────────────────────────────
    const prevSig = previous.signature;
    const nextSig = next.signature;
    if (prevSig && !nextSig)
        push("signature-removed");
    if (!prevSig && nextSig)
        push("signature-added", `${nextSig.algorithm}/${nextSig.signer}`);
    if (prevSig && nextSig) {
        if (prevSig.signer !== nextSig.signer)
            push("signature-signer-changed", `${prevSig.signer} → ${nextSig.signer}`);
        if (prevSig.algorithm !== nextSig.algorithm)
            push("signature-algorithm-changed", `${prevSig.algorithm} → ${nextSig.algorithm}`);
    }
    const breaking = changes.some((c) => BREAKING_REASONS.has(c.reason));
    return {
        changes,
        breaking,
        added: { items: addedItems.sort(), relationships: addedRels.sort() },
        removed: { items: removedItems.sort(), relationships: removedRels.sort() }
    };
}
function assertManifest(m, side) {
    if (!m || typeof m !== "object")
        throw new Error(`${side} must be a Manifest object`);
    if (!m.bundle)
        throw new Error(`${side}.bundle is required`);
    if (!Array.isArray(m.items))
        throw new Error(`${side}.items must be an array`);
}
