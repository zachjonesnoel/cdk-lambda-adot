exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Greetings from Lambda! Environment: ${process.env.ENVIRONMENT}`,
            time: new Date().toISOString()
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
}