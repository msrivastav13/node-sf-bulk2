/**
 * Bulk Ingest Job — full lifecycle example.
 *
 * Usage:
 *   export SF_ACCESS_TOKEN="..."
 *   export SF_INSTANCE_URL="https://yourorg.my.salesforce.com"
 *   npx ts-node examples/ingest-job.ts
 */

import { BulkAPI2, BulkAPI2Connection, JobUploadRequest } from 'node-sf-bulk2';

const connection: BulkAPI2Connection = {
  accessToken: requireEnv('SF_ACCESS_TOKEN'),
  instanceUrl: requireEnv('SF_INSTANCE_URL'),
  apiVersion: process.env.SF_API_VERSION ?? '62.0',
};

const CSV_DATA = [
  'Name,Description,NumberOfEmployees',
  'Acme Corp,Example account,100',
  'Globex Inc,Another example,250',
].join('\n');

async function main() {
  const bulk = new BulkAPI2(connection);

  // Create the ingest job
  const jobRequest: JobUploadRequest = {
    object: 'Account',
    operation: 'insert',
  };
  const job = await bulk.createDataUploadJob(jobRequest);
  console.log(`Ingest job created: ${job.id} (state: ${job.state})`);

  // Upload CSV data
  const status = await bulk.uploadJobData(job.contentUrl, CSV_DATA);
  console.log(`Upload status: ${status}`);

  // Close the job so Salesforce starts processing
  await bulk.closeOrAbortJob(job.id, 'UploadComplete');
  console.log('Job closed — processing started.');

  // Poll until complete
  let info = await bulk.getIngestJobInfo(job.id);
  while (info.state !== 'JobComplete' && info.state !== 'Failed') {
    console.log(`  state: ${info.state} — waiting...`);
    await sleep(2000);
    info = await bulk.getIngestJobInfo(job.id);
  }
  console.log(`Job finished: ${info.state}`);
  console.log(`  Records processed: ${info.numberRecordsProcessed}`);
  console.log(`  Records failed:    ${info.numberRecordsFailed}`);

  // Retrieve results
  const successful = await bulk.getResults(job.id, 0); // successfulResults
  const failed = await bulk.getResults(job.id, 1);     // failedResults
  console.log('\nSuccessful results (CSV):');
  console.log(successful || '  (none)');
  if (failed) {
    console.log('\nFailed results (CSV):');
    console.log(failed);
  }

  // Clean up
  await bulk.deleteIngestJob(job.id);
  console.log('\nJob deleted.');
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
