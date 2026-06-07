export interface ResultChunk {
    resultLink: string;
}

export interface ParallelQueryResultsResponse {
    resultChunks: ResultChunk[];
    nextRecordsUrl: string | null;
    done: boolean;
}
