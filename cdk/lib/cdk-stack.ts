import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const contactsTable = new dynamodb.Table(this, 'ContactsTable', {
      tableName: 'contacts-table',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development
    });

    // S3 Bucket for file uploads
    const uploadBucket = new s3.Bucket(this, 'UploadBucket', {
      bucketName: `contacts-upload-bucket-${this.account}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development
    });

    // Common Lambda configuration
    const lambdaConfig = {
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        CONTACTS_TABLE_NAME: contactsTable.tableName,
        UPLOAD_BUCKET_NAME: uploadBucket.bucketName,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
    };

    // GET API Lambda
    const getApiLambda = new lambda.Function(this, 'GetApiLambda', {
      ...lambdaConfig,
      functionName: 'contacts-get-api',
      code: lambda.Code.fromAsset('lambda/get-api'),
      handler: 'index.handler',
      description: 'GET API for retrieving contact data',
    });

    // Search API Lambda
    const searchApiLambda = new lambda.Function(this, 'SearchApiLambda', {
      ...lambdaConfig,
      functionName: 'contacts-search-api',
      code: lambda.Code.fromAsset('lambda/search-api'),
      handler: 'index.handler',
      description: 'Search API for querying contact data',
    });

    // Insert API Lambda
    const insertApiLambda = new lambda.Function(this, 'InsertApiLambda', {
      ...lambdaConfig,
      functionName: 'contacts-insert-api',
      code: lambda.Code.fromAsset('lambda/insert-api'),
      handler: 'index.handler',
      description: 'Insert API for S3-triggered data insertion',
    });

    // Grant DynamoDB permissions
    contactsTable.grantReadData(getApiLambda);
    contactsTable.grantReadData(searchApiLambda);
    contactsTable.grantWriteData(insertApiLambda);
    contactsTable.grantReadData(insertApiLambda); // May need to read existing data

    // Grant S3 permissions (only Insert API needs S3 access)
    uploadBucket.grantRead(insertApiLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'ContactsApi', {
      restApiName: 'Contacts API',
      description: 'API Gateway for Contacts application',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
      },
    });

    // API Gateway integrations
    const getApiIntegration = new apigateway.LambdaIntegration(getApiLambda);
    const searchApiIntegration = new apigateway.LambdaIntegration(searchApiLambda);
    const insertApiIntegration = new apigateway.LambdaIntegration(insertApiLambda);

    // API Routes
    const v1 = api.root.addResource('api').addResource('v1');
    
    // GET API routes (accessible by frontend)
    const contacts = v1.addResource('contacts');
    contacts.addMethod('GET', getApiIntegration); // GET /api/v1/contacts
    contacts.addResource('{id}').addMethod('GET', getApiIntegration); // GET /api/v1/contacts/{id}

    // Search API routes (accessible by frontend)
    const search = v1.addResource('search');
    search.addResource('contacts').addMethod('GET', searchApiIntegration); // GET /api/v1/search/contacts
    search.addResource('advanced').addMethod('POST', searchApiIntegration); // POST /api/v1/search/advanced

    // Insert API routes (S3 triggered only - separate path)
    const insert = v1.addResource('insert');
    insert.addResource('contacts').addMethod('POST', insertApiIntegration);
    insert.addResource('directory').addMethod('POST', insertApiIntegration);
    insert.addResource('process-s3-upload').addMethod('POST', insertApiIntegration);

    // Health check endpoints for all APIs
    api.root.addResource('health').addMethod('GET', getApiIntegration);

    // Outputs
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'ContactsTableName', {
      value: contactsTable.tableName,
      description: 'DynamoDB Contacts Table Name',
    });

    new cdk.CfnOutput(this, 'UploadBucketName', {
      value: uploadBucket.bucketName,
      description: 'S3 Upload Bucket Name',
    });
  }
}