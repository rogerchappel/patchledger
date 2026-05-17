import { readFile } from "node:fs/promises";

const testWords = /\b(test|tests|tested|verify|verified|validation|smoke|vitest|jest|node --test|npm test|pnpm test|pytest|cargo test|go test)\b/i;

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
    .filter((line) => /pass|ok|success|npm test|pnpm test|node --test|validated|smoke/i.test(line))
    .slice(0, 20);
}
