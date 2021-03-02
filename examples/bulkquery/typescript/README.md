# Examples of using the *node-sf-bulk2* libraries using TypeScript

The example uses [jsforce](https://jsforce.github.io/) to authenticate.

The example shows how to submit bulk query job to Salesforce using `node-sf-bulk2`

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
            console.log(response);
        } catch (ex) {
            console.log(ex.response.data[0].errorCode);
            console.log(ex.response.data[0].message);
        }
    } else {
        throw 'set environment variable with your orgs username and password'
    }
}

submitBulkQueryJob();
```

### Execute function in index.ts example file

A simple way to run node command is `cd` into the project directory where you have `index.ts` and run `npx ts-node index.ts`

