import { JobUploadResponse } from './jobUploadResponse';
export interface JobInfoResponse extends JobUploadResponse {
    apexProcessingTime: number,
    apiActiveProcessingTime: number,
    numberRecordsFailed: number,
    numberRecordsProcessed: number,
    retries: number,
    totalProcessingTime: number
}