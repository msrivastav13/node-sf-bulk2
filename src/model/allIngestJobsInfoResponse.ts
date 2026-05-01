import { JobUploadResponse } from './jobUploadResponse';

export interface AllIngestJobsInfoResponse {
    done: boolean;
    records: JobUploadResponse[];
    nextRecordsUrl: string;
}
