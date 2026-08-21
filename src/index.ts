#!/usr/bin/env node
/**
 * TokenEnrich MCP Server.
 * Model Context Protocol integration for Claude Desktop, Cursor, Windsurf, and AI Agents.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Parse CLI arguments or environment variables
const args = process.argv.slice(2);
let cliApiKey = "";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--api-key" && args[i + 1]) {
    cliApiKey = args[i + 1];
  }
}

const API_BASE_URL = process.env.TOKENENRICH_API_URL || "https://tokenenrich.com";
const API_KEY = cliApiKey || process.env.TOKENENRICH_API_KEY || "ae_sandbox_trial";

const server = new Server(
  {
    name: "tokenenrich-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ── Define Available Tools ───────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "enrich_company",
        description:
          "Fetches verified, token-minified B2B company firmographics in ~240 tokens. Returns detected tech stack (500+ signatures), active hiring signals and ATS (Ashby, Greenhouse), DNS email infrastructure (Google Workspace, M365), sales motion (PLG vs Enterprise), and SOC 2 trust certifications in 140ms.",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "The apex domain of the company to enrich, e.g., 'linear.app', 'stripe.com', 'resend.com'.",
            },
          },
          required: ["domain"],
        },
      },
      {
        name: "detect_technology",
        description:
          "Checks whether a specific target technology (e.g. 'stripe', 'ashby', 'posthog', 'nextjs', 'supabase', 'google-workspace', 'soc2') is used by a company domain.",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "The company apex domain, e.g., 'linear.app'.",
            },
            technology: {
              type: "string",
              description: "The technology name or signature to check, e.g. 'stripe', 'ashby', 'posthog', 'nextjs', 'supabase'.",
            },
          },
          required: ["domain", "technology"],
        },
      },
      {
        name: "batch_enrich_companies",
        description:
          "Enriches up to 50 company domains concurrently in parallel in a single sub-second call. Highly efficient for lead qualification waterfalls.",
        inputSchema: {
          type: "object",
          properties: {
            domains: {
              type: "array",
              items: { type: "string" },
              description: "Array of apex domains (up to 50 domains).",
            },
          },
          required: ["domains"],
        },
      },
    ],
  };
});

// ── Handle Tool Execution ────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "enrich_company") {
    const domain = String(args?.domain || "").trim();
    if (!domain) {
      return {
        content: [{ type: "text", text: "Error: Missing required 'domain' argument." }],
        isError: true,
      };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/enrich?domain=${encodeURIComponent(domain)}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "User-Agent": "TokenEnrich-MCP/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ type: "text", text: `TokenEnrich API Error (${response.status}): ${errorText}` }],
          isError: true,
        };
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Network error connecting to TokenEnrich API: ${err.message}` }],
        isError: true,
      };
    }
  }

  if (name === "detect_technology") {
    const domain = String(args?.domain || "").trim();
    const tech = String(args?.technology || "").trim().toLowerCase();
    if (!domain || !tech) {
      return {
        content: [{ type: "text", text: "Error: Missing required 'domain' or 'technology' argument." }],
        isError: true,
      };
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/v1/enrich?domain=${encodeURIComponent(domain)}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "User-Agent": "TokenEnrich-MCP/1.0",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ type: "text", text: `TokenEnrich API Error (${response.status}): ${errorText}` }],
          isError: true,
        };
      }

      const data: any = await response.json();
      const techStack: string[] = (data.tech_stack || []).map((t: string) => t.toLowerCase());
      const isDetected = techStack.some((t: string) => t.includes(tech));
      const atsPlatform = data.hiring_signals?.ats_platform?.toLowerCase() || "";
      const isAtsMatch = atsPlatform.includes(tech);
      const isMailMatch = (data.mail_infrastructure?.provider || "").toLowerCase().includes(tech);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                domain,
                technology: tech,
                detected: isDetected || isAtsMatch || isMailMatch,
                full_tech_stack: data.tech_stack,
                ats_platform: data.hiring_signals?.ats_platform || null,
                mail_provider: data.mail_infrastructure?.provider || null,
                has_soc2: data.security_signals?.has_soc2 || false,
                tokens_used: data.tokens_consumed || 240,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Network error: ${err.message}` }],
        isError: true,
      };
    }
  }

  if (name === "batch_enrich_companies") {
    const domains = Array.isArray(args?.domains) ? args.domains : [];
    if (domains.length === 0) {
      return {
        content: [{ type: "text", text: "Error: 'domains' array cannot be empty." }],
        isError: true,
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/enrich/batch`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "TokenEnrich-MCP/1.0",
        },
        body: JSON.stringify({ domains: domains.slice(0, 50) }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ type: "text", text: `TokenEnrich Batch API Error (${response.status}): ${errorText}` }],
          isError: true,
        };
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (err: any) {
      return {
        content: [{ type: "text", text: `Network error: ${err.message}` }],
        isError: true,
      };
    }
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

// ── Connect STDIO Transport ──────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TokenEnrich MCP Server running on stdio transport.");
}

main().catch((error) => {
  console.error("Fatal error in MCP Server:", error);
  process.exit(1);
});
