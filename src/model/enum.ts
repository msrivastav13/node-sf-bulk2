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
    "upsert"
}

export enum STATE {
    "Open",
    "UploadComplete",
    "Aborted",
    "JobComplete",
    "Failed"
}

export enum RESULTTYPE {
    "successfulResults",
    "failedResults",
    "unprocessedrecords"
}