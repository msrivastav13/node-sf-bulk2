import { AllBulkQueryJobsInfoResponse } from "./model/allBulkQueryJobsInfoResponse";
import { BulkJobInfoResponse } from "./model/bulkJobInfoResponse";
import { BulkQueryResponse } from "./model/queryResponse";
import { BulkQueryConfig } from "./model/bulkQueryConfig";
import { Connection } from "./model/connection";
import { CONTENTTYPE, COLUMNDELIMITER, LINEENDING, OPERATION, STATE, RESULTTYPE } from "./model/enum";
import { QueryInput } from "./model/queryInput";
import {JobUploadRequest} from "./model/jobUploadRequest";
import {JobUploadResponse} from "./model/jobUploadResponse";
import {JobInfoResponse} from "./model/jobInfoResponse";

export {
  AllBulkQueryJobsInfoResponse,
  BulkJobInfoResponse,
  BulkQueryResponse,
  BulkQueryConfig,
  Connection as BulkAPI2Connection,
  CONTENTTYPE,
  COLUMNDELIMITER,
  JobUploadRequest,
  JobUploadResponse,
  JobInfoResponse,
  LINEENDING,
  OPERATION,
  QueryInput,
  RESULTTYPE,
  STATE
};

export { default as BulkAPI2} from './bulk2';
