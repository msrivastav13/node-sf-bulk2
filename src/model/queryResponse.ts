export interface BulkQueryResponse {
    id :string,
    operation: string,
    object: string,
    createdById: string,
    createdDate: string,
    systemModstamp: string
    state: string
    concurrencyMode: string
    contentType: string
    apiVersion: string
    lineEnding: string
    columnDelimiter: string
}