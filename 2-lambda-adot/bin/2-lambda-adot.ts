#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { OtelAdotStack } from '../lib/2-lambda-adot-stack';

const app = new cdk.App();

// Get environment context or use defaults
const environment = app.node.tryGetContext('environment') || 'development';
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;

// Create stack with environment-specific name
new OtelAdotStack(app, `NRLambdaWorkshop-ADOT`, {
  env: { 
    account: account, 
    region: region
  },
  description: `OpenTelemetry Lambda with ADOT - ${environment} environment`,
  // Add stack tags for better resource management
  tags: {
    Environment: environment,
    Project: 'NRLambdaWorkshop',
    ManagedBy: 'CDK',
    Workshop: "AWS CDK ADOT Workshop",
  }
});

// Log deployment information
console.log(`Deploying NRLambdaWorkshop to ${environment} environment in ${region}`);
