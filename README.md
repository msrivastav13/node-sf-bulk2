# node-sf-bulk2

Node.js wrapper for the [Salesforce Bulk API 2.0](https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_bulk_v2/asynch_api_intro.htm). Works with any auth library that gives you an access token — [jsforce](https://jsforce.github.io/), [@salesforce/sf-core](https://github.com/forcedotcom/sfdx-core), SF CLI, etc.

Written in TypeScript with full type definitions included.

## Installation

```sh
npm install node-sf-bulk2
```

## Quick Start

Create a connection object from any Salesforce auth source, then pass it to `BulkAPI2`:

```typescript
import { BulkAPI2, BulkAPI2Connection } from 'node-sf-bulk2';

const connection: BulkAPI2Connection = {
  accessToken: '<your-access-token>',
  instanceUrl: 'https://yourorg.my.salesforce.com',
  apiVersion: '62.0',
};

const bulk = new BulkAPI2(connection);
```

For the Tooling API, set `isTooling: true` on the connection. To pass [call options](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/headers_calloptions.htm), add `callOptions`:

```typescript
const connection: BulkAPI2Connection = {
  accessToken: '<token>',
  instanceUrl: 'https://yourorg.my.salesforce.com',
  apiVersion: '62.0',
  isTooling: true,
  callOptions: {
    client: 'myApp',
    defaultNamespace: 'ns1',
  },
};
```

## Query Job — Full Lifecycle

Submit a query, poll until complete, and retrieve CSV results:

```typescript
import { BulkAPI2, BulkAPI2Connection, QueryInput } from 'node-sf-bulk2';

const connection: BulkAPI2Connection = {
  accessToken: '<token>',
  instanceUrl: 'https://yourorg.my.salesforce.com',
  apiVersion: '62.0',
};
const bulk = new BulkAPI2(connection);

// 1. Submit the query job
const queryInput: QueryInput = {
  query: 'SELECT Id, Name FROM Account',
  operation: 'query',
};
const job = await bulk.submitBulkQueryJob(queryInput);
console.log('Job created:', job.id);

// 2. Poll until complete
let info = await bulk.getBulkQueryJobInfo(job.id);
while (info.state !== 'JobComplete' && info.state !== 'Failed') {
  await new Promise((r) => setTimeout(r, 2000));
  info = await bulk.getBulkQueryJobInfo(job.id);
}

if (info.state === 'Failed') {
  throw new Error('Query job failed');
}

// 3. Get results (CSV)
const response = await bulk.getBulkQueryResults(job.id);
console.log('Results:\n', response.data);

// 4. Clean up
await bulk.deleteBulkQueryJob(job.id);
```

For large result sets, page through with `locator` and `maxRecords`:

```typescript
let locator: string | undefined;
do {
  const response = await bulk.getBulkQueryResults(job.id, locator, 10000);
  console.log(response.data);
  locator = response.headers['sforce-locator'];
  if (locator === 'null') locator = undefined;
} while (locator);
```

## Ingest Job — Full Lifecycle

Create an ingest job, upload CSV data, and retrieve results:

```typescript
import { BulkAPI2, BulkAPI2Connection, JobUploadRequest } from 'node-sf-bulk2';
import { readFileSync } from 'fs';

const connection: BulkAPI2Connection = {
  accessToken: '<token>',
  instanceUrl: 'https://yourorg.my.salesforce.com',
  apiVersion: '62.0',
};
const bulk = new BulkAPI2(connection);

// 1. Create the job
const jobRequest: JobUploadRequest = {
  object: 'Account',
  operation: 'insert',
};
const job = await bulk.createDataUploadJob(jobRequest);

// 2. Upload CSV data
const csv = readFileSync('./accounts.csv', 'utf-8');
await bulk.uploadJobData(job.contentUrl, csv);

// 3. Close the job to begin processing
await bulk.closeOrAbortJob(job.id, 'UploadComplete');

// 4. Poll until complete
let info = await bulk.getIngestJobInfo(job.id);
while (info.state !== 'JobComplete' && info.state !== 'Failed') {
  await new Promise((r) => setTimeout(r, 2000));
  info = await bulk.getIngestJobInfo(job.id);
}

// 5. Get results
const successful = await bulk.getResults(job.id, 0); // successfulResults
const failed = await bulk.getResults(job.id, 1);     // failedResults
console.log('Successful:\n', successful);
console.log('Failed:\n', failed);

// 6. Clean up
await bulk.deleteIngestJob(job.id);
```

You can also create a job and upload data in a single multipart request:

```typescript
const csv = readFileSync('./accounts.csv', 'utf-8');
const job = await bulk.createDataUploadJobWithData(
  { object: 'Account', operation: 'insert' },
  csv,
);
```

## API Reference

### Query Jobs

| Method | Description |
|--------|-------------|
| `submitBulkQueryJob(query)` | Submit a new query job |
| `getBulkQueryJobInfo(jobId)` | Get status/info for a query job |
| `getAllBulkQueryJobInfo(config?)` | List all query jobs (with optional filters) |
| `getBulkQueryResults(jobId, locator?, maxRecords?)` | Get query results as CSV |
| `getBulkQueryResultPages(jobId)` | Get result page URLs for parallel download |
| `abortBulkQueryJob(jobId)` | Abort a query job |
| `deleteBulkQueryJob(jobId)` | Delete a query job |

### Ingest Jobs

| Method | Description |
|--------|-------------|
| `createDataUploadJob(request)` | Create an ingest job |
| `createDataUploadJobWithData(request, csv)` | Create an ingest job with CSV data in one request |
| `uploadJobData(contentUrl, csv)` | Upload CSV data to an open job |
| `closeOrAbortJob(jobId, state)` | Close (`UploadComplete`) or abort (`Aborted`) a job |
| `getIngestJobInfo(jobId)` | Get status/info for an ingest job |
| `getAllIngestJobInfo(config?)` | List all ingest jobs (with optional filters) |
| `getResults(jobId, resultType)` | Get results — `0` = successful, `1` = failed, `2` = unprocessed |
| `deleteIngestJob(jobId)` | Delete an ingest job |

See the [full API documentation](https://msrivastav13.github.io/node-sf-bulk2/index.html) for details on all request/response types.

## Examples

The [`examples/`](./examples) directory contains runnable scripts:

- **[query-job.ts](./examples/query-job.ts)** — Submit a query, poll, retrieve CSV results
- **[ingest-job.ts](./examples/ingest-job.ts)** — Create ingest job, upload CSV, poll, retrieve results

To run them, set your Salesforce credentials as environment variables:

```sh
export SF_ACCESS_TOKEN="your-access-token"
export SF_INSTANCE_URL="https://yourorg.my.salesforce.com"
```

Then run with `ts-node`:

```sh
npx ts-node examples/query-job.ts
npx ts-node examples/ingest-job.ts
```

## Testing

```sh
npm test             # run all tests
npm run test:unit    # unit tests only (mocked, no org needed)
npm run test:watch   # watch mode
```

Integration tests require a Salesforce org:

```sh
SF_ACCESS_TOKEN="..." SF_INSTANCE_URL="..." npm run test:integration
```

## License

ISC
