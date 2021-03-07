import { BulkQueryResponse } from './queryResponse';
export interface JobUploadResponse extends BulkQueryResponse {
    assignmentRuleId : string,
    contentUrl : string,
    externalIdFieldName : string,
    jobType : string
}