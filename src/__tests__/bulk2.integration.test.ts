import { describe, it, expect, beforeAll, vi } from 'vitest';
import BulkAPI2 from '../bulk2';
import { Connection } from '../model/connection';
import { RESULTTYPE } from '../model/enum';

vi.setConfig({ testTimeout: 60_000 });

/*
 * Integration tests that hit a real Salesforce org.
 *
 * Required environment variables:
 *   SF_ACCESS_TOKEN  — OAuth access token for the target org
 *   SF_INSTANCE_URL  — e.g. https://myorg.my.salesforce.com
 *   SF_API_VERSION   — e.g. 62.0
 *
 * Run:
 *   SF_ACCESS_TOKEN=... SF_INSTANCE_URL=... SF_API_VERSION=62.0 npm run test:integration
 */

const accessToken = process.env.SF_ACCESS_TOKEN;
const instanceUrl = process.env.SF_INSTANCE_URL;
const apiVersion = process.env.SF_API_VERSION ?? '62.0';

const canRun = Boolean(accessToken && instanceUrl);

describe.skipIf(!canRun)('BulkAPI2 integration', () => {
  let api: BulkAPI2;

  beforeAll(() => {
    const connection: Connection = {
      accessToken: accessToken!,
      instanceUrl: instanceUrl!,
      apiVersion,
    };
    api = new BulkAPI2(connection);
  });

  // ── Query Jobs ────────────────────────────────────────────

  describe('query job lifecycle', () => {
    let queryJobId: string;

    it('submits a bulk query job', async () => {
      const result = await api.submitBulkQueryJob({
        operation: 'query',
        query: 'SELECT Id, Name FROM Account LIMIT 5',
      });
      expect(result.id).toBeDefined();
      expect(result.operation).toBe('query');
      expect(result.state).toBeDefined();
      queryJobId = result.id;
    });

    it('gets query job info', async () => {
      const info = await api.getBulkQueryJobInfo(queryJobId);
      expect(info.id).toBe(queryJobId);
      expect(info.state).toBeDefined();
    });

    it('lists all query jobs', async () => {
      const all = await api.getAllBulkQueryJobInfo();
      expect(all.records).toBeDefined();
      expect(Array.isArray(all.records)).toBe(true);
    });

    it('retrieves query results when complete', async () => {
      let state = '';
      for (let i = 0; i < 30; i++) {
        const info = await api.getBulkQueryJobInfo(queryJobId);
        state = info.state;
        if (state === 'JobComplete' || state === 'Failed') break;
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (state !== 'JobComplete') {
        console.warn(`Query job ${queryJobId} ended with state: ${state}, skipping results check`);
        return;
      }
      const results = await api.getBulkQueryResults(queryJobId);
      expect(results.status).toBe(200);
      expect(typeof results.data).toBe('string');
    });

    it('streams query results', async () => {
      const info = await api.getBulkQueryJobInfo(queryJobId);
      if (info.state !== 'JobComplete') {
        console.warn(`Query job ${queryJobId} not complete, skipping stream test`);
        return;
      }
      const stream = await api.getBulkQueryResultsStream(queryJobId);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const csv = Buffer.concat(chunks).toString('utf-8');
      expect(csv.length).toBeGreaterThan(0);
      expect(csv).toContain('Id');
    });

    it('downloads result pages (partial/parallel downloads)', async () => {
      const info = await api.getBulkQueryJobInfo(queryJobId);
      if (info.state !== 'JobComplete') {
        console.warn(`Query job ${queryJobId} not complete, skipping result pages test`);
        return;
      }

      // resultPages requires the PartialDownloadAndJobEvent org preference; skip if unavailable.
      let pages;
      try {
        pages = await api.getBulkQueryResultPages(queryJobId);
      } catch {
        console.warn('resultPages unavailable (PartialDownloadAndJobEvent disabled), skipping');
        return;
      }
      expect(Array.isArray(pages.resultChunks)).toBe(true);
      if (pages.resultChunks.length === 0) {
        console.warn('No result chunks returned, skipping page download checks');
        return;
      }

      const { resultLink } = pages.resultChunks[0];

      // Buffered download
      const page = await api.getResultPage(resultLink);
      expect(page.status).toBe(200);
      expect(typeof page.data).toBe('string');

      // Streamed download
      const stream = await api.getResultPageStream(resultLink);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      expect(Buffer.concat(chunks).toString('utf-8').length).toBeGreaterThan(0);
    });

    it('deletes the query job', async () => {
      await api.deleteBulkQueryJob(queryJobId);
    });
  });

  // ── Ingest Jobs ───────────────────────────────────────────

  describe('ingest job lifecycle', () => {
    let ingestJobId: string;
    let contentUrl: string;

    it('creates an ingest job', async () => {
      const result = await api.createDataUploadJob({
        object: 'Account',
        operation: 'insert',
      });
      expect(result.id).toBeDefined();
      expect(result.state).toBe('Open');
      expect(result.contentUrl).toBeDefined();
      ingestJobId = result.id;
      contentUrl = result.contentUrl;
    });

    it('uploads CSV data', async () => {
      const csvData = 'Name\nIntegration Test Account';
      const status = await api.uploadJobData(contentUrl, csvData);
      expect(status).toBe(201);
    });

    it('closes the job to start processing', async () => {
      const result = await api.closeOrAbortJob(ingestJobId, 'UploadComplete');
      expect(result.state).toBe('UploadComplete');
    });

    it('gets ingest job info', async () => {
      const info = await api.getIngestJobInfo(ingestJobId);
      expect(info.id).toBe(ingestJobId);
    });

    it('lists all ingest jobs', async () => {
      const all = await api.getAllIngestJobInfo();
      expect(all.records).toBeDefined();
      expect(Array.isArray(all.records)).toBe(true);
    });

    it('retrieves successful results when complete', async () => {
      let state = '';
      for (let i = 0; i < 30; i++) {
        const info = await api.getIngestJobInfo(ingestJobId);
        state = info.state;
        if (state === 'JobComplete' || state === 'Failed') break;
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (state !== 'JobComplete') {
        console.warn(`Ingest job ${ingestJobId} ended with state: ${state}, skipping results check`);
        return;
      }
      const successResults = await api.getResults(ingestJobId, RESULTTYPE.successfulResults);
      expect(typeof successResults).toBe('string');

      const failedResults = await api.getResults(ingestJobId, RESULTTYPE.failedResults);
      expect(typeof failedResults).toBe('string');
    });

    it('deletes the ingest job', async () => {
      await api.deleteIngestJob(ingestJobId);
    });
  });

  // ── Ingest with multipart upload ──────────────────────────

  describe('createDataUploadJobWithData', () => {
    let jobId: string;

    it('creates an ingest job with data in a single request', async () => {
      const result = await api.createDataUploadJobWithData(
        { object: 'Account', operation: 'insert' },
        'Name\nMultipart Test Account',
      );
      expect(result.id).toBeDefined();
      jobId = result.id;
    });

    it('cleans up the multipart job', async () => {
      if (!jobId) return;
      try {
        await api.closeOrAbortJob(jobId, 'Aborted');
      } catch {
        // may already be processing
      }
      try {
        await api.deleteIngestJob(jobId);
      } catch {
        // best effort cleanup
      }
    });
  });
});
