#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { TestStack } from "../lib/cdk-stack";

const app = new cdk.App();

// Use environment variables for account and region
new TestStack(app, "TestStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
