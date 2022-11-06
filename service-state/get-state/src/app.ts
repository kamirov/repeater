const AWS = require('aws-sdk');

module.exports.handler = async (event) => {

    // TODO: Should bring this into an env var
    const bucket = 'mika-1-repeater-prod-service-state'

    const key = 'state'

    try {
        console.log("Instantiating S3 client")
        const s3 = new AWS.S3();
        const params = {
            Bucket : bucket,
            Key : key
        }

        console.log("Getting S3 object using params:", params)
        const s3Object = await s3.getObject(params).promise();
        const state = s3Object.Body.toString('utf-8');

        console.log("Returning state", state)

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: state,
        };

    } catch (e: any) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: e.message,
        }
    }
}
