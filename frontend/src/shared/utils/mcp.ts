// Utility functions related to Model Context Protocol (MCP)

/**
 * Sanitises a user-provided Agent name so that it can safely be used as an
 * MCP server identifier.
 *
 * Rules (derived from MCP spec and common conventions):
 *   1. Lower-case alphanumeric characters, hyphen (-) and underscore (_)
 *   2. Cannot start with a digit or hyphen – if it does, we prefix with "mcp-".
 *   3. Consecutive illegal characters are collapsed into a single hyphen.
 *   4. Empty or fully sanitised away strings fallback to "xpack-mcp-service".
 */
export function sanitizeMCPServerName(rawName: string | undefined): string {
  if (!rawName) return "xpack-mcp-service";

  // Lower-case & replace invalid chars with hyphen
  let name = rawName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-");

  // Collapse multiple hyphens
  name = name.replace(/-+/g, "-");

  // Trim leading/trailing hyphens
  name = name.replace(/^-+/, "").replace(/-+$/, "");

  // Ensure it doesn't start with a digit or empty
  if (!name || !/^(xpack-)/.test(name)) {
    name = `xpack-${name}`;
  }

  return name || "xpack-mcp-service";
}

/**
 * Generates a complete MCP configuration JSON string for a given API key & agent.
 *
 * @param key   The raw API key returned from backend.
 * @param name  The human-friendly Agent name.
 * @returns     A pretty-printed JSON string that can be used directly in config files.
 */
export function generateMCPConfig(key: string, name?: string): string {
  const sanitizedName = sanitizeMCPServerName(name);
  const baseUrl = `${process.env.NEXT_PUBLIC_MCP_URL}?apikey=${key}`;

  const mcpConfig = {
    mcpServers: {
      [sanitizedName]: {
        type: "sse",
        url: baseUrl,
      },
    },
  } as const;

  return JSON.stringify(mcpConfig, null, 2);
}
