import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // --- DynamoDB Table (use existing) ---
    const table = dynamodb.Table.fromTableName(
      this,
      "EmployeeTable",
      "Employeee" // ✅ Reference existing table, not create a new one
    );

    // --- S3 Bucket (Persistent) ---
    const bucket = new s3.Bucket(this, "EmployeeDataBucket", {
      removalPolicy: cdk.RemovalPolicy.RETAIN, // ✅ Keeps bucket across redeploys
      autoDeleteObjects: false,                // ✅ Prevents CloudFormation from emptying bucket
    });

    // --- Lambda Function ---
    const insertLambda = new lambda.Function(this, "InsertLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("lambda/insert-api/dist/insert-api"), // ✅ Ensure this folder exists
      environment: {
        TABLE_NAME: "Employeee",
        PRIMARY_KEY: "EmployeeID",
      },
    });

    // --- Allow S3 to invoke Lambda ---
    insertLambda.addPermission("AllowS3Invoke", {
      action: "lambda:InvokeFunction",
      principal: new cdk.aws_iam.ServicePrincipal("s3.amazonaws.com"),
      sourceArn: bucket.bucketArn,
    });

    // --- S3 Event → Lambda Trigger ---
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(insertLambda)
    );

    // --- Permissions ---
    bucket.grantRead(insertLambda);
    table.grantReadWriteData(insertLambda);

    // --- CloudFormation Outputs ---
    new cdk.CfnOutput(this, "BucketName", { value: bucket.bucketName });
    new cdk.CfnOutput(this, "TableName", { value: "Employeee" });
  }
}
