import { Readable } from 'stream';
import { Connection } from "./model/connection";
import axois, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { BulkQueryResponse } from './model/queryResponse';
import { QueryInput } from './model/queryInput';
import { BulkJobInfoResponse } from "./model/bulkJobInfoResponse";
import { AllBulkQueryJobsInfoResponse } from "./model/allBulkQueryJobsInfoResponse";
import { BulkQueryConfig } from './model/bulkQueryConfig';
import { JobUploadRequest } from './model/jobUploadRequest';
import { JobUploadResponse } from './model/jobUploadResponse';
import { JobInfoResponse } from './model/jobInfoResponse';
import { RESULTTYPE } from './model/enum'
import { IngestJobConfig } from './model/ingestJobConfig';
import { AllIngestJobsInfoResponse } from './model/allIngestJobsInfoResponse';
import { ParallelQueryResultsResponse } from './model/parallelQueryResultsResponse';

export default class BulkAPI2 {

    private connection: Connection;
    private endpoint: string;
    private dataUrl: string;

    constructor(connection: Connection) {
        this.connection = connection;
        this.dataUrl = connection.instanceUrl + '/services/data/v' + connection.apiVersion;
        this.endpoint = this.dataUrl;
        if (this.connection.isTooling) {
            this.endpoint += '/tooling'
        }
        this.endpoint += '/jobs';
    }

    private getRequestConfig(contentType: string, accept?: string): AxiosRequestConfig {
        const headers: Record<string, string | undefined> = {
            'Content-Type': contentType,
            Authorization: 'Bearer ' + this.connection.accessToken,
            accept: accept
        };
        if (this.connection.callOptions) {
            const parts: string[] = [];
            if (this.connection.callOptions.client) {
                parts.push('client=' + this.connection.callOptions.client);
            }
            if (this.connection.callOptions.defaultNamespace) {
                parts.push('defaultNamespace=' + this.connection.callOptions.defaultNamespace);
            }
            if (parts.length > 0) {
                headers['Sforce-Call-Options'] = parts.join(', ');
            }
        }
        const requestConfig: AxiosRequestConfig = {
            headers
        }
        requestConfig.maxBodyLength = Infinity;
        requestConfig.maxContentLength = Infinity;
        return requestConfig;
    }

    public async submitBulkQueryJob(query: QueryInput): Promise<BulkQueryResponse> {
        const body = JSON.stringify(query);
        const endpoint = this.endpoint + '/query'
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const axiosresponse: AxiosResponse = await axois.post(endpoint, body, requestConfig);
        const queryResponse = axiosresponse.data as BulkQueryResponse;
        return queryResponse;
    }

    public async getBulkQueryJobInfo(jobId: string): Promise<BulkJobInfoResponse> {
        const endpoint = this.endpoint + '/query/' + jobId;
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        const queryResponse = axiosresponse.data as BulkJobInfoResponse;
        return queryResponse;
    }

    public async getAllBulkQueryJobInfo(configInput?: BulkQueryConfig): Promise<AllBulkQueryJobsInfoResponse> {
        let endpoint: string = this.endpoint + '/query';
        if (configInput && Object.keys(configInput).length > 0) {
            endpoint += '/?';
            let i = 0;
            let key: keyof BulkQueryConfig;
            for (key in configInput) {
                endpoint += key + '=' + configInput[key];
                if (i < (Object.keys(configInput).length - 1)) {
                    endpoint += '&';
                }
                i++;
            }
        }
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        const queryResponse = axiosresponse.data as AllBulkQueryJobsInfoResponse;
        return queryResponse;
    }

    public async abortBulkQueryJob(jobId: string): Promise<BulkQueryResponse> {
        const endpoint = this.endpoint + '/query/' + jobId;
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const body = JSON.stringify({
            state: 'Aborted'
        });
        const axiosresponse: AxiosResponse = await axois.patch(endpoint, body, requestConfig);
        const queryResponse = axiosresponse.data as BulkJobInfoResponse;
        return queryResponse;
    }

    public async getBulkQueryResults(jobId: string, locator?: string, maxRecords?: number): Promise<AxiosResponse> {
        let endpoint = this.endpoint + '/query/' + jobId + '/results';
        if (locator) {
            endpoint += '?locator=' + locator;
            if (maxRecords) {
                endpoint += '&maxRecords=' + maxRecords;
            }
        } else {
            if (maxRecords) {
                endpoint += '?maxRecords=' + maxRecords;
            }
        }
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'text/csv');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        return axiosresponse;
    }

    public async getBulkQueryResultsStream(jobId: string, locator?: string, maxRecords?: number): Promise<Readable> {
        let endpoint = this.endpoint + '/query/' + jobId + '/results';
        if (locator) {
            endpoint += '?locator=' + locator;
            if (maxRecords) {
                endpoint += '&maxRecords=' + maxRecords;
            }
        } else {
            if (maxRecords) {
                endpoint += '?maxRecords=' + maxRecords;
            }
        }
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'text/csv');
        requestConfig.responseType = 'stream';
        const axiosresponse: AxiosResponse<Readable> = await axois.get(endpoint, requestConfig);
        return axiosresponse.data;
    }

    public async createDataUploadJob(jobUploadRequest: JobUploadRequest): Promise<JobUploadResponse> {
        const endpoint = this.endpoint + '/ingest';
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json; charset=UTF-8', 'application/json');
        const axiosresponse: AxiosResponse = await axois.post(endpoint, JSON.stringify(jobUploadRequest), requestConfig);
        const jobuploadresponse: JobUploadResponse = axiosresponse.data;
        return jobuploadresponse;
    }

    public async uploadJobData(contenturl: string, data: string): Promise<number> {
        const endpoint = this.connection.instanceUrl + '/' + contenturl;
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('text/csv', 'application/json');
        const axiosresponse: AxiosResponse = await axois.put(endpoint, data, requestConfig);
        return axiosresponse.status;
    }

    public async closeOrAbortJob(jobId: string, state: string): Promise<JobUploadResponse> {
        const endpoint = this.endpoint + '/ingest/' + jobId;
        const body = JSON.stringify({
            state: state
        });
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const axiosresponse: AxiosResponse = await axois.patch(endpoint, body, requestConfig);
        const jobuploadresponse: JobUploadResponse = axiosresponse.data;
        return jobuploadresponse;
    }

    public async getIngestJobInfo(jobId: string): Promise<JobInfoResponse> {
        const endpoint = this.endpoint + '/ingest/' + jobId;
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        const queryResponse = axiosresponse.data as JobInfoResponse;
        return queryResponse;
    }

    public async getResults(jobId: string, resulttype: RESULTTYPE): Promise<string> {
        const endpoint = this.endpoint + '/ingest/' + jobId + '/' + RESULTTYPE[resulttype];
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'text/csv');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        return axiosresponse.data;
    }

    public async deleteIngestJob(jobId: string): Promise<void> {
        const endpoint = this.endpoint + '/ingest/' + jobId;
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        await axois.delete(endpoint, requestConfig);
    }

    public async deleteBulkQueryJob(jobId: string): Promise<void> {
        const endpoint = this.endpoint + '/query/' + jobId;
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        await axois.delete(endpoint, requestConfig);
    }

    public async getAllIngestJobInfo(configInput?: IngestJobConfig): Promise<AllIngestJobsInfoResponse> {
        let endpoint: string = this.endpoint + '/ingest';
        if (configInput && Object.keys(configInput).length > 0) {
            endpoint += '/?';
            let i = 0;
            let key: keyof IngestJobConfig;
            for (key in configInput) {
                endpoint += key + '=' + configInput[key];
                if (i < (Object.keys(configInput).length - 1)) {
                    endpoint += '&';
                }
                i++;
            }
        }
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        const response = axiosresponse.data as AllIngestJobsInfoResponse;
        return response;
    }

    public async getBulkQueryResultPages(jobId: string): Promise<ParallelQueryResultsResponse> {
        const endpoint = this.endpoint + '/query/' + jobId + '/resultPages';
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        const response = axiosresponse.data as ParallelQueryResultsResponse;
        return response;
    }

    private resolveResultLink(resultLink: string): string {
        if (/^https?:\/\//i.test(resultLink)) {
            return resultLink;
        }
        // resultLink is relative to the /services/data/vXX.0 base (e.g. "/jobs/query/{id}/results?locator=...")
        return this.dataUrl + (resultLink.startsWith('/') ? '' : '/') + resultLink;
    }

    public async getResultPage(resultLink: string): Promise<AxiosResponse> {
        const endpoint = this.resolveResultLink(resultLink);
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'text/csv');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        return axiosresponse;
    }

    public async getResultPageStream(resultLink: string): Promise<Readable> {
        const endpoint = this.resolveResultLink(resultLink);
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'text/csv');
        requestConfig.responseType = 'stream';
        const axiosresponse: AxiosResponse<Readable> = await axois.get(endpoint, requestConfig);
        return axiosresponse.data;
    }

    public async createDataUploadJobWithData(jobUploadRequest: JobUploadRequest, csvData: string): Promise<JobUploadResponse> {
        const endpoint = this.endpoint + '/ingest';
        const boundary = '----BulkAPI2Boundary' + Date.now();
        const body =
            '--' + boundary + '\r\n' +
            'Content-Type: application/json\r\n' +
            'Content-Disposition: form-data; name="job"\r\n\r\n' +
            JSON.stringify(jobUploadRequest) + '\r\n' +
            '--' + boundary + '\r\n' +
            'Content-Type: text/csv\r\n' +
            'Content-Disposition: form-data; name="content"; filename="content"\r\n\r\n' +
            csvData + '\r\n' +
            '--' + boundary + '--';
        const requestConfig: AxiosRequestConfig = this.getRequestConfig(
            'multipart/form-data; boundary=' + boundary,
            'application/json'
        );
        const axiosresponse: AxiosResponse = await axois.post(endpoint, body, requestConfig);
        const jobuploadresponse: JobUploadResponse = axiosresponse.data;
        return jobuploadresponse;
    }
}