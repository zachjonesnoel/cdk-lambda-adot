#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaAPIStack } from '../lib/1-lambda-cw-stack';

const app = new cdk.App();

// Get environment context or use defaults
const environment = app.node.tryGetContext('environment') || 'development';
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;

// Create stack with environment-specific name
new LambdaAPIStack(app, `NRLambdaWorkshop-CW`, {
  env: { 
    account: account, 
    region: region
  },
  description: `Lambda with CW - ${environment} environment`,
  // Add stack tags for better resource management
  tags: {
    Environment: environment,
    Project: 'NRLambdaWorksho',
    ManagedBy: 'CDK',
    Workshop: "AWS CDK Workshop",
  }
});

// Log deployment information
console.log(`Deploying NRLambdaWorkshop to ${environment} environment in ${region}`);
