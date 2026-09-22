import { McpServer } from "@modelcontextprotocol/server";
import { PublicFetchError } from "@compressbyurl/url-audit-core/network";
import { fileURLToPath } from "node:url";

import {
  applyOptimizationPlanInputSchema,
  applyOptimizationPlanOutputSchema,
} from "./apply-plan-contracts.js";
import { applyImageOptimizationPlan, ApplyPlanError } from "./apply-plan.js";
import { createServerInfo, emptyInputSchema, serverInfoSchema } from "./contracts.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import { toolError } from "./errors.js";
import {
  optimizeImageInputSchema,
  optimizeImageOutputSchema,
} from "./optimize-image-contracts.js";
import { optimizeImage, OptimizeImageError } from "./optimize-image.js";
import {
  auditWebpageImagesInputSchema,
  auditWebpageImagesOutputSchema,
} from "./webpage-audit-contracts.js";
import { auditWebpageImages } from "./webpage-audit.js";
import {
  auditWorkspaceImagesInputSchema,
  auditWorkspaceImagesOutputSchema,
} from "./workspace-contracts.js";
import {
  auditWorkspaceImages,
  configuredRootId,
  WorkspaceAuditError,
} from "./workspace-audit.js";

export interface McpServerOptions {
  addressPolicy?: "public-only" | "public-and-loopback";
  workspaceRoots?: readonly string[];
}

export function createMcpServer(options: McpServerOptions = {}) {
  const addressPolicy = options.addressPolicy ?? "public-only";
  const workspaceRoots = options.workspaceRoots ?? [];
  const workspaceRootIds = workspaceRoots.map(configuredRootId);
  const server = new McpServer(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      instructions:
        "Use read-only audit tools before optimization tools. This server never overwrites source files.",
    },
  );

  server.registerTool(
    "get_server_info",
    {
      title: "Get CompressByURL server information",
      description:
        "Return the server version, supported image formats, active tools, and safety posture.",
      inputSchema: emptyInputSchema,
      outputSchema: serverInfoSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const output = createServerInfo(addressPolicy === "public-only", workspaceRootIds);
      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    },
  );

  server.registerTool(
    "audit_webpage_images",
    {
      title: "Audit webpage images",
      description:
        "Inspect discoverable static images on one public webpage and return measured optimization evidence. This does not render the page or claim actual LCP.",
      inputSchema: auditWebpageImagesInputSchema,
      outputSchema: auditWebpageImagesOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (input, context) => {
      try {
        const output = await auditWebpageImages(input, {
          addressPolicy,
          signal: context.mcpReq.signal,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        if (error instanceof PublicFetchError) {
          return toolError(error.code, error.message);
        }
        return toolError(
          "INTERNAL_ERROR",
          "The webpage audit could not be completed safely.",
        );
      }
    },
  );

  server.registerTool(
    "audit_workspace_images",
    {
      title: "Audit workspace images",
      description:
        "Read static images beneath a human-approved server workspace root. A client root narrows access when the host supplies one. This tool never writes files.",
      inputSchema: auditWorkspaceImagesInputSchema,
      outputSchema: auditWorkspaceImagesOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (input, context) => {
      if (workspaceRoots.length === 0) {
        return toolError(
          "WORKSPACE_ROOT_REQUIRED",
          "Start the server with at least one --workspace-root path.",
        );
      }
      let clientRoots: string[] = [];
      if (server.server.getClientCapabilities()?.roots) {
        try {
          const response = await context.mcpReq.send({ method: "roots/list" });
          clientRoots = response.roots.flatMap((root) => {
            try {
              const url = new URL(root.uri);
              return url.protocol === "file:" ? [fileURLToPath(url)] : [];
            } catch {
              return [];
            }
          });
        } catch {}
      }

      try {
        const output = await auditWorkspaceImages(input, {
          approvedRoots: workspaceRoots,
          clientRoots,
          signal: context.mcpReq.signal,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        if (error instanceof WorkspaceAuditError) {
          return toolError(error.code, error.message);
        }
        return toolError(
          "INTERNAL_ERROR",
          "The workspace audit could not be completed safely.",
        );
      }
    },
  );

  server.registerTool(
    "optimize_image",
    {
      title: "Optimize one image",
      description:
        "Create one new optimized image from an authorized workspace file or explicit public URL. Existing files are never overwritten.",
      inputSchema: optimizeImageInputSchema,
      outputSchema: optimizeImageOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async (input, context) => {
      if (workspaceRoots.length === 0) {
        return toolError(
          "WORKSPACE_ROOT_REQUIRED",
          "Start the server with at least one --workspace-root path.",
        );
      }
      let clientRoots: string[] = [];
      if (server.server.getClientCapabilities()?.roots) {
        try {
          const response = await context.mcpReq.send({ method: "roots/list" });
          clientRoots = response.roots.flatMap((root) => {
            try {
              const url = new URL(root.uri);
              return url.protocol === "file:" ? [fileURLToPath(url)] : [];
            } catch {
              return [];
            }
          });
        } catch {}
      }

      try {
        const output = await optimizeImage(input, {
          addressPolicy,
          approvedRoots: workspaceRoots,
          clientRoots,
          signal: context.mcpReq.signal,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        if (error instanceof PublicFetchError) {
          return toolError(error.code, error.message);
        }
        if (error instanceof WorkspaceAuditError) {
          return toolError(error.code, error.message);
        }
        if (error instanceof OptimizeImageError) {
          return toolError(error.code, error.message);
        }
        return toolError("INTERNAL_ERROR", "The image could not be optimized safely.");
      }
    },
  );

  server.registerTool(
    "apply_image_optimization_plan",
    {
      title: "Apply an image optimization plan",
      description:
        "Apply a complete workspace audit plan into one new dedicated output directory. Sources and hashes are revalidated, item failures are isolated, and existing paths are never overwritten.",
      inputSchema: applyOptimizationPlanInputSchema,
      outputSchema: applyOptimizationPlanOutputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (input, context) => {
      if (workspaceRoots.length === 0) {
        return toolError(
          "WORKSPACE_ROOT_REQUIRED",
          "Start the server with at least one --workspace-root path.",
        );
      }
      let clientRoots: string[] = [];
      if (server.server.getClientCapabilities()?.roots) {
        try {
          const response = await context.mcpReq.send({ method: "roots/list" });
          clientRoots = response.roots.flatMap((root) => {
            try {
              const url = new URL(root.uri);
              return url.protocol === "file:" ? [fileURLToPath(url)] : [];
            } catch {
              return [];
            }
          });
        } catch {}
      }

      try {
        const output = await applyImageOptimizationPlan(input, {
          addressPolicy,
          approvedRoots: workspaceRoots,
          clientRoots,
          signal: context.mcpReq.signal,
        });
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      } catch (error) {
        if (error instanceof WorkspaceAuditError) {
          return toolError(error.code, error.message);
        }
        if (error instanceof OptimizeImageError) {
          return toolError(error.code, error.message);
        }
        if (error instanceof ApplyPlanError) {
          return toolError(error.code, error.message);
        }
        return toolError(
          "INTERNAL_ERROR",
          "The optimization plan could not be applied safely.",
        );
      }
    },
  );

  return server;
}
