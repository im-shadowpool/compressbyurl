import * as z from "zod/v4";

import {
  INITIAL_TOOLS,
  SCHEMA_VERSION,
  SERVER_NAME,
  SERVER_VERSION,
  SUPPORTED_FORMATS,
} from "./constants.js";

export const emptyInputSchema = z.object({}).strict();

export const warningSchema = z
  .object({
    code: z.string().min(1),
    message: z.string().min(1),
    itemId: z.string().min(1).optional(),
  })
  .strict();

export const serverInfoSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    name: z.literal(SERVER_NAME),
    version: z.literal(SERVER_VERSION),
    transport: z.literal("stdio"),
    runtime: z
      .object({
        node: z.string().min(1),
      })
      .strict(),
    capabilities: z
      .object({
        tools: z.array(z.enum(INITIAL_TOOLS)),
        formats: z.array(z.enum(SUPPORTED_FORMATS)),
      })
      .strict(),
    security: z
      .object({
        publicNetworkOnly: z.boolean(),
        overwriteEnabled: z.literal(false),
        workspaceRootIds: z.array(z.string().min(8)),
      })
      .strict(),
    warnings: z.array(warningSchema),
  })
  .strict();

export type ServerInfo = z.infer<typeof serverInfoSchema>;

export function createServerInfo(
  publicNetworkOnly = true,
  workspaceRootIds: readonly string[] = [],
): ServerInfo {
  return {
    schemaVersion: SCHEMA_VERSION,
    name: SERVER_NAME,
    version: SERVER_VERSION,
    transport: "stdio",
    runtime: {
      node: process.version,
    },
    capabilities: {
      tools: [...INITIAL_TOOLS],
      formats: [...SUPPORTED_FORMATS],
    },
    security: {
      publicNetworkOnly,
      overwriteEnabled: false,
      workspaceRootIds: [...workspaceRootIds],
    },
    warnings: [],
  };
}
