import { BulkQueryResponse } from "./queryResponse";

export interface AllBulkQueryJobsInfoResponse {
    done : boolean,
    records : BulkQueryResponse[],
    nextRecordsUrl : string
}