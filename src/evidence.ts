import { readFile } from "node:fs/promises";

const testWords = /\b(test|tests|tested|verify|verified|validation|smoke|vitest|jest|node --test|npm test|pnpm test|pytest|cargo test|go test)\b/i;
const passingEvidence = /pass|ok|success|npm test|pnpm test|node --test|validated|smoke/i;
const explicitFailure =
  /^(?:fail(?:ed|ure)?|error|npm err!)\b|\b[1-9]\d*\s+(?:failed|failures?|errors?)\b|\b(?:tests?|test suites?|validation|verification|smoke(?: test)?|command|run)\s*:?\s+(?:failed|failure|error|errored)\b/i;

export function commitMentionsTests(subject: string, body: string): string[] {
  const text = [subject, body].filter(Boolean).join("\n");
  if (!testWords.test(text)) {
    return [];
  }
  return ["commit message mentions verification: " + subject];
}

export async function readTestEvidence(testLog: string | undefined): Promise<string[]> {
  if (!testLog) {
    return [];
  }

  const content = await readFile(testLog, "utf8");
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => {
      if (/^not ok\b/i.test(line)) {
        return false;
      }
      if (/^ok(?:\s+\d+)?\b/i.test(line)) {
        return true;
      }
      return !explicitFailure.test(line) && passingEvidence.test(line);
    })
    .slice(0, 20);
}
