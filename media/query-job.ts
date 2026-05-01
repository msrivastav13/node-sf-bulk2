/**
 * Bulk Query Job — full lifecycle example.
 *
 * Usage:
 *   export SF_ACCESS_TOKEN="..."
 *   export SF_INSTANCE_URL="https://yourorg.my.salesforce.com"
 *   npx ts-node examples/query-job.ts
 */

import { BulkAPI2, BulkAPI2Connection, QueryInput } from 'node-sf-bulk2';

const connection: BulkAPI2Connection = {
  accessToken: requireEnv('SF_ACCESS_TOKEN'),
  instanceUrl: requireEnv('SF_INSTANCE_URL'),
  apiVersion: process.env.SF_API_VERSION ?? '62.0',
};

async function main() {
  const bulk = new BulkAPI2(connection);

  // Submit a query job
  const queryInput: QueryInput = {
    query: 'SELECT Id, Name FROM Account LIMIT 10',
    operation: 'query',
  };
  const job = await bulk.submitBulkQueryJob(queryInput);
  console.log(`Query job created: ${job.id} (state: ${job.state})`);

  // Poll until the job completes
  let info = await bulk.getBulkQueryJobInfo(job.id);
  while (info.state !== 'JobComplete' && info.state !== 'Failed') {
    console.log(`  state: ${info.state} — waiting...`);
    await sleep(2000);
    info = await bulk.getBulkQueryJobInfo(job.id);
  }
  console.log(`Job finished: ${info.state} (${info.numberRecordsProcessed} records processed)`);

  if (info.state === 'Failed') {
    process.exit(1);
  }

  // Retrieve CSV results
  const response = await bulk.getBulkQueryResults(job.id);
  console.log('\nResults (CSV):');
  console.log(response.data);

  // Clean up
  await bulk.deleteBulkQueryJob(job.id);
  console.log('Job deleted.');
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Error: set the ${name} environment variable.`);
    process.exit(1);
  }
  return value;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
