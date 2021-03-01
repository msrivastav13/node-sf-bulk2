import { CONTENTTYPE, COLUMNDELIMITER, LINEENDING } from './enum'
export interface QueryInput {
    operation: string,
    query: string,
    contentType?: CONTENTTYPE
    columnDelimiter?: COLUMNDELIMITER,
    lineEnding?: LINEENDING
}