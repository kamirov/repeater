module.exports.handler = async (event) => {
    try {
        const state = {
            hello: "world"
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(state),
        }
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
