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

export default class BulkAPI2 {

    private connection: Connection;
    private endpoint: string;

    constructor(connection: Connection) {
        this.connection = connection;
        this.endpoint = connection.instanceUrl + '/services/data/v' + connection.apiVersion;
        if (this.connection.isTooling) {
            this.endpoint += '/tooling'
        }
        this.endpoint += '/jobs';
    }

    private getRequestConfig(contentType: string, accept?: string): AxiosRequestConfig {
        const headers = {
            'Content-Type': contentType,
            Authorization: 'Bearer ' + this.connection.accessToken,
            accept: accept
        };
        const requestConfig: AxiosRequestConfig = {
            headers
        }
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

    public async abortbulkQueryJob(jobId: string): Promise<BulkQueryResponse> {
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
        const endpoint = this.endpoint + '/ingest/' + jobId + '/' + resulttype;
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'text/csv');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        return axiosresponse.data;
    }
}