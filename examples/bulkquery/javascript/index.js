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

submitBulkQueryJob();