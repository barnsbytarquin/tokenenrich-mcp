# TokenEnrich MCP Server 🚀

[![npm version](https://img.shields.io/npm/v/tokenenrich-mcp.svg?style=flat-square&color=2563eb)](https://www.npmjs.com/package/tokenenrich-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol%20Compatible-emerald.svg?style=flat-square)](https://modelcontextprotocol.io)
[![Latency](https://img.shields.io/badge/Latency-140ms%20Sockets-38bdf8.svg?style=flat-square)](https://tokenenrich.com)

> Model Context Protocol (MCP) server for **[TokenEnrich.com](https://tokenenrich.com)** — Deterministic B2B firmographic signals in ~180 to 240 tokens.

Enrich prospective company domains with verified tech stack footprints (500+ signatures), active ATS hiring portals (Ashby, Greenhouse, Lever), DNS MX mail infrastructure (Google Workspace, Microsoft 365), and SOC 2 Type II trust certifications directly from Claude Desktop, Cursor IDE, Windsurf, and custom AI agent loops.

---

## ⚡ 1-Minute Quickstart

### 1. Cursor IDE Setup
Add the following to your `.cursor/mcp.json` or Global Cursor Settings:

```json
{
  "mcpServers": {
    "tokenenrich": {
      "command": "npx",
      "args": ["-y", "tokenenrich-mcp"],
      "env": {
        "TOKENENRICH_API_KEY": "YOUR_TOKENENRICH_API_KEY"
      }
    }
  }
}
```

### 2. Claude Desktop Setup
Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "tokenenrich": {
      "command": "npx",
      "args": ["-y", "tokenenrich-mcp"],
      "env": {
        "TOKENENRICH_API_KEY": "YOUR_TOKENENRICH_API_KEY"
      }
    }
  }
}
```

### 3. Claude Code CLI Setup
```bash
claude mcp add tokenenrich -- npx -y tokenenrich-mcp
```

---

## 📦 What the Agent Receives (Clean ~180 Tokens)

Unlike legacy web scrapers that return 25,000 tokens of raw HTML DOM bloat, TokenEnrich returns deterministic, typed JSON:

```json
{
  "domain": "linear.app",
  "company_name": "Linear",
  "category": "Issue Tracking & Project Management",
  "estimated_headcount": "51-250 employees (Growth Stage)",
  "tech_stack": [
    "Next.js",
    "React",
    "PostHog",
    "Sentry",
    "Stripe"
  ],
  "hiring_signals": {
    "is_hiring": true,
    "ats_platform": "Ashby"
  },
  "mail_infrastructure": {
    "provider": "Google Workspace",
    "delivery_tools": ["Amazon SES"]
  },
  "compliance": {
    "soc2_certified": true,
    "trust_portal_url": "https://trust.linear.app"
  },
  "tokens_used": 184
}
```

---

## 🛠 Available MCP Tools

1. **`enrich_company`**
   * Extracts verified company signals in ~180 tokens in sub-200ms.
   * **Parameters**: `domain` (e.g. `linear.app`, `stripe.com`, `resend.com`)
   * **Returns**: Tech stack, hiring status & ATS platform, email infrastructure, SOC 2 compliance, company category.

2. **`detect_technology`**
   * Checks whether a company uses a specific technology or vendor.
   * **Parameters**: `domain`, `technology` (e.g. `stripe`, `ashby`, `posthog`, `nextjs`, `supabase`)
   * **Returns**: Boolean detection signal with direct evidence.

3. **`batch_enrich_companies`**
   * Resolves up to 50 domains concurrently in parallel.
   * **Parameters**: `domains` (array of domain strings)

---

## 🔑 Get Your API Key
Get 50 free lifetime API lookups instantly at **[https://tokenenrich.com/dashboard](https://tokenenrich.com/dashboard)**. Zero credit card required.

---

## 📄 License
MIT License. Built by [TarquinBarnsby.com](https://tarquinbarnsby.com) for [TokenEnrich.com](https://tokenenrich.com).
