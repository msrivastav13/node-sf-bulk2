export enum CONTENTTYPE {
    "CSV"
}

export enum COLUMNDELIMITER {
    "BACKQUOTE",
    "CARET",
    "COMMA",
    "PIPE",
    "SEMICOLON",
    "TAB"
}

export enum LINEENDING {
    "LF",
    "CRLF"
}

export enum OPERATION {
    "insert",
    "delete",
    "hardDelete",
    "update",
    "upsert",
    "query",
    "queryAll"
}

export enum STATE {
    "Open",
    "UploadComplete",
    "Aborted",
    "JobComplete",
    "Failed",
    "InProgress"
}

export enum RESULTTYPE {
    "successfulResults",
    "failedResults",
    "unprocessedrecords"
}

export enum JOBTYPE {
    "BigObjectIngest",
    "Classic",
    "V2Ingest",
    "V2Query"
}