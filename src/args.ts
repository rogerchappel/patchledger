import { PatchLedgerError } from "./errors.js";
import type { CliOptions, CommandName, OutputFormat } from "./types.js";

const defaultOptions = {
  repo: ".",
  base: "main",
  head: "HEAD",
  format: "markdown" as OutputFormat,
  maxFilesPerCommit: 8,
  maxLinesPerCommit: 600,
};

export function parseArgs(argv: string[]): CliOptions {
  const [commandToken, ...rest] = argv;

  if (!commandToken || commandToken === "--help" || commandToken === "-h") {
    throw new PatchLedgerError(helpText(), 0);
  }

  if (commandToken === "--version" || commandToken === "-v") {
    throw new PatchLedgerError("0.1.0", 0);
  }

  if (commandToken !== "write" && commandToken !== "verify") {
    throw new PatchLedgerError("Unknown command: " + commandToken + "\n\n" + helpText(), 2);
  }

  const options: CliOptions = {
    command: commandToken as CommandName,
    ...defaultOptions,
    allowMissingTests: false,
    json: false,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    const next = () => {
      const value = rest[index + 1];
      if (!value || value.startsWith("--")) {
        throw new PatchLedgerError("Missing value for " + token, 2);
      }
      index += 1;
      return value;
    };

    switch (token) {
      case "--repo":
        options.repo = next();
        break;
      case "--base":
        options.base = next();
        break;
      case "--head":
        options.head = next();
        break;
      case "--out":
        options.out = next();
        break;
      case "--format": {
        const format = next();
        if (format !== "markdown" && format !== "json") {
          throw new PatchLedgerError("--format must be markdown or json", 2);
        }
        options.format = format;
        break;
      }
      case "--test-log":
        options.testLog = next();
        break;
      case "--max-files-per-commit":
        options.maxFilesPerCommit = parsePositiveInt(token, next());
        break;
      case "--max-lines-per-commit":
        options.maxLinesPerCommit = parsePositiveInt(token, next());
        break;
      case "--allow-missing-tests":
        options.allowMissingTests = true;
        break;
      case "--json":
        options.json = true;
        options.format = "json";
        break;
      case "--help":
      case "-h":
        throw new PatchLedgerError(helpText(), 0);
      default:
        throw new PatchLedgerError("Unknown option: " + token, 2);
    }
  }

  if (options.command === "verify") {
    options.format = options.json ? "json" : "markdown";
  }

  return options;
}

function parsePositiveInt(flag: string, value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new PatchLedgerError(flag + " must be a positive integer", 2);
  }
  return parsed;
}

export function helpText(): string {
  return `patchledger - local git patch evidence ledger

Usage:
  patchledger write [options]
  patchledger verify [options]

Options:
  --repo <path>                 Git repository to inspect (default: .)
  --base <ref>                  Base ref for the patch range (default: main)
  --head <ref>                  Head ref for the patch range (default: HEAD)
  --out <path>                  Write ledger output to a file
  --format <markdown|json>      Output format for write (default: markdown)
  --test-log <path>             Attach verification evidence from a log file
  --max-files-per-commit <n>    Error when a commit touches more files (default: 8)
  --max-lines-per-commit <n>    Warn when additions+deletions exceed this (default: 600)
  --allow-missing-tests         Do not fail verify when no test evidence is found
  --json                        Emit verify result as JSON
  --help                        Show this help
`;
}
