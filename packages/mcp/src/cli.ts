#!/usr/bin/env node

import { serveStdio } from "@modelcontextprotocol/server/stdio";
import path from "node:path";

import { runCheckCommand } from "./check-cli.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { createMcpServer } from "./server.js";

let allowLoopback = false;
const workspaceRoots: string[] = [];
const unknownArguments: string[] = [];
const argumentsToParse = process.argv.slice(2);
if (argumentsToParse[0] === "check") {
  process.exitCode = await runCheckCommand(argumentsToParse.slice(1));
} else {
  for (let index = 0; index < argumentsToParse.length; index += 1) {
    const argument = argumentsToParse[index];
    if (argument === "--allow-loopback") {
      allowLoopback = true;
    } else if (argument === "--workspace-root") {
      const root = argumentsToParse[index + 1];
      if (!root) {
        unknownArguments.push("--workspace-root requires a path");
      } else {
        workspaceRoots.push(path.resolve(root));
        index += 1;
      }
    } else if (argument) {
      unknownArguments.push(argument);
    }
  }

  if (unknownArguments.length > 0) {
    console.error(`Unknown argument: ${unknownArguments.join(", ")}`);
    process.exitCode = 2;
  } else {
    void serveStdio(() =>
      createMcpServer({
        addressPolicy: allowLoopback ? "public-and-loopback" : "public-only",
        workspaceRoots,
      }),
    );
    console.error(
      `${SERVER_NAME} ${SERVER_VERSION} running on stdio${allowLoopback ? " with loopback enabled" : ""}`,
    );
  }
}
