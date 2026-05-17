#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "./args.js";
import { analyzePatch } from "./analyze.js";
import { PatchLedgerError } from "./errors.js";
import { hasErrors } from "./policy.js";
import { renderJson, renderMarkdown } from "./render.js";

async function main(argv: string[]): Promise<number> {
  const options = parseArgs(argv);
  const ledger = await analyzePatch(options);
  const output = options.format === "json" ? renderJson(ledger) : renderMarkdown(ledger);

  if (options.out) {
    const outPath = resolve(options.out);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, output, "utf8");
  } else {
    process.stdout.write(output);
  }

  if (options.command === "verify") {
    if (!options.out && options.format !== "json") {
      process.stdout.write(hasErrors(ledger.issues) ? "\npatchledger verify failed.\n" : "\npatchledger verify passed.\n");
    }
    return hasErrors(ledger.issues) ? 1 : 0;
  }

  return 0;
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    if (error instanceof PatchLedgerError) {
      const stream = error.exitCode === 0 ? process.stdout : process.stderr;
      stream.write(error.message + "\n");
      process.exitCode = error.exitCode;
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(message + "\n");
    process.exitCode = 1;
  });
