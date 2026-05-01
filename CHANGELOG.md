# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-04-30

### Added

- **Sforce-Call-Options header support** — `Connection` now accepts `callOptions` with `client` and `defaultNamespace` fields, sent as the `Sforce-Call-Options` header on every request.
- **`deleteIngestJob(jobId)`** — delete a completed ingest job.
- **`getBulkQueryResultsStream(jobId, locator?, maxRecords?)`** — stream query results as a Node.js `Readable` instead of buffering in memory. Useful for large result sets.
- **`deleteBulkQueryJob(jobId)`** — delete a completed query job.
- **`getAllIngestJobInfo(config?)`** — list all ingest jobs with optional filters (`jobType`, `isPkChunkingEnabled`, `queryLocator`).
- **`getBulkQueryResultPages(jobId)`** — retrieve result page URLs for parallel query result downloads.
- **`createDataUploadJobWithData(request, csv)`** — create an ingest job and upload CSV data in a single multipart request.
- `JOBTYPE` enum (`BigObjectIngest`, `Classic`, `V2Ingest`, `V2Query`).
- `InProgress` added to `STATE` enum.
- `query` and `queryAll` added to `OPERATION` enum.
- `isPkChunkingSupported` field on `BulkJobInfoResponse`.
- New model types exported from the barrel: `AllIngestJobsInfoResponse`, `IngestJobConfig`, `JOBTYPE`, `ParallelQueryResultsResponse`, `ResultPage`.
- **Unit test suite** using Vitest — 33 tests covering all public methods, endpoint construction, headers, and error propagation.
- **Integration test suite** — runs against a real Salesforce org (skipped when credentials are not set).
- Vitest configuration and `test`, `test:unit`, `test:integration`, `test:watch` npm scripts.
- Rewritten README with full query and ingest lifecycle examples, API reference table, and testing docs.
- Simplified examples directory — two runnable TypeScript scripts (`query-job.ts`, `ingest-job.ts`) replacing the four nested mini-projects.

### Changed

- Updated `axios` to `^1.15.0`.
- Updated `typescript` to `~5.8.0`.
- Migrated ESLint from `.eslintrc.json` to flat config (`eslint.config.mjs`).
- Test files excluded from the TypeScript build output.

### Removed

- Old `examples/bulkquery/` and `examples/bulkinsert/` directories (each with their own `package.json`, `package-lock.json`, `tsconfig.json`).

## [0.0.23] - 2021-04-13

### Fixed

- [Issue 14](https://github.com/msrivastav13/node-sf-bulk2/issues/14) — Set `maxBodyLength` and `maxContentLength` to `Infinity` on axios requests to support large CSV payloads.

## [0.0.22] - 2021-04-12

### Fixed

- Renamed `abortbulkQueryJob` to `abortBulkQueryJob` (typo fix).

## [0.0.21] - 2021-04-12

### Fixed

- Renamed `getBulkqueryResults` to `getBulkQueryResults` (typo fix).

## [0.0.20] - 2021-04-12

### Fixed

- [Issue 11](https://github.com/msrivastav13/node-sf-bulk2/issues/11) — Renamed `getInjestJobInfo` to `getIngestJobInfo`.
- [Issue 10](https://github.com/msrivastav13/node-sf-bulk2/issues/10) — `getBulkQueryResults` now returns the full `AxiosResponse` (including headers) instead of just the data string. The `locator` parameter type changed from `number` to `string` to match the Salesforce API.

## [0.0.17] - 2021-03-07

### Added

- **Ingest job support** — `createDataUploadJob`, `uploadJobData`, `closeOrAbortJob`, `getIngestJobInfo`, `getResults`.
- `JobUploadRequest`, `JobUploadResponse`, `JobInfoResponse` model types.
- `OPERATION`, `STATE`, `RESULTTYPE` enums.
- TypeScript example for bulk insert with CSV file upload.

## [0.0.6] - 2021-03-01

### Added

- TypeScript and JavaScript examples for bulk query.

## [0.0.3] - 2021-02-28

### Added

- `BulkAPI2` class with query job support — `submitBulkQueryJob`, `getBulkQueryJobInfo`, `getAllBulkQueryJobInfo`, `abortBulkQueryJob`, `getBulkQueryResults`.
- `BulkQueryResponse`, `BulkJobInfoResponse`, `AllBulkQueryJobsInfoResponse`, `BulkQueryConfig`, `QueryInput` model types.
- `CONTENTTYPE`, `COLUMNDELIMITER`, `LINEENDING` enums.
- Tooling API support via `isTooling` connection flag.

## [0.0.1] - 2021-02-28

Initial release.
