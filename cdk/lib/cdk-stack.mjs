import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class CdkStack extends cdk.Stack {
  constructor(scope, id, props = {}) {
    super(scope, id, props);

    const table = dynamodb.Table.fromTableName(this, "EmployeeTable", "Employeee");

    const bucket = new s3.Bucket(this, "EmployeeDataBucket", {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    const insertLambda = new lambda.Function(this, "InsertLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
     code: lambda.Code.fromAsset("lambda/insert-api"),
      environment: {
        TABLE_NAME: "Employeee",
        PRIMARY_KEY: "EmployeeID",
      },
    });

    insertLambda.addPermission("AllowS3Invoke", {
      action: "lambda:InvokeFunction",
      principal: new cdk.aws_iam.ServicePrincipal("s3.amazonaws.com"),
      sourceArn: bucket.bucketArn,
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(insertLambda)
    );

    bucket.grantRead(insertLambda);
    table.grantReadWriteData(insertLambda);

    new cdk.CfnOutput(this, "BucketName", { value: bucket.bucketName });
    new cdk.CfnOutput(this, "TableName", { value: "Employeee" });
  }
}
