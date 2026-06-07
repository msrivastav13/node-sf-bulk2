import { Readable } from 'stream';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import BulkAPI2 from '../bulk2';
import { Connection } from '../model/connection';
import { RESULTTYPE } from '../model/enum';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const BASE_CONNECTION: Connection = {
  accessToken: 'test-token',
  apiVersion: '62.0',
  instanceUrl: 'https://example.salesforce.com',
};

const BASE_ENDPOINT = 'https://example.salesforce.com/services/data/v62.0/jobs';

function mockResponse(data: unknown, status = 200) {
  return { data, status, headers: {}, statusText: 'OK', config: {} };
}

describe('BulkAPI2', () => {
  let api: BulkAPI2;

  beforeEach(() => {
    vi.clearAllMocks();
    api = new BulkAPI2(BASE_CONNECTION);
  });

  // ── Constructor & Endpoint ──────────────────────────────────

  describe('constructor', () => {
    it('builds the standard endpoint', () => {
      const api = new BulkAPI2(BASE_CONNECTION);
      // Verify by calling a method and checking the URL
      mockedAxios.get.mockResolvedValueOnce(mockResponse({}));
      api.getBulkQueryJobInfo('job123');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/job123`,
        expect.any(Object),
      );
    });

    it('inserts /tooling when isTooling is true', () => {
      const toolingApi = new BulkAPI2({ ...BASE_CONNECTION, isTooling: true });
      mockedAxios.get.mockResolvedValueOnce(mockResponse({}));
      toolingApi.getBulkQueryJobInfo('job123');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://example.salesforce.com/services/data/v62.0/tooling/jobs/query/job123',
        expect.any(Object),
      );
    });
  });

  // ── Request Config / Headers ────────────────────────────────

  describe('request headers', () => {
    it('sets Authorization bearer token', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse({}));
      await api.getBulkQueryJobInfo('j1');
      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.headers?.Authorization).toBe('Bearer test-token');
    });

    it('sets Content-Type and accept headers', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse('csv-data'));
      await api.getBulkQueryResults('j1');
      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.headers?.['Content-Type']).toBe('application/json');
      expect(config.headers?.accept).toBe('text/csv');
    });

    it('sets Sforce-Call-Options when callOptions provided', async () => {
      const conn: Connection = {
        ...BASE_CONNECTION,
        callOptions: { client: 'myApp', defaultNamespace: 'ns1' },
      };
      const apiWithOpts = new BulkAPI2(conn);
      mockedAxios.get.mockResolvedValueOnce(mockResponse({}));
      await apiWithOpts.getBulkQueryJobInfo('j1');
      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.headers?.['Sforce-Call-Options']).toBe('client=myApp, defaultNamespace=ns1');
    });

    it('omits Sforce-Call-Options when callOptions is empty', async () => {
      const conn: Connection = { ...BASE_CONNECTION, callOptions: {} };
      const apiNoOpts = new BulkAPI2(conn);
      mockedAxios.get.mockResolvedValueOnce(mockResponse({}));
      await apiNoOpts.getBulkQueryJobInfo('j1');
      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.headers?.['Sforce-Call-Options']).toBeUndefined();
    });

    it('sets only client in Sforce-Call-Options when defaultNamespace is absent', async () => {
      const conn: Connection = {
        ...BASE_CONNECTION,
        callOptions: { client: 'myApp' },
      };
      const apiClientOnly = new BulkAPI2(conn);
      mockedAxios.get.mockResolvedValueOnce(mockResponse({}));
      await apiClientOnly.getBulkQueryJobInfo('j1');
      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.headers?.['Sforce-Call-Options']).toBe('client=myApp');
    });

    it('sets maxBodyLength and maxContentLength to Infinity', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse({}));
      await api.getBulkQueryJobInfo('j1');
      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.maxBodyLength).toBe(Infinity);
      expect(config.maxContentLength).toBe(Infinity);
    });
  });

  // ── Query Job Methods ───────────────────────────────────────

  describe('submitBulkQueryJob', () => {
    it('POSTs to /query and returns parsed response', async () => {
      const queryInput = { operation: 'query', query: 'SELECT Id FROM Account' };
      const responseData = { id: 'q1', operation: 'query', state: 'UploadComplete' };
      mockedAxios.post.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.submitBulkQueryJob(queryInput);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query`,
        JSON.stringify(queryInput),
        expect.any(Object),
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('getBulkQueryJobInfo', () => {
    it('GETs /query/{jobId} and returns job info', async () => {
      const responseData = { id: 'q1', state: 'JobComplete', numberRecordsProcessed: 42 };
      mockedAxios.get.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.getBulkQueryJobInfo('q1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1`,
        expect.any(Object),
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('getAllBulkQueryJobInfo', () => {
    it('GETs /query with no params when no config', async () => {
      const responseData = { done: true, records: [], nextRecordsUrl: '' };
      mockedAxios.get.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.getAllBulkQueryJobInfo();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query`,
        expect.any(Object),
      );
      expect(result).toEqual(responseData);
    });

    it('appends query params from config', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse({ done: true, records: [], nextRecordsUrl: '' }));

      await api.getAllBulkQueryJobInfo({ jobType: 'V2Query', isPkChunkingEnabled: 'false' });

      const url = mockedAxios.get.mock.calls[0][0] as string;
      expect(url).toContain('/?');
      expect(url).toContain('jobType=V2Query');
      expect(url).toContain('isPkChunkingEnabled=false');
    });

    it('skips query params when config is empty object', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse({ done: true, records: [], nextRecordsUrl: '' }));

      await api.getAllBulkQueryJobInfo({});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query`,
        expect.any(Object),
      );
    });
  });

  describe('abortBulkQueryJob', () => {
    it('PATCHes /query/{jobId} with Aborted state', async () => {
      const responseData = { id: 'q1', state: 'Aborted' };
      mockedAxios.patch.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.abortBulkQueryJob('q1');

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1`,
        JSON.stringify({ state: 'Aborted' }),
        expect.any(Object),
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('getBulkQueryResults', () => {
    it('GETs /query/{jobId}/results with no pagination params', async () => {
      const resp = mockResponse('csv-data');
      mockedAxios.get.mockResolvedValueOnce(resp);

      const result = await api.getBulkQueryResults('q1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1/results`,
        expect.any(Object),
      );
      expect(result).toEqual(resp);
    });

    it('appends locator param', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse(''));

      await api.getBulkQueryResults('q1', 'abc');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1/results?locator=abc`,
        expect.any(Object),
      );
    });

    it('appends both locator and maxRecords', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse(''));

      await api.getBulkQueryResults('q1', 'abc', 500);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1/results?locator=abc&maxRecords=500`,
        expect.any(Object),
      );
    });

    it('appends only maxRecords when no locator', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse(''));

      await api.getBulkQueryResults('q1', undefined, 100);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1/results?maxRecords=100`,
        expect.any(Object),
      );
    });

    it('returns raw AxiosResponse (not just .data)', async () => {
      const resp = mockResponse('Id,Name\n001,Acme');
      mockedAxios.get.mockResolvedValueOnce(resp);

      const result = await api.getBulkQueryResults('q1');

      expect(result.data).toBe('Id,Name\n001,Acme');
      expect(result.status).toBe(200);
    });
  });

  describe('getBulkQueryResultsStream', () => {
    it('GETs /query/{jobId}/results with responseType stream', async () => {
      const fakeStream = new Readable({ read() { this.push(null); } });
      mockedAxios.get.mockResolvedValueOnce(mockResponse(fakeStream));

      const result = await api.getBulkQueryResultsStream('q1');

      expect(result).toBe(fakeStream);
      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.responseType).toBe('stream');
      expect(config.headers?.accept).toBe('text/csv');
    });

    it('appends locator and maxRecords params', async () => {
      const fakeStream = new Readable({ read() { this.push(null); } });
      mockedAxios.get.mockResolvedValueOnce(mockResponse(fakeStream));

      await api.getBulkQueryResultsStream('q1', 'abc', 500);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1/results?locator=abc&maxRecords=500`,
        expect.any(Object),
      );
    });

    it('appends only maxRecords when no locator', async () => {
      const fakeStream = new Readable({ read() { this.push(null); } });
      mockedAxios.get.mockResolvedValueOnce(mockResponse(fakeStream));

      await api.getBulkQueryResultsStream('q1', undefined, 100);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1/results?maxRecords=100`,
        expect.any(Object),
      );
    });
  });

  describe('deleteBulkQueryJob', () => {
    it('DELETEs /query/{jobId}', async () => {
      mockedAxios.delete.mockResolvedValueOnce(mockResponse(null, 204));

      await api.deleteBulkQueryJob('q1');

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1`,
        expect.any(Object),
      );
    });
  });

  describe('getBulkQueryResultPages', () => {
    it('GETs /query/{jobId}/resultPages', async () => {
      const responseData = {
        resultChunks: [{ resultLink: '/jobs/query/q1/results?locator=abc' }],
        nextRecordsUrl: null,
        done: true,
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.getBulkQueryResultPages('q1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/query/q1/resultPages`,
        expect.any(Object),
      );
      expect(result).toEqual(responseData);
    });
  });

  // resultLink values are relative to the /services/data/vXX.0 base (BASE_ENDPOINT without /jobs).
  const DATA_URL = 'https://example.salesforce.com/services/data/v62.0';

  describe('getResultPage', () => {
    it('GETs an absolute resultLink as-is', async () => {
      const resp = mockResponse('Id,Name\n001,Acme');
      mockedAxios.get.mockResolvedValueOnce(resp);

      const result = await api.getResultPage(`${DATA_URL}/jobs/query/q1/results?locator=abc`);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${DATA_URL}/jobs/query/q1/results?locator=abc`,
        expect.any(Object),
      );
      expect(result).toEqual(resp);
    });

    it('resolves a relative resultLink against the /services/data base', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse('csv'));

      await api.getResultPage('/jobs/query/q1/results?locator=abc');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${DATA_URL}/jobs/query/q1/results?locator=abc`,
        expect.any(Object),
      );
    });

    it('inserts a slash for a relative resultLink without a leading slash', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse('csv'));

      await api.getResultPage('jobs/query/q1/results?locator=abc');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${DATA_URL}/jobs/query/q1/results?locator=abc`,
        expect.any(Object),
      );
    });

    it('requests CSV via the accept header', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse('csv'));

      await api.getResultPage('/jobs/query/q1/results?locator=abc');

      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.headers?.accept).toBe('text/csv');
    });
  });

  describe('getResultPageStream', () => {
    it('GETs the resultLink with responseType stream', async () => {
      const fakeStream = new Readable({ read() { this.push(null); } });
      mockedAxios.get.mockResolvedValueOnce(mockResponse(fakeStream));

      const result = await api.getResultPageStream('/jobs/query/q1/results?locator=abc');

      expect(result).toBe(fakeStream);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${DATA_URL}/jobs/query/q1/results?locator=abc`,
        expect.any(Object),
      );
      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.responseType).toBe('stream');
      expect(config.headers?.accept).toBe('text/csv');
    });
  });

  // ── Ingest Job Methods ──────────────────────────────────────

  describe('createDataUploadJob', () => {
    it('POSTs to /ingest and returns job upload response', async () => {
      const request = { object: 'Account', operation: 'insert' };
      const responseData = { id: 'i1', state: 'Open', contentUrl: 'services/data/v62.0/jobs/ingest/i1/batches' };
      mockedAxios.post.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.createDataUploadJob(request);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/ingest`,
        JSON.stringify(request),
        expect.any(Object),
      );
      const config = mockedAxios.post.mock.calls[0][2]!;
      expect(config.headers?.['Content-Type']).toBe('application/json; charset=UTF-8');
      expect(result).toEqual(responseData);
    });
  });

  describe('uploadJobData', () => {
    it('PUTs CSV data to contentUrl and returns status code', async () => {
      mockedAxios.put.mockResolvedValueOnce(mockResponse(null, 201));
      const csvData = 'Name,Industry\nAcme,Technology';

      const status = await api.uploadJobData('services/data/v62.0/jobs/ingest/i1/batches', csvData);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'https://example.salesforce.com/services/data/v62.0/jobs/ingest/i1/batches',
        csvData,
        expect.any(Object),
      );
      const config = mockedAxios.put.mock.calls[0][2]!;
      expect(config.headers?.['Content-Type']).toBe('text/csv');
      expect(status).toBe(201);
    });
  });

  describe('closeOrAbortJob', () => {
    it('PATCHes /ingest/{jobId} with given state', async () => {
      const responseData = { id: 'i1', state: 'UploadComplete' };
      mockedAxios.patch.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.closeOrAbortJob('i1', 'UploadComplete');

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/ingest/i1`,
        JSON.stringify({ state: 'UploadComplete' }),
        expect.any(Object),
      );
      expect(result).toEqual(responseData);
    });

    it('can abort a job', async () => {
      mockedAxios.patch.mockResolvedValueOnce(mockResponse({ id: 'i1', state: 'Aborted' }));

      const result = await api.closeOrAbortJob('i1', 'Aborted');

      expect(result.state).toBe('Aborted');
    });
  });

  describe('getIngestJobInfo', () => {
    it('GETs /ingest/{jobId} and returns job info', async () => {
      const responseData = { id: 'i1', state: 'JobComplete', numberRecordsProcessed: 10 };
      mockedAxios.get.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.getIngestJobInfo('i1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/ingest/i1`,
        expect.any(Object),
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('getResults', () => {
    it('GETs /ingest/{jobId}/{resulttype} with CSV accept header', async () => {
      const csvData = '"sf__Id","sf__Created","Name"\n"001xx","true","Acme"';
      mockedAxios.get.mockResolvedValueOnce(mockResponse(csvData));

      const result = await api.getResults('i1', RESULTTYPE.successfulResults);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/ingest/i1/successfulResults`,
        expect.any(Object),
      );
      const config = mockedAxios.get.mock.calls[0][1]!;
      expect(config.headers?.accept).toBe('text/csv');
      expect(result).toBe(csvData);
    });
  });

  describe('deleteIngestJob', () => {
    it('DELETEs /ingest/{jobId}', async () => {
      mockedAxios.delete.mockResolvedValueOnce(mockResponse(null, 204));

      await api.deleteIngestJob('i1');

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/ingest/i1`,
        expect.any(Object),
      );
    });
  });

  describe('getAllIngestJobInfo', () => {
    it('GETs /ingest with no params when no config', async () => {
      const responseData = { done: true, records: [], nextRecordsUrl: '' };
      mockedAxios.get.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.getAllIngestJobInfo();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/ingest`,
        expect.any(Object),
      );
      expect(result).toEqual(responseData);
    });

    it('appends query params from config', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse({ done: true, records: [], nextRecordsUrl: '' }));

      await api.getAllIngestJobInfo({ jobType: 'V2Ingest', queryLocator: 100 });

      const url = mockedAxios.get.mock.calls[0][0] as string;
      expect(url).toContain('jobType=V2Ingest');
      expect(url).toContain('queryLocator=100');
    });

    it('skips query params when config is empty object', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockResponse({ done: true, records: [], nextRecordsUrl: '' }));

      await api.getAllIngestJobInfo({});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/ingest`,
        expect.any(Object),
      );
    });
  });

  describe('createDataUploadJobWithData', () => {
    it('POSTs multipart form-data to /ingest', async () => {
      const request = { object: 'Account', operation: 'insert' };
      const csvData = 'Name\nAcme';
      const responseData = { id: 'i1', state: 'UploadComplete' };
      mockedAxios.post.mockResolvedValueOnce(mockResponse(responseData));

      const result = await api.createDataUploadJobWithData(request, csvData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_ENDPOINT}/ingest`,
        expect.any(String),
        expect.any(Object),
      );
      const body = mockedAxios.post.mock.calls[0][1] as string;
      expect(body).toContain('Content-Type: application/json');
      expect(body).toContain(JSON.stringify(request));
      expect(body).toContain('Content-Type: text/csv');
      expect(body).toContain(csvData);
      expect(body).toContain('Content-Disposition: form-data; name="content"; filename="content"');

      const config = mockedAxios.post.mock.calls[0][2]!;
      expect((config.headers?.['Content-Type'] as string)).toContain('multipart/form-data; boundary=');
      expect(result).toEqual(responseData);
    });
  });

  // ── Error propagation ───────────────────────────────────────

  describe('error handling', () => {
    it('propagates axios errors to the caller', async () => {
      const axiosError = new Error('Request failed with status code 401');
      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(api.getBulkQueryJobInfo('bad')).rejects.toThrow('Request failed with status code 401');
    });
  });
});
