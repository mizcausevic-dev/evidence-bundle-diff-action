import type { BundleDiff } from "./types.js";
export interface RunnerEnv {
    inputs: Record<string, string | undefined>;
    GITHUB_OUTPUT?: string;
    GITHUB_EVENT_NAME?: string;
    GITHUB_REPOSITORY?: string;
    GITHUB_EVENT_PATH?: string;
    readFile?: (path: string) => string;
    exists?: (path: string) => boolean;
    gitShow?: (sha: string, path: string) => string | null;
    postComment?: (args: {
        token: string;
        repo: string;
        issueNumber: number;
        body: string;
    }) => Promise<void>;
    write?: (line: string) => void;
}
export interface RunnerResult {
    exitCode: 0 | 1;
    diff: BundleDiff | null;
    newManifest: boolean;
    commentPosted: boolean;
    reason?: string;
}
export declare function run(env: RunnerEnv): Promise<RunnerResult>;
