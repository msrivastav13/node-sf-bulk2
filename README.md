# Node-SF-BULK2

This is a node library to work with the [Salesforce Bulk API 2.0](https://developer.salesforce.com/docs/atlas.en-us.230.0.api_asynch.meta/api_bulk_v2/asynch_api_intro.htm).

You can use this library in combination with Salesforce CLI or any other library (like [jsforce](https://jsforce.github.io/document/) or [@salesforce/sf-core](https://github.com/forcedotcom/sfdx-core)) that handles authentication.

## TypeScript compatible

The library is built using [TypeScript 4.0](https://www.typescriptlang.org/) and provides typescript definitions to make it easier to use in Node.js projects using TypeScript

# Installation

`npm install node-sf-bulk2`

# Usage

See the [API Documentation](https://msrivastav13.github.io/node-sf-bulk2/index.html)

## Example usage

See [examples folder](/examples) for Typescript and JavaScript sample code on how to use this library

### TypeScript example using jsforce for Bulk Query

The below code shows how to use the library to submit bulk query request

```typescript
import jsforce from 'jsforce';
import { BulkAPI2 } from 'node-sf-bulk2';
import { BulkAPI2Connection, QueryInput } from 'node-sf-bulk2';

async function submitBulkQueryJob() {
    if (process.env.username && process.env.password) {
        const conn = new jsforce.Connection({});
        await conn.login(process.env.username, process.env.password);
        const bulkconnect: BulkAPI2Connection = {
            'accessToken': conn.accessToken,
            'apiVersion': '51.0',
            'instanceUrl': conn.instanceUrl
        };
        try {
            const bulkapi2 = new BulkAPI2(bulkconnect);
            const queryInput: QueryInput = {
                'query': 'Select Id from Account',
                'operation': 'query'
            };
            const response = await bulkapi2.submitBulkQueryJob(queryInput);
            return response;
        } catch (ex) {
            console.log(ex.response.data[0].errorCode);
            console.log(ex.response.data[0].message);
        }
    } else {
        throw 'set environment variable with your orgs username and password'
    }
}
// submit bulk query request
submitBulkQueryJob();
```
### JavaScript example using jsforce for Bulk Query

The below code shows how to use the library to submit bulk query request using node.js (uses commonjs modules)

```javascript
const jsforce = require('jsforce');
const sfbulk = require('node-sf-bulk2');

async function submitBulkQueryJob() {
    if (process.env.username && process.env.password) {
        const conn = new jsforce.Connection({});
        await conn.login(process.env.username, process.env.password);
        const bulkconnect = {
            'accessToken': conn.accessToken,
            'apiVersion': '51.0',
            'instanceUrl': conn.instanceUrl
        };
        try {
            const bulkapi2 = new sfbulk.BulkAPI2(bulkconnect);
            const queryInput = {
                'query': 'Select Id from Account',
                'operation': 'query'
            };
            const response = await bulkapi2.submitBulkQueryJob(queryInput);
            console.log(response);
        } catch (ex) {
            console.log(ex);
        }
    } else {
        throw 'set environment variable with your orgs username and password'
    }
}
// submit bulk query request
submitBulkQueryJob();
```

### TypeScript example for uploading data from local CSV file


This assumes you have local file `account.csv` in project workspace

```typescript
import jsforce from 'jsforce';
import { BulkAPI2 } from 'node-sf-bulk2';
import { BulkAPI2Connection, JobUploadRequest, JobUploadResponse, OPERATION, STATE } from 'node-sf-bulk2';
import * as fs from 'fs';
import { promisify } from "util";

class BulkInsert {
    async createDataUploadJob(bulkapi2: BulkAPI2): Promise<JobUploadResponse | undefined> {
        const jobRequest: JobUploadRequest = {
            'object': 'Account',
            'operation': OPERATION[0]
        };
        const response: JobUploadResponse = await bulkapi2.createDataUploadJob(jobRequest);
        return response;
    }
}
// anonymous function uploading data in CSV format to Salesforce using Bulk V2
 
(async () => {
    if (process.env.username && process.env.password) {
        // establish jsforce connection
        const conn = new jsforce.Connection({});
        await conn.login(process.env.username, process.env.password);
        // create a bulk connection object using jsforce connection
        const bulkconnect: BulkAPI2Connection = {
            'accessToken': conn.accessToken,
            'apiVersion': '51.0',
            'instanceUrl': conn.instanceUrl
        };
        try {
            // create a new BulkAPI2 class
            const bulkrequest = new BulkAPI2(bulkconnect);
            // create a bulk insert job
            const response: JobUploadResponse | undefined = await (new BulkInsert().createDataUploadJob(bulkrequest));
            if (response) {
                // read csv data from the local file system
                const data = await promisify(fs.readFile)(process.cwd() + "/account.csv", "UTF-8");
                const status: number = await bulkrequest.uploadJobData(response.contentUrl, data);
                if (status === 201) {
                    // close the job for processing
                    await bulkrequest.closeOrAbortJob(response.id, STATE[1]);
                }
            }
        } catch (ex) {
            console.log(ex.response.data[0].errorCode);
            console.log(ex.response.data[0].message);
        }
    } else {
        throw 'set environment variable with your orgs username and password'
    }
})();
```

### JavaScript example for uploading data from local CSV file


This assumes you have local file `account.csv` in project workspace

```javascript

const jsforce = require('jsforce');
const sfbulk = require('node-sf-bulk2');
const util = require('util');
const fs = require('fs');

(async () => {
    if (process.env.username && process.env.password) {
        const conn = new jsforce.Connection({});
        await conn.login(process.env.username, process.env.password);
        const bulkconnect = {
            'accessToken': conn.accessToken,
            'apiVersion': '51.0',
            'instanceUrl': conn.instanceUrl
        };
        try {
            // create a new BulkAPI2 class
            const bulkrequest = new sfbulk.BulkAPI2(bulkconnect);
            // create a bulk insert job
            const jobRequest = {
                'object': 'Account',
                'operation': 'insert'
            };
            const response = await bulkrequest.createDataUploadJob(jobRequest);
            if (response.id) {
                // read csv data from the local file system
                const data = await util.promisify(fs.readFile)(process.cwd() + "/account.csv", "UTF-8");
                const status = await bulkrequest.uploadJobData(response.contentUrl, data);
                if (status === 201) {
                    // close the job for processing
                    await bulkrequest.closeOrAbortJob(response.id, 'UploadComplete');
                }
            }
        } catch (ex) {
            console.log(ex);
        }
    } else {
        throw 'set environment variable with your orgs username and password'
    }
})();

```