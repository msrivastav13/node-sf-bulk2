# Examples of using the `node-sf-bulk2` libraries using TypeScript

The example uses [jsforce](https://jsforce.github.io/) to authenticate.

The example shows how to create bulk job in Salesforce for data insert Salesforce using `node-sf-bulk2`

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

### Execute function in index.ts example file

In order to play with examples you will need to set username and password environment variables (password+securitytoken)

**For MACOSX use below**

`export username=<username>`

`export password=<password+securitytoken>`

**For Windows command line use below**

`set username=<username>`

`set password=<password+securitytoken>`

**For  Windows PowerShell set environment variables as shown below**

`$env:username="<username>"`

`$env:password="<password+securitytoken>"`

A simple way to run node command is `cd` into the project directory where you have `index.ts` and run `npx ts-node index.ts`

