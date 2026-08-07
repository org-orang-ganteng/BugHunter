---
name: codebase-memory
description: Skill untuk memahami & mengingat struktur codebase yang besar atau asing (relasi simbol, arsitektur). Use when a repository is large or unfamiliar and you need persistent codebase knowledge, symbol relationships, architecture context, or a safe way to inspect and update code through Codebase Memory MCP. Prefer this guidance before broad code exploration.
license: MIT
---

# Codebase Memory MCP

Use the Codebase Memory MCP server when the task benefits from a persistent map of the repository rather than one-off file searches.

## When to use it

- Build or refresh a repository code graph before investigating cross-file behavior.
- Retrieve symbol definitions, references, call relationships, imports, and architectural context.
- Keep repository knowledge available across sessions or agents.
- Investigate a bug whose behavior crosses several modules.

## Workflow

1. Confirm the MCP server is installed and configured for the current workspace.
2. Index the repository, respecting ignore files and excluding generated or secret material.
3. Query the narrowest symbol, file, or relationship needed for the task.
4. Validate conclusions against the source files and tests before editing.
5. Refresh or invalidate the index after meaningful structural changes.

## Safety and scope

- Do not index credentials, tokens, private keys, `.env` files, or unrelated private data.
- Treat graph results as navigation aids; the source code and executable tests remain authoritative.
- Do not run destructive maintenance or installation commands without explicit user approval.
- Keep MCP permissions limited to the workspace and required read operations.

## Source

This local guidance is adapted from `DeusData/codebase-memory-mcp`:
https://github.com/DeusData/codebase-memory-mcp

See the source repository README and `LICENSE` for installation details and terms.
