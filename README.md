# Node-SF-BULK2

This is a node library to work with the [Salesforce Bulk API 2.0](https://developer.salesforce.com/docs/atlas.en-us.230.0.api_asynch.meta/api_bulk_v2/asynch_api_intro.htm).

You can use this library in combination with Salesforce CLI or any other library (like [jsforce](https://jsforce.github.io/document/) or [@salesforce/sf-core](https://github.com/forcedotcom/sfdx-core)) that handles authentication.

## TypeScript compatible

The library is built using [TypeScript 4.0](https://www.typescriptlang.org/) and provides typescript definitions to make it easier to use in Node.js projects using TypeScript

# Installation

`npm install node-sf-bulk2`

# Usage

See the [API Documentation](https://msrivastav13.github.io/node-sf-bulk2/modules.html)

## Example usage

See [examples folder](/examples) for Typescript and JavaScript sample code on how to use this library

### TypeScript example using jsforce

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
### JavaScript example using jsforce

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