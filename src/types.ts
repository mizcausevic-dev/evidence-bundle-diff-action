// Diff two evidence-bundle manifests per evidence-bundle-spec v0.1.
// Reference: https://github.com/mizcausevic-dev/evidence-bundle-spec

export type BundlePurpose =
  | "rag-citation-pack"
  | "audit-evidence"
  | "compliance-disclosure"
  | "incident-response"
  | "due-diligence"
  | "regulatory-submission"
  | "other";

export type RelationshipPredicate =
  | "cites"
  | "supersedes"
  | "derived-from"
  | "contradicts"
  | "summarizes"
  | "redaction-of";

export type SignatureAlgorithm = "ed25519" | "bls12-381-aggregate";

export interface ManifestItem {
  id: string;
  path: string;
  media_type: string;
  sha256: string;
  size_bytes: number;
  source_uri?: string;
  retrieved_at?: string;
  description?: string;
  labels?: Record<string, string>;
}

export interface Relationship {
  subject: string;
  predicate: RelationshipPredicate;
  object: string;
  note?: string;
}

export interface Provenance {
  agent_card_uri?: string;
  tool_card_uri?: string;
  prompt_provenance_uri?: string;
  otel_trace_id?: string;
  model?: string;
  retrieval_query?: string;
}

export interface Signature {
  algorithm: SignatureAlgorithm;
  signer: string;
  value: string;
  signed_at?: string;
}

export interface Manifest {
  evidence_bundle_version: string;
  bundle: {
    id: string;
    subject: string;
    purpose?: BundlePurpose;
    created_at?: string;
    creator: string;
    expires_at?: string;
    labels?: Record<string, string>;
  };
  items: ManifestItem[];
  relationships?: Relationship[];
  provenance?: Provenance;
  signature?: Signature;
}

export type ChangeReason =
  | "bundle-version-changed"
  | "bundle-id-changed"
  | "bundle-subject-changed"
  | "bundle-purpose-changed"
  | "bundle-creator-changed"
  | "bundle-expires-extended"
  | "bundle-expires-shortened"
  | "bundle-expires-removed"
  | "bundle-expires-added"
  | "item-added"
  | "item-removed"
  | "item-hash-changed"
  | "item-size-changed"
  | "item-media-type-changed"
  | "item-source-uri-changed"
  | "relationship-added"
  | "relationship-removed"
  | "provenance-changed"
  | "signature-added"
  | "signature-removed"
  | "signature-signer-changed"
  | "signature-algorithm-changed";

/**
 * Reasons that invalidate a downstream consumer's prior assumptions about
 * the bundle's integrity, scope, or origin. Hash changes on existing items
 * are the headline case — items must be replaced, not silently rewritten.
 */
export const BREAKING_REASONS: ReadonlySet<ChangeReason> = new Set([
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

export interface DiffEntry {
  reason: ChangeReason;
  detail?: string;
}

export interface BundleDiff {
  changes: DiffEntry[];
  breaking: boolean;
  added: { items: string[]; relationships: string[] };
  removed: { items: string[]; relationships: string[] };
}

export interface DiffOptions {
  /** When true, also fail on non-breaking changes. */
  strict?: boolean;
}
