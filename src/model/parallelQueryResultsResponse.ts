export interface ResultPage {
    resultUrl: string;
}

export interface ParallelQueryResultsResponse {
    resultPages: ResultPage[];
    nextRecordsUrl: string;
    done: boolean;
}
