import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CdkStack } from '../lib/cdk-stack';

// Basic test for CDK stack creation
test('CDK Stack Creates Successfully', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkStack(app, 'TestStack');
  // THEN
  const template = Template.fromStack(stack);

  // Verify DynamoDB table exists
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    BillingMode: 'PAY_PER_REQUEST'
  });
});
