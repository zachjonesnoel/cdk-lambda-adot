// const { trace } = require('@opentelemetry/api');

exports.handler = async (event) => {
    // const tracer = trace.getTracer('greeting-lambda');
    // const span = tracer.startSpan('greeting-lambda-handler');
    
    try {
        // span.setAttribute('lambda.environment', process.env.ENVIRONMENT);
        // span.setAttribute('context', 'greeting-lambda');
        // span.setAttribute('hop', 'hop-2');
        
        // Simulate a non-critical error that doesn't affect the response
        const error = new Error('Non-critical error in greeting Lambda - operation still succeeded');
        // Log error to CloudWatch for traditional logging
        console.error('Error occurred but continuing execution:', error);
        
        // Record the error in OpenTelemetry span without failing the request
        // span.recordException(error);
        // Add custom attributes to provide context about the error
        // span.setAttribute('error.occurred', 'true');
        // span.setAttribute('error.type', 'non_critical');
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Greetings from Lambda! Environment: ${process.env.ENVIRONMENT}`,
                time: new Date().toISOString(),
                note: 'Operation completed successfully despite internal error'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } finally {
        // span.end();
    }
}