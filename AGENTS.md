# Repository Guidelines

This is a repo that hosts a CLI for bootstrapping a proxy service that can be immediately deployed to Fiberplane,
in order to proxy/intercept MCP calls and monitor them.

## Project Structure & Module Organization
- Root: Bun monorepo with workspaces in `packages/*` and `templates`.
- Create FP MCP Proxy CLI: `packages/create-fp-mcp-proxy`
  - Source: `packages/reate-fp-mcp-proxy/src`
  - Tests: `packages/reate-fp-mcp-proxy/tests/**/*.test.ts`
  - Build scripts: `packages/reate-fp-mcp-proxy/scripts`

## Build, Test, and Development Commands
- Install deps: `bun install`
- Build all packages: `bun run build`
- Type-check all: `bun run typecheck`
- Lint/format (Biome): `bun run lint`
- Test all (Bun): `bun test`
- Per-package example: `bun run --filter=create-fp-mcp-proxy build` (or `cd packages/create-fp-mcp-proxy && bun run build`)

## Coding Style & Naming Conventions
- Language: TypeScript (ESM). Prefer explicit exports.
- Formatting: enforced by Biome; run `bun run lint` before pushing.
- Files: kebab-case for multi-word files (e.g., `transport-http.ts`).
- Classes: `PascalCase` (e.g., `McpServer`). Functions/vars: `camelCase`.
- Types/interfaces: `PascalCase`; constants `SCREAMING_SNAKE_CASE`.

## Testing Guidelines
- Framework: Bun.
- Location: place tests under `packages/<name>/tests/**` and name as `*.test.ts`.
- Run: `bun test` (all). Run all test files with "foo" or "bar" in the file name `bun test foo bar`. Run all test files, only including tests whose names includes "baz" `bun test --test-name-pattern baz`.
- Favor black-box tests over internals.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject; scope by package when relevant (e.g., `core: add StreamableHttpTransport validation`).
- PRs: include description, motivation, and any breaking changes. Link issues. Add before/after snippets or curl examples for protocol changes.
- Requirements: green tests, lint clean, typecheck clean. Update docs (`README.md`, examples) when APIs change.
