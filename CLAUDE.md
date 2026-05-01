# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Node.js/TypeScript library wrapping the Salesforce Bulk API 2.0. Published to npm as `node-sf-bulk2`. Consumers provide a connection object (accessToken, instanceUrl, apiVersion) obtained from any Salesforce auth library (jsforce, @salesforce/sf-core, SF CLI).

## Commands

- **Build:** `npm run build` (runs `rimraf ./dist && tsc`, outputs CommonJS to `dist/`)
- **Lint:** `npm run eslint` (ESLint with `@typescript-eslint`)
- **Dev watch:** `npm run start:dev` (nodemon with ts-node)
- **No test suite exists.** `npm test` exits with an error by design.

## Architecture

Single-class library. All Salesforce Bulk API 2.0 operations live in `src/bulk2.ts` (the `BulkAPI2` class). It uses axios for HTTP calls against two Bulk V2 endpoint groups:

- **Query jobs** (`/jobs/query`) — submit, get info, get all, abort, get results (CSV)
- **Ingest jobs** (`/jobs/ingest`) — create upload job, upload CSV data, close/abort, get info, get results (successful/failed/unprocessed)

When `connection.isTooling` is true, the endpoint inserts `/tooling` before `/jobs` to target the Tooling API.

`src/index.ts` is the public barrel — it re-exports `BulkAPI2` as a named export and all model interfaces/enums. The `Connection` interface is re-exported as `BulkAPI2Connection`.

`src/model/` contains TypeScript interfaces and enums that map directly to the Salesforce Bulk V2 API request/response shapes. Enums (`OPERATION`, `STATE`, `RESULTTYPE`, etc.) are used as string-indexed numeric enums — consumers access values like `OPERATION[0]` for `"insert"` and `STATE[1]` for `"UploadComplete"`.

## Build Output

TypeScript compiles to `dist/` targeting ES2015 with CommonJS modules. Declaration files (`.d.ts`) are generated. The npm package entry point is `dist/index.js`.
