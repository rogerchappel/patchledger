import { readFile } from "node:fs/promises";

const testWords = /\b(test|tests|tested|verify|verified|validation|smoke|vitest|jest|node --test|npm test|pnpm test|pytest|cargo test|go test)\b/i;
const passingSummary = /\b(?:tests?|test suites?)\b.*\b\d+\s+passed\b|\b\d+\s+passing\b/i;
const passingContext =
  /\b(?:tests?|test suites?|validation|verification|smoke(?: test)?|vitest|jest|pytest|cargo test|go test)\b.*\b(?:pass(?:ed)?|success(?:ful)?|succeed(?:ed)?|validated)\b/i;
const noTestEvidence =
  /\b(?:no tests? (?:were )?run|no test files? (?:were )?found|tests?\s*:\s*0\s+(?:total|passed)|0\s+tests?\s+(?:run|passed|total))\b/i;
const explicitFailure =
  /^(?:fail(?:ed|ure)?|error|npm err!)\b|\b[1-9]\d*\s+(?:failed|failures?|errors?)\b|\b(?:tests?|test suites?|validation|verification|smoke(?: test)?|command|run)\s*:?\s+(?:failed|failure|error|errored)\b|\b(?:exited?\s+(?:with\s+)?|returned\s+)?exit\s+(?:code|status)\s*:?\s*[1-9]\d*\b/i;

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
      if (explicitFailure.test(line) || noTestEvidence.test(line)) {
        return false;
      }
      return /^pass\b/i.test(line) || passingSummary.test(line) || passingContext.test(line);
    })
    .slice(0, 20);
}
