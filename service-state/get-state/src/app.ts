const AWS = require('aws-sdk');

module.exports.handler = async (event) => {

    console.log("Validating input")

    for (const param of ['bucket', 'key']) {
        if (!event.queryStringParameters || !event.queryStringParameters[param]) {
            const error = `Query parameters missing required parameter '${param}'`

            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: error,
            }
        }
    }

    console.log("Parsing params")

    const bucket = event.queryStringParameters['bucket']
    const key = event.queryStringParameters['key']

    try {
        console.log("Instantiating S3 client")
        const s3 = new AWS.S3();
        const params = {
            Bucket : bucket,
            Key : key
        }

        console.log("Getting S3 object using params:", params)
        const state = await s3.getObject(params).promise();

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
            body: e.message(),
        }
    }
}
