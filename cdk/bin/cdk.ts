#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MyStack } from "../lib/cdk-stack";

const app = new cdk.App();

// Use environment variables for account and region
new MyStack(app, "MyStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: "us-east-1",
  },
});
