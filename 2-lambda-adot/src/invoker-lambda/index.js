// const { trace } = require('@opentelemetry/api');

exports.handler = async (event) => {
    // const tracer = trace.getTracer('invoker-lambda');
    // const span = tracer.startSpan('invoker-lambda-handler');
    
    try {
        // span.setAttribute('lambda.environment', process.env.ENVIRONMENT);
        // span.setAttribute('context', 'invoker-lambda');
        // span.setAttribute('hop', 'hop-1');

        console.log('Event: ', event);

        let responseBody = JSON.stringify({
            message: `Hello from Invoker Lambda! Environment: ${process.env.ENVIRONMENT}`,
            time: new Date().toISOString()
        });

        // Make a call to the external API
        let response;
        try {
            response = await fetch(process.env.GREETING_API_ENDPOINT);
            console.log('Response from external API: ', response);

            const data = await response.json();
            console.log('Response from external API: ', data);
            responseBody = JSON.stringify(data);
        } catch (e) {
            console.log('Error: ', e);
            // span.recordException(e);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Error fetching data from external API',
                    error: e.message
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        return {
            statusCode: 200,
            body: responseBody,
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } finally {
        // span.end();
    }
}
