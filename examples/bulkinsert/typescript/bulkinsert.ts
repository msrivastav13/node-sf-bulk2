import jsforce from 'jsforce';
import { BulkAPI2 } from 'node-sf-bulk2';
import { BulkAPI2Connection, JobUploadRequest, JobUploadResponse, OPERATION } from 'node-sf-bulk2';

async function createDataUploadJob() : Promise<JobUploadResponse | undefined> {
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
            const jobRequest: JobUploadRequest = {
                'object': 'Account',
                'operation': OPERATION[0]
            };
            const response : JobUploadResponse = await bulkapi2.createDataUploadJob(jobRequest);
            return response;
        } catch (ex) {
            console.log(ex.response.data[0].errorCode);
            console.log(ex.response.data[0].message);
        }
    } else {
        throw 'set environment variable with your orgs username and password'
    }
}

(async () => {
    const response = await createDataUploadJob();
    console.log(response);
})();


