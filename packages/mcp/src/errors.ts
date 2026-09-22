import type { CallToolResult } from "@modelcontextprotocol/server";
import type { PublicFetchErrorCode } from "@compressbyurl/url-audit-core/network";

export type ToolErrorCode =
  | PublicFetchErrorCode
  | "INVALID_INPUT"
  | "INVALID_PLAN"
  | "DECODE_FAILED"
  | "OPERATION_BYTE_LIMIT"
  | "PIXEL_LIMIT_EXCEEDED"
  | "WORKSPACE_ROOT_REQUIRED"
  | "PATH_OUTSIDE_ROOT"
  | "PATH_ESCAPE"
  | "FILE_NOT_FOUND"
  | "DESTINATION_EXISTS"
  | "JPEG_BACKGROUND_REQUIRED"
  | "ANIMATED_IMAGE"
  | "ENCODE_FAILED"
  | "WRITE_FAILED"
  | "SOURCE_CHANGED"
  | "INTERNAL_ERROR";

export function toolError(code: ToolErrorCode, message: string): CallToolResult {
  return {
    isError: true,
    content: [
      {
        type: "text",
        text: JSON.stringify({ error: { code, message } }),
      },
    ],
  };
}
