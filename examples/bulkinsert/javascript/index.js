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