import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { Duration } from "aws-cdk-lib";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Cognito config (define early so it's available to all lambdas)
    const userPoolId = this.node.tryGetContext('userPoolId') || process.env.USER_POOL_ID || 'us-east-2_00owBPrPI';
    const userPoolClientId = this.node.tryGetContext('userPoolClientId') || process.env.USER_POOL_CLIENT_ID || '7a049gl2po684ffq0u70tq4tkb';

    // Reference existing User Pool
    const userPool = cognito.UserPool.fromUserPoolId(this, 'ExistingUserPool', userPoolId);

    const employeeTable = dynamodb.Table.fromTableName(this, "Employee", "Employee");

    const bucket = new s3.Bucket(this, "EmployeeDataBucket", {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    const imagesBucket = s3.Bucket.fromBucketName(this, "mployee-data-bucket", "mployee-data-bucket");

    // Pre Token Generation Lambda (adds email, groups, and employeeId to token)
    const preTokenGenerationLambda = new lambda.Function(this, 'PreTokenGeneration', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'lambda/pre-token-generation.handler',
      code: lambda.Code.fromAsset('dist/src'),
      environment: {
        TABLE_NAME: 'Employee',
        USER_POOL_ID: userPoolId,
      },
    });

    // Grant Cognito permission to invoke this Lambda
    preTokenGenerationLambda.addPermission('CognitoInvoke', {
      principal: new iam.ServicePrincipal('cognito-idp.amazonaws.com'),
      sourceArn: `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/${userPoolId}`,
    });

    // Grant DynamoDB read (for random employee assignment)
    employeeTable.grantReadData(preTokenGenerationLambda);

    // Grant permission to stamp custom:employeeId onto manually-added users
    preTokenGenerationLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['cognito-idp:AdminUpdateUserAttributes'],
      resources: [`arn:aws:cognito-idp:${this.region}:${this.account}:userpool/${userPoolId}`],
    }));

    // Automatically wire the pre-token generation trigger on the User Pool so
    // the ARN stays in sync after every CDK deployment (avoids AccessDeniedException
    // caused by Cognito still pointing at a stale Lambda ARN).
    const userPoolArn = `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/${userPoolId}`;
    const preTokenTriggerUpdate = new cr.AwsCustomResource(this, 'SetPreTokenTrigger', {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'updateUserPool',
        parameters: {
          UserPoolId: userPoolId,
          LambdaConfig: {
            PreTokenGenerationConfig: {
              LambdaArn: preTokenGenerationLambda.functionArn,
              LambdaVersion: 'V2_0',
            },
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of('SetPreTokenTrigger'),
      },
      onUpdate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'updateUserPool',
        parameters: {
          UserPoolId: userPoolId,
          LambdaConfig: {
            PreTokenGenerationConfig: {
              LambdaArn: preTokenGenerationLambda.functionArn,
              LambdaVersion: 'V2_0',
            },
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of('SetPreTokenTrigger'),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['cognito-idp:UpdateUserPool'],
          resources: [userPoolArn],
        }),
      ]),
    });
    // Ensure the Lambda permission exists before we register the trigger
    preTokenTriggerUpdate.node.addDependency(preTokenGenerationLambda);

    // Register custom:employeeId schema attribute on the User Pool (safe to re-run;
    // ignores InvalidParameterException which fires if the attribute already exists).
    new cr.AwsCustomResource(this, 'AddEmployeeIdAttribute', {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'addCustomAttributes',
        parameters: {
          UserPoolId: userPoolId,
          CustomAttributes: [{
            Name: 'employeeId',
            AttributeDataType: 'String',
            Mutable: true,
          }],
        },
        physicalResourceId: cr.PhysicalResourceId.of('AddEmployeeIdAttribute'),
        ignoreErrorCodesMatching: 'InvalidParameterException',
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['cognito-idp:AddCustomAttributes'],
          resources: [userPoolArn],
        }),
      ]),
    });
    const getEmployeeLambda = new lambda.Function(this, 'GetEmployeeLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'lambda/get-employee.handler',
      code: lambda.Code.fromAsset('dist/src'),
      environment: { 
        TABLE_NAME: employeeTable.tableName,
        USER_POOL_ID: userPoolId,
        USER_POOL_CLIENT_ID: userPoolClientId,
      }
    });
    employeeTable.grantReadData(getEmployeeLambda);
    imagesBucket.grantRead(getEmployeeLambda);

    const putEmployeesLambda = new lambda.Function(this, "InsertLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambda/put-employees.handler",
      code: lambda.Code.fromAsset("dist/src"),

      timeout: Duration.seconds(60),
      memorySize: 512,

      environment: {
        TABLE_NAME: employeeTable.tableName,
        PRIMARY_KEY: "EmployeeID",
      },
    });

    const getDepartmentsLambda = new lambda.Function(this, "GetDepartmentsLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambda/get-departments.handler",
      code: lambda.Code.fromAsset("dist/src"),

      timeout: Duration.seconds(60),

      environment: {
        TABLE_NAME: employeeTable.tableName,
      },
    });
    employeeTable.grantReadData(getDepartmentsLambda);

    const getDepartmentEmployeesLambda = new lambda.Function(this, 'GetDepartmentEmployeesLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambda/get-department-employees.handler",
      code: lambda.Code.fromAsset("dist/src"),

      timeout: Duration.seconds(60),

      environment: {
        TABLE_NAME: employeeTable.tableName,
      },
    })
    employeeTable.grantReadData(getDepartmentEmployeesLambda);

    putEmployeesLambda.addPermission("AllowS3Invoke", {
      action: "lambda:InvokeFunction",
      principal: new cdk.aws_iam.ServicePrincipal("s3.amazonaws.com"),
      sourceArn: bucket.bucketArn,
    });
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(putEmployeesLambda)
    );
    bucket.grantRead(putEmployeesLambda);
    employeeTable.grantReadWriteData(putEmployeesLambda);

    new cdk.CfnOutput(this, "BucketName", { value: bucket.bucketName });
    new cdk.CfnOutput(this, "TableName", { value: employeeTable.tableName });

    const searchEmployeesLambda = new lambda.Function(this, "SearchLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'lambda/search-employees.handler',
      code: lambda.Code.fromAsset('dist/src'),
      environment: { 
        TABLE_NAME: employeeTable.tableName,
        USER_POOL_ID: userPoolId,
        USER_POOL_CLIENT_ID: userPoolClientId,
      }
    });

    // Grant Query permission for GSIs
    searchEmployeesLambda.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          'dynamodb:Query',
          'dynamodb:GetItem',
        ],
        resources: [
          employeeTable.tableArn,
          `${employeeTable.tableArn}/index/*`, // All GSIs
        ],
      })
    );

    getDepartmentEmployeesLambda.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          'dynamodb:Query',
          'dynamodb:GetItem',
        ],
        resources: [
          employeeTable.tableArn,
          `${employeeTable.tableArn}/index/*`, // All GSIs
        ],
      })
    );

    // Create DLQ and main queue for invites
    const inviteDlq = new sqs.Queue(this, 'InviteDLQ', {
      queueName: `${this.stackName}-InviteDLQ`,
      retentionPeriod: cdk.Duration.days(14),
    });

    const inviteQueue = new sqs.Queue(this, 'InviteQueue', {
      queueName: `${this.stackName}-InviteQueue`,
      visibilityTimeout: cdk.Duration.seconds(120),
      retentionPeriod: cdk.Duration.days(4),
      deadLetterQueue: {
        queue: inviteDlq,
        maxReceiveCount: 5,
      },
    });

    // Give putEmployeesLambda permission to send messages to the queue
    inviteQueue.grantSendMessages(putEmployeesLambda);

    // Add invite queue URL to putEmployeesLambda environment
    putEmployeesLambda.addEnvironment('INVITE_QUEUE_URL', inviteQueue.queueUrl);

    // Create invite consumer lambda
    const inviteConsumerLambda = new lambda.Function(this, 'InviteConsumerLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'lambda/invite-consumer.handler',
      code: lambda.Code.fromAsset('dist/src'),
      environment: {
        USER_POOL_ID: userPoolId,
        SENDER_EMAIL: this.node.tryGetContext('senderEmail') || process.env.SENDER_EMAIL || 'noreply@orgbooksd.com',
        APP_URL: process.env.APP_URL || 'https://www.orgbooksd.com',
      },
      timeout: cdk.Duration.minutes(1),
    });

    // Wire the SQS queue as event source
    inviteConsumerLambda.addEventSource(new lambdaEventSources.SqsEventSource(inviteQueue, {
      batchSize: 1, // process one invite at a time for clarity and lower blast radius
      maxBatchingWindow: cdk.Duration.seconds(10),
    }));

    // Grant the consumer permission to consume messages
    inviteQueue.grantConsumeMessages(inviteConsumerLambda);

    // Grant the consumer Cognito & SES permissions (restrict resources where possible)
    inviteConsumerLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'cognito-idp:AdminCreateUser',
        'cognito-idp:AdminSetUserPassword',
        'cognito-idp:AdminAddUserToGroup',
      ],
      resources: [userPoolArn],
    }));

    // Grant SES permissions for both domain and email identity
    const domain = 'orgbooksd.com';
    const senderEmail = this.node.tryGetContext('senderEmail') || process.env.SENDER_EMAIL || 'noreply@orgbooksd.com';
    inviteConsumerLambda.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ses:SendEmail',
        'ses:SendRawEmail',
        'ses:SendTemplatedEmail',
      ],
      resources: [
        `arn:aws:ses:${this.region}:${this.account}:identity/${domain}`,
        `arn:aws:ses:${this.region}:${this.account}:identity/${senderEmail}`,
      ],
    }));

    // --------
    // API
    const api = new apigateway.RestApi(this, 'employee-api', {
      restApiName: 'employee-api',
      description: 'API for accessing employee information',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'EmployeeApiAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const authenticatedMethodOptions: apigateway.MethodOptions = {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: cognitoAuthorizer,
    };

    const employees = api.root.addResource('employees');
    const employeeID = employees.addResource('{employeeId}');
    employeeID.addMethod('GET', new apigateway.LambdaIntegration(getEmployeeLambda), authenticatedMethodOptions);
    const search = employees.addResource('search');
    search.addMethod('GET', new apigateway.LambdaIntegration(searchEmployeesLambda), authenticatedMethodOptions);
    const departments = api.root.addResource('departments');
    departments.addMethod('GET', new apigateway.LambdaIntegration(getDepartmentsLambda), authenticatedMethodOptions);
    const departmentName = departments.addResource('{departmentName}');
    departmentName.addMethod('GET', new apigateway.LambdaIntegration(getDepartmentEmployeesLambda), authenticatedMethodOptions);

    // ----------
    // CLOUDFRONT
    // Create S3 bucket for hosting the React app
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create Origin Access Identity for CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OAI",
      {
        comment: "OAI for website bucket",
      }
    );

    // Grant CloudFront read access to the bucket
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [websiteBucket.arnForObjects("*")],
        principals: [
          new iam.CanonicalUserPrincipal(
            originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // Create CloudFront distribution
    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
      ],
    });

    // Output the CloudFront URL
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
      description: "CloudFront Distribution Domain Name",
    });

    new cdk.CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
      description: "CloudFront Distribution ID",
    });

    new cdk.CfnOutput(this, "WebsiteBucketName", {
      value: websiteBucket.bucketName,
      description: "S3 Website Bucket Name",
    });

    // Invite Queue and Pre-token Generation Lambda outputs
    new cdk.CfnOutput(this, 'InviteQueueUrl', {
      value: inviteQueue.queueUrl,
      description: 'SQS Queue URL for employee invites',
    });

    new cdk.CfnOutput(this, 'PreTokenGenerationLambdaArn', {
      value: preTokenGenerationLambda.functionArn,
      description: 'ARN for Pre Token Generation Lambda (Cognito trigger is configured automatically by CDK)',
    });

    //-----------
  }
}