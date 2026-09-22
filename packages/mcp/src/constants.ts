export const SERVER_NAME = "compressbyurl-mcp";
export const SERVER_VERSION = "0.1.0";
export const SCHEMA_VERSION = "1";

export const SUPPORTED_FORMATS = ["jpeg", "png", "webp", "avif"] as const;
export const INITIAL_TOOLS = [
  "get_server_info",
  "audit_webpage_images",
  "audit_workspace_images",
  "optimize_image",
  "apply_image_optimization_plan",
] as const;
