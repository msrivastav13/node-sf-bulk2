import { BulkQueryResponse } from "./queryResponse";

export interface BulkJobInfoResponse extends BulkQueryResponse {
    numberRecordsProcessed : number,
    retries: number,
    totalProcessingTime: number
}