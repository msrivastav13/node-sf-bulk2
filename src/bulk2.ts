import { Connection } from "./model/connection";
import axois, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { BulkQueryResponse } from './model/queryResponse';
import { QueryInput } from './model/queryInput';
import { BulkJobInfoResponse } from "./model/bulkJobInfoResponse";
import { AllBulkQueryJobsInfoResponse } from "./model/allBulkQueryJobsInfoResponse";
import { BulkQueryConfig } from './model/bulkQueryConfig';

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
        return new Promise<BulkQueryResponse>((resolve: (arg0: BulkQueryResponse) => void) => {
            resolve(queryResponse);
        });
    }

    public async getBulkQueryJobInfo(jobId: string): Promise<BulkJobInfoResponse> {
        const endpoint = this.endpoint + '/query/' + jobId;
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        const queryResponse = axiosresponse.data as BulkJobInfoResponse;
        return new Promise<BulkJobInfoResponse>((resolve: (arg0: BulkJobInfoResponse) => void) => {
            resolve(queryResponse);
        });
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
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json','application/json');
        const axiosresponse: AxiosResponse = await axois.get(endpoint, requestConfig);
        const queryResponse = axiosresponse.data as AllBulkQueryJobsInfoResponse;
        return new Promise<AllBulkQueryJobsInfoResponse>((resolve: (arg0: AllBulkQueryJobsInfoResponse) => void) => {
            resolve(queryResponse);
        });
    }

    public async abortbulkQueryJob(jobId: string): Promise<BulkQueryResponse> {
        const endpoint = this.endpoint + '/query/' + jobId;
        const requestConfig: AxiosRequestConfig = this.getRequestConfig('application/json', 'application/json');
        const body = JSON.stringify({
            state: 'Aborted'
        });
        const axiosresponse: AxiosResponse = await axois.patch(endpoint, body, requestConfig);
        const queryResponse = axiosresponse.data as BulkJobInfoResponse;
        return new Promise<BulkJobInfoResponse>((resolve: (arg0: BulkJobInfoResponse) => void) => {
            resolve(queryResponse);
        });
    }

    public async getBulkqueryResults(jobId: string, locator?: number, maxRecords?: number): Promise<string> {
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
        const queryResponse = axiosresponse.data;
        return new Promise<string>((resolve: (arg0: string) => void) => {
            resolve(queryResponse);
        });
    }
}