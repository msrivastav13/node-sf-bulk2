import { AllBulkQueryJobsInfoResponse } from "./model/allBulkQueryJobsInfoResponse";
import { AllIngestJobsInfoResponse } from "./model/allIngestJobsInfoResponse";
import { BulkJobInfoResponse } from "./model/bulkJobInfoResponse";
import { BulkQueryResponse } from "./model/queryResponse";
import { BulkQueryConfig } from "./model/bulkQueryConfig";
import { Connection } from "./model/connection";
import { CONTENTTYPE, COLUMNDELIMITER, LINEENDING, OPERATION, STATE, RESULTTYPE, JOBTYPE } from "./model/enum";
import { IngestJobConfig } from "./model/ingestJobConfig";
import { QueryInput } from "./model/queryInput";
import {JobUploadRequest} from "./model/jobUploadRequest";
import {JobUploadResponse} from "./model/jobUploadResponse";
import {JobInfoResponse} from "./model/jobInfoResponse";
import { ResultPage, ParallelQueryResultsResponse } from "./model/parallelQueryResultsResponse";

export {
  AllBulkQueryJobsInfoResponse,
  AllIngestJobsInfoResponse,
  BulkJobInfoResponse,
  BulkQueryResponse,
  BulkQueryConfig,
  Connection as BulkAPI2Connection,
  CONTENTTYPE,
  COLUMNDELIMITER,
  IngestJobConfig,
  JobUploadRequest,
  JobUploadResponse,
  JobInfoResponse,
  JOBTYPE,
  LINEENDING,
  OPERATION,
  ParallelQueryResultsResponse,
  QueryInput,
  ResultPage,
  RESULTTYPE,
  STATE
};

export { default as BulkAPI2} from './bulk2';
