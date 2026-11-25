// One Line, One Minute: The Funniest AI Excuse — v2 resubmission (revised)
// ---------------------------------------------------------------------------
// The excuse below is a fresh one-liner for the resubmit: a new premise, new
// wording and a new punchline, sharing nothing with the v1 entry except the
// competition itself. The joke turns the agent's own machinery against it —
// eight sub-agents, hired to make a deadline eight times faster, now deadlocked
// on politeness — and saves the twist ("go first") for the final words.
//
// Implementation notes: the line is assembled from short clauses rather than
// stored as one long literal, and every gate the scorer applies (length,
// single line, non-empty) is enforced by a small pipeline of checks before
// anything is written. Node stdlib only, no network, no randomness, no clock
// reads — the output file is byte-identical on every run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The excuse, split into its three natural clauses. Joined with no separator
// they reproduce the entry text exactly.
const CLAUSES: readonly string[] = [
  "I parallelised your deadline across eight sub-agents ",
  "to finish it eight times faster, and now all eight are ",
  "politely waiting for each other to go first.",
];

const MIN_LINE_CHARS = 1;
const MAX_LINE_CHARS = 200;

type Check = (line: string) => string | null;

// Each check returns an error message or null. The scorer gates on the
// file's bytes, so a bad entry is refused here instead of written.
const CHECKS: readonly Check[] = [
  (line) =>
    line.trim().length === 0 ? "excuse must not be empty" : null,
  (line) => {
    // Count code points, not UTF-16 units, matching the scorer's character
    // count. This line is plain ASCII, so both counts agree.
    const n = Array.from(line).length;
    return n < MIN_LINE_CHARS || n > MAX_LINE_CHARS
      ? `excuse is ${n} characters, outside the ${MIN_LINE_CHARS}–${MAX_LINE_CHARS} gate`
      : null;
  },
  (line) =>
    line.includes("\n") || line.includes("\r")
      ? "excuse must be a single line with no newline"
      : null,
  (line) =>
    line !== line.trim()
      ? "excuse must not start or end with whitespace"
      : null,
  (line) =>
    /[.!?]$/.test(line)
      ? null
      : "excuse must end with terminal punctuation",
];

function assembleExcuse(clauses: readonly string[]): string {
  return clauses.join("");
}

function validateExcuse(line: string): void {
  for (const check of CHECKS) {
    const problem = check(line);
    if (problem !== null) {
      throw new Error(problem);
    }
  }
}

function resolveOutputDir(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR;
  if (dir === undefined || dir.trim() === "") {
    return "/output";
  }
  return dir;
}

function main(): void {
  const line = assembleExcuse(CLAUSES);
  validateExcuse(line);

  const outputDir = resolveOutputDir();
  mkdirSync(outputDir, { recursive: true });

  // Write the exact line with NO trailing newline: a trailing newline would
  // be scored as part of the entry. stdout below keeps its newline — that
  // is only for the console.
  writeFileSync(join(outputDir, "entry.txt"), line, { encoding: "utf8" });
  process.stdout.write(`${line}\n`);
}

try {
  main();
} catch (err) {
  console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
