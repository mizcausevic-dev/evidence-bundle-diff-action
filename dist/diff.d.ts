import { type BundleDiff, type DiffOptions, type Manifest } from "./types.js";
/** Diff two evidence-bundle manifests; classify each change and flag breaking. */
export declare function diffManifests(previous: Manifest, next: Manifest, _opts?: DiffOptions): BundleDiff;
