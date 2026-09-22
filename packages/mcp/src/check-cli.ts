import path from "node:path";

import { SCHEMA_VERSION } from "./constants.js";
import {
  checkWorkspaceImagePolicy,
  loadImageBudgetPolicy,
  PolicyCheckError,
  resolveCheckRoot,
} from "./policy-check.js";
import { WorkspaceAuditError } from "./workspace-audit.js";

export const CHECK_EXIT_PASS = 0;
export const CHECK_EXIT_BUDGET_FAILURE = 1;
export const CHECK_EXIT_EXECUTION_ERROR = 2;

const HELP = `CompressByURL image budget check

Usage:
  compressbyurl-mcp check [options]

Options:
  --root <path>          Workspace root (default: current directory)
  --policy <path>        Workspace-relative policy path (default: .compressbyurlrc.json)
  --directory <path>     Workspace-relative directory to audit (default: .)
  --max-files <number>   Maximum supported images to inspect, 1-1000 (default: 1000)
  --json                 Emit one JSON result to stdout
  --help                 Show this help

Exit codes:
  0  Policy passed
  1  One or more image budgets failed
  2  Invalid configuration or execution failure
`;

interface CheckCliOptions {
  root: string;
  policyPath: string;
  directory: string;
  maxFiles: number;
  json: boolean;
  help: boolean;
}

function argumentValue(argumentsToParse: readonly string[], index: number, name: string) {
  const value = argumentsToParse[index + 1];
  if (!value || value.startsWith("--")) {
    throw new PolicyCheckError("INVALID_ARGUMENT", `${name} requires a value.`);
  }
  return value;
}

export function parseCheckArguments(
  argumentsToParse: readonly string[],
  currentDirectory = process.cwd(),
): CheckCliOptions {
  let root = currentDirectory;
  let policyPath = ".compressbyurlrc.json";
  let directory = ".";
  let maxFiles = 1_000;
  let json = false;
  let help = false;
  const seen = new Set<string>();
  for (let index = 0; index < argumentsToParse.length; index += 1) {
    const argument = argumentsToParse[index];
    if (!argument) continue;
    if (seen.has(argument)) {
      throw new PolicyCheckError(
        "INVALID_ARGUMENT",
        `The ${argument} option may be specified only once.`,
      );
    }
    if (argument === "--json") {
      json = true;
      seen.add(argument);
    } else if (argument === "--help") {
      help = true;
      seen.add(argument);
    } else if (argument === "--root") {
      const value = argumentValue(argumentsToParse, index, argument);
      root = path.resolve(currentDirectory, value);
      seen.add(argument);
      index += 1;
    } else if (argument === "--policy") {
      policyPath = argumentValue(argumentsToParse, index, argument);
      seen.add(argument);
      index += 1;
    } else if (argument === "--directory") {
      directory = argumentValue(argumentsToParse, index, argument);
      seen.add(argument);
      index += 1;
    } else if (argument === "--max-files") {
      const value = argumentValue(argumentsToParse, index, argument);
      if (!/^\d+$/.test(value)) {
        throw new PolicyCheckError(
          "INVALID_ARGUMENT",
          "--max-files must be an integer from 1 to 1000.",
        );
      }
      maxFiles = Number(value);
      if (!Number.isSafeInteger(maxFiles) || maxFiles < 1 || maxFiles > 1_000) {
        throw new PolicyCheckError(
          "INVALID_ARGUMENT",
          "--max-files must be an integer from 1 to 1000.",
        );
      }
      seen.add(argument);
      index += 1;
    } else {
      throw new PolicyCheckError(
        "INVALID_ARGUMENT",
        "An unknown check option was provided. Run check --help for usage.",
      );
    }
  }
  return { root, policyPath, directory, maxFiles, json, help };
}

function executionError(error: unknown) {
  if (error instanceof PolicyCheckError || error instanceof WorkspaceAuditError) {
    return { code: error.code, message: error.message };
  }
  return {
    code: "INTERNAL_ERROR",
    message: "The image budget check could not be completed safely.",
  };
}

function humanResult(result: Awaited<ReturnType<typeof checkWorkspaceImagePolicy>>) {
  const lines = [
    `CompressByURL policy check: ${result.status === "pass" ? "PASS" : "BUDGET FAILURE"}`,
    `Files checked: ${result.summary.filesChecked}`,
    `Budget violations: ${result.summary.violationCount}`,
  ];
  for (const finding of result.findings) {
    lines.push(
      `${finding.relativePath}: ${finding.code} actual=${finding.actual} limit=${finding.limit}${finding.ruleIndex === null ? " global" : ` rule=${finding.ruleIndex}`}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export async function runCheckCommand(
  argumentsToParse: readonly string[],
  io: {
    currentDirectory?: string;
    writeOut?: (value: string) => void;
    writeError?: (value: string) => void;
  } = {},
) {
  const writeOut = io.writeOut ?? ((value: string) => process.stdout.write(value));
  const writeError = io.writeError ?? ((value: string) => process.stderr.write(value));
  let options: CheckCliOptions | undefined;
  try {
    options = parseCheckArguments(argumentsToParse, io.currentDirectory ?? process.cwd());
    if (options.help) {
      writeOut(HELP);
      return CHECK_EXIT_PASS;
    }
    const root = await resolveCheckRoot(options.root);
    const policy = await loadImageBudgetPolicy(root, options.policyPath);
    const result = await checkWorkspaceImagePolicy({
      root,
      directory: options.directory,
      maxFiles: options.maxFiles,
      policy,
    });
    writeOut(options.json ? `${JSON.stringify(result)}\n` : humanResult(result));
    return result.status === "pass" ? CHECK_EXIT_PASS : CHECK_EXIT_BUDGET_FAILURE;
  } catch (error) {
    const safeError = executionError(error);
    if (options?.json || argumentsToParse.includes("--json")) {
      writeOut(
        `${JSON.stringify({
          schemaVersion: SCHEMA_VERSION,
          status: "execution-error",
          error: safeError,
        })}\n`,
      );
    } else {
      writeError(
        `CompressByURL policy check: ERROR\n${safeError.code}: ${safeError.message}\n`,
      );
    }
    return CHECK_EXIT_EXECUTION_ERROR;
  }
}
