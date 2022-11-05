const AWS = require('aws-sdk');

module.exports.handler = async (event) => {

    // TODO: Should bring this into an env var
    const bucket = 'mika-1-repeater-service-prod-service-state'

    const key = 'state'

    try {

        console.log("Parsing body")
        let body;
        if (event.body !== null && event.body !== undefined) {
            body = event.body
        }

        console.log("Instantiating S3 client")
        const s3 = new AWS.S3();
        const params = {
            Bucket : bucket,
            Key : key,
            Body: body,
            ContentType: 'application/json'
        }

        console.log("Getting S3 object using params:", params)
        const state = await s3.putObject(params).promise();

        console.log("Returning state", state)

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(state),
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
