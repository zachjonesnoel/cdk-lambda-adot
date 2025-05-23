import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import * as path from 'path';

export class NRLambdaWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Get context variables with defaults
    const environment = this.node.tryGetContext('environment') || 'development';
    const serviceName = this.node.tryGetContext('serviceName') || 'Node-Lambda-NR-Workshop';
    const nrLicenseKey = this.node.tryGetContext('nrLicenseKey') || 'MISSING_LICENSE_KEY';
    const nrAccountID = this.node.tryGetContext('nrAccountID') || 'MISSING_ACCOUNT_ID';
    const nrLayerArn = this.node.tryGetContext('adotLayerVersion') || 'arn:aws:lambda:us-east-1:451483290750:layer:NewRelicNodeJS22X:22';
    // Uncomment the below line to use New Relic Lambda Extension and Lambda Layer along with enviornment variables
    // let NRLayer = lambda.LayerVersion.fromLayerVersionArn(
    //     this,
    //     'NRLayer',
    //     nrLayerArn
    //   )
    // Create a simple Lambda function with API Gateway integration that returns a greeting message
    const greetingLambda = new lambda.Function(this, 'GreetingLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/greeting-lambda')),
      handler: "newrelic-lambda-wrapper.handler",
      architecture: lambda.Architecture.X86_64,
      environment: {
        ENVIRONMENT: environment,
        SERVICE_NAME: serviceName,
        // NEW_RELIC_ACCOUNT_ID: nrAccountID,
        // NEW_RELIC_LAMBDA_HANDLER: 'greeting.handler',
        // NEW_RELIC_LICENSE_KEY: nrLicenseKey,
        // NEW_RELIC_EXTENSION_LOG_LEVEL: "DEBUG",
        // NEW_RELIC_EXTENSION_SEND_EXTENSION_LOGS: "true",
        // NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS: "true",
        // NEW_RELIC_EXTENSION_LOGS_ENABLED: "true",
        // NEW_RELIC_COLLECT_TRACE_ID: "true",
        // NEW_RELIC_DISTRIBUTED_TRACING_ENABLED: "true",
      },
      description: `Greeting Lambda function for ${serviceName} in ${environment} environment`,
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
      // layers: [NRLayer],
    });

    const greetinglambdaIntegration = new apigatewayv2_integrations.HttpLambdaIntegration('GreetingIntegration', greetingLambda)

    // Create an API Gateway HTTP API
    const greetingApi = new apigatewayv2.HttpApi(this, 'GreetingHandler', {
      apiName: `${serviceName}-GreetingAPI-${environment}`,
      description: `Greeting API Gateway for ${serviceName} in ${environment} environment`,
      defaultIntegration: greetinglambdaIntegration,
    });

    // Add a root path to the API
    greetingApi.addRoutes({
      path: '/',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: greetinglambdaIntegration
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'GreetingApiUrl', {
      value: greetingApi.apiEndpoint,
      description: 'Greeting API Gateway endpoint URL',
      exportName: `${id}-GreetingApiEndpoint`
    });
    // Output the environment
    new cdk.CfnOutput(this, 'GreetingEnvironment', {
      value: environment,
      description: 'Greeting Lambda deployment environment',
      exportName: `${id}-GreetingEnvironment`
    });
    // Output the service name
    new cdk.CfnOutput(this, 'GreetingServiceName', {
      value: serviceName,
      description: 'Greeting Lambda service name used for telemetry',
      exportName: `${id}-GreetingServiceName`
    });
    // Uncomment the line 93-101 and 105 to use New Relic Lambda Extension and Lambda Layer along with enviornment variables
    const HelloLambdaFunction = new lambda.Function(this, 'HelloLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../src/invoker-lambda')),
      handler: "newrelic-lambda-wrapper.handler",
      architecture: lambda.Architecture.X86_64,
      environment: {
        ENVIRONMENT: environment,
        GREETING_API_ENDPOINT: greetingApi.apiEndpoint,
        // NEW_RELIC_ACCOUNT_ID: nrAccountID,
        // NEW_RELIC_LAMBDA_HANDLER: 'index.handler',
        // NEW_RELIC_LICENSE_KEY: nrLicenseKey,
        // NEW_RELIC_EXTENSION_LOG_LEVEL: "DEBUG",
        // NEW_RELIC_EXTENSION_SEND_EXTENSION_LOGS: "true",
        // NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS: "true",
        // NEW_RELIC_EXTENSION_LOGS_ENABLED: "true",
        // NEW_RELIC_COLLECT_TRACE_ID: "true",
        // NEW_RELIC_DISTRIBUTED_TRACING_ENABLED: "true",
      },
      description: `Lambda function for ${serviceName} in ${environment} environment`,
      tracing: lambda.Tracing.ACTIVE,
      // layers: [NRLayer],
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
    });

    // Create HTTP API Gateway
    const lambdaIntegration = new apigatewayv2_integrations.HttpLambdaIntegration(
      'OtelAdotIntegration',
      HelloLambdaFunction
    );

    const httpApi = new apigatewayv2.HttpApi(this, 'OtelAdotHttpApi', {
      apiName: `${serviceName}-API-${environment}`,
      description: `HTTP API Gateway for ${serviceName} in ${environment} environment`,
      defaultIntegration: lambdaIntegration,
    });

    // Add root path
    httpApi.addRoutes({
      path: '/',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: lambdaIntegration
    });

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.apiEndpoint,
      description: 'HTTP API Gateway endpoint URL',
      exportName: `${id}-ApiEndpoint`
    });

    // Output the environment
    new cdk.CfnOutput(this, 'Environment', {
      value: environment,
      description: 'Deployment environment',
      exportName: `${id}-Environment`
    });

    // Output the service name
    new cdk.CfnOutput(this, 'ServiceName', {
      value: serviceName,
      description: 'Service name used for telemetry',
      exportName: `${id}-ServiceName`
    });

    new cdk.CfnOutput(this, 'HelloLambdaFunctionArn', {
      value: HelloLambdaFunction.functionArn,
      description: 'Hello Lambda function ARN',
      exportName: `${id}-HelloLambdaFunctionArn`
    });
    new cdk.CfnOutput(this, 'HelloLambdaFunctionName', {
      value: HelloLambdaFunction.functionName,
      description: 'Hello Lambda function name',
      exportName: `${id}-HelloLambdaFunctionName`
    });
    new cdk.CfnOutput(this, 'HelloLambdaFunctionIAM', {
      value: HelloLambdaFunction.role?.roleArn || 'No IAM role',
      description: 'Hello Lambda function IAM role ARN',
      exportName: `${id}-HelloLambdaFunctionIAM`
    });

    new cdk.CfnOutput(this, 'GreetingLambdaFunctionArn', {
      value: greetingLambda.functionArn,
      description: 'Greeting Lambda function ARN',
      exportName: `${id}-GreetingLambdaFunctionArn`
    });
    new cdk.CfnOutput(this, 'GreetingLambdaFunctionName', {
      value: greetingLambda.functionName,
      description: 'Greeting Lambda function name',
      exportName: `${id}-GreetingLambdaFunctionName`
    });
    new cdk.CfnOutput(this, 'GreetingLambdaFunctionIAM', {
      value: greetingLambda.role?.roleArn || 'No IAM role',
      description: 'Greeting Lambda function IAM role ARN',
      exportName: `${id}-GreetingLambdaFunctionIAM`
    });
    

    // Add tags to the Lambda function
    cdk.Tags.of(HelloLambdaFunction).add('Environment', environment);
    cdk.Tags.of(HelloLambdaFunction).add('ServiceName', serviceName);
    cdk.Tags.of(HelloLambdaFunction).add('Project', 'OtelAdotNR-Workshop');
    cdk.Tags.of(HelloLambdaFunction).add('ManagedBy', 'CDK');
    cdk.Tags.of(HelloLambdaFunction).add('Workshop', 'AWS CDK ADOT Workshop');
    // Add tags to the API Gateway
    cdk.Tags.of(httpApi).add('Environment', environment);
    cdk.Tags.of(httpApi).add('ServiceName', serviceName);
    cdk.Tags.of(httpApi).add('Project', 'OtelAdotNR-Workshop');
    cdk.Tags.of(httpApi).add('ManagedBy', 'CDK');
    cdk.Tags.of(httpApi).add('Workshop', 'AWS CDK ADOT Workshop');
    // Add tags to the greeting Lambda function
    cdk.Tags.of(greetingLambda).add('Environment', environment);
    cdk.Tags.of(greetingLambda).add('ServiceName', serviceName);
    cdk.Tags.of(greetingLambda).add('Project', 'OtelAdotNR-Workshop');
    cdk.Tags.of(greetingLambda).add('ManagedBy', 'CDK');
    cdk.Tags.of(greetingLambda).add('Workshop', 'AWS CDK ADOT Workshop');
    // Add tags to the greeting API Gateway
    cdk.Tags.of(greetingApi).add('Environment', environment);
    cdk.Tags.of(greetingApi).add('ServiceName', serviceName);
    cdk.Tags.of(greetingApi).add('Project', 'OtelAdotNR-Workshop');
    cdk.Tags.of(greetingApi).add('ManagedBy', 'CDK');
    cdk.Tags.of(greetingApi).add('Workshop', 'AWS CDK ADOT Workshop');
    // Add tags to the stack
    cdk.Tags.of(this).add('Environment', environment);
    cdk.Tags.of(this).add('ServiceName', serviceName);
    cdk.Tags.of(this).add('Project', 'OtelAdotNR-Workshop');
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
    cdk.Tags.of(this).add('Workshop', 'AWS CDK ADOT Workshop');

  }
}