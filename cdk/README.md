## CDK Stack Development Setup

* In the AWS console, navigate to your user in IAM > Users. In the security credentials tab, create an access key.
* Run `aws configure` in the terminal and use the newly generated key information. Make sure region is `us-east-2`.
* Navigate to `cdk`.
* Run `npm install`.
* To push any changes to the stack to AWS, first run `npm run build`. This will update the Javascript files. Then run `cdk deploy` to deploy the new stack to AWS.
* Each stack is identified by its name, which is defined in the stack constructor at `cdk/bin/cdk.ts`. For testing purposes, a separate stack can be created by changing the stack's name and deploying it.
