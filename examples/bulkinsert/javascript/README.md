# Examples of using the node-sf-bulk2 libraries using Node.js Common JS Module

The example uses [jsforce](https://jsforce.github.io/) to authenticate.

The example shows how to insert data into Salesforce using bulk api of salesforce

```javascript

const jsforce = require('jsforce');
const sfbulk = require('node-sf-bulk2');
const util = require('util');
const fs = require('fs');

(async () => {
    if (process.env.username && process.env.password) {
        // connect to Salesforce Using JSforce
        const conn = new jsforce.Connection({});
        await conn.login(process.env.username, process.env.password);
        // create bulk connect object
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
### Execute function in index.js example file

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


A simple way to run node command is `cd` into the project directory where you have `index.js` and run `node index.js`