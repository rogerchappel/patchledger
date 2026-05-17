import type { FileChange } from "./types.js";

const riskyMatchers: Array<[RegExp, string]> = [
  [/package-lock\.json$|pnpm-lock\.yaml$|yarn\.lock$/, "dependency lockfile changed"],
  [/package\.json$/, "package metadata or scripts changed"],
  [/(^|\/)\.github\//, "CI or GitHub automation changed"],
  [/(^|\/)scripts\//, "automation script changed"],
  [/(^|\/)(auth|security|crypto|permissions?)\b/i, "security-sensitive path changed"],
  [/\.sql$|migrations?\//i, "database or migration file changed"],
  [/(^|\/)Dockerfile$|docker-compose\.ya?ml$/i, "container runtime changed"],
  [/\.env(\.|$)/, "environment file pattern changed"],
];

export function fileRiskHints(files: FileChange[]): string[] {
  const hints = new Set<string>();
  for (const file of files) {
    for (const [matcher, hint] of riskyMatchers) {
      if (matcher.test(file.path)) {
        hints.add(hint);
      }
    }
    if (file.additions + file.deletions > 300) {
      hints.add("large file delta: " + file.path);
    }
  }
  return [...hints].sort();
}

export function inferMixedConcern(files: FileChange[]): boolean {
  const groups = new Set<string>();
  for (const file of files) {
    if (file.path.startsWith("docs/") || file.path.endsWith(".md")) groups.add("docs");
    else if (file.path.startsWith("tests/") || file.path.includes(".test.")) groups.add("tests");
    else if (file.path.startsWith(".github/")) groups.add("ci");
    else if (file.path.startsWith("src/")) groups.add("src");
    else if (file.path.startsWith("scripts/")) groups.add("scripts");
    else groups.add("other");
  }
  return groups.size > 3;
}
