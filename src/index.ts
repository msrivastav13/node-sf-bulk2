import { AllBulkQueryJobsInfoResponse } from "./model/allBulkQueryJobsInfoResponse";
import { BulkJobInfoResponse } from "./model/bulkJobInfoResponse";
import { BulkQueryResponse } from "./model/queryResponse";
import { BulkQueryConfig } from "./model/bulkQueryConfig";
import { Connection } from "./model/connection";
import { CONTENTTYPE, COLUMNDELIMITER, LINEENDING } from "./model/enum";
import { QueryInput } from "./model/queryInput";

export {
  AllBulkQueryJobsInfoResponse,
  BulkJobInfoResponse,
  BulkQueryResponse,
  BulkQueryConfig,
  Connection as BulkAPI2Connection,
  CONTENTTYPE,
  COLUMNDELIMITER,
  LINEENDING,
  QueryInput,
};

export { default as BulkAPI2} from './bulk2';
