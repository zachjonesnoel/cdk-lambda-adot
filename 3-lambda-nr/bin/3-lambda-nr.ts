#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NRLambdaWorkshopStack } from '../lib/3-lambda-nr-stack';

const app = new cdk.App();

// Get environment context or use defaults
const environment = app.node.tryGetContext('environment') || 'development';
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;

// Create stack with environment-specific name
new NRLambdaWorkshopStack(app, `NRLambdaWorkshop-NR`, {
  env: { 
    account: account, 
    region: region
  },
  description: `NR Instrumented Lambda Fns - ${environment} environment`,
  // Add stack tags for better resource management
  tags: {
    Environment: environment,
    Project: 'NRLambdaWorkshop',
    ManagedBy: 'CDK',
    Workshop: "AWS CDK NR Workshop",
  }
});

// Log deployment information
console.log(`Deploying NRLambdaWorkshop to ${environment} environment in ${region}`);
