import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // tables
    const employeeTable = dynamodb.Table.fromTableName(this, "Employee", "Employee");

    // s3 bucket
    const bucket = new s3.Bucket(this, "EmployeeDataBucket", {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // lambdas
    const getEmployeeLambda = new lambda.Function(this, 'GetEmployeeLambda', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'lambda/get-employee.handler',
      code: lambda.Code.fromAsset('dist/src'),
      environment: { TABLE_NAME: employeeTable.tableName }
    });
    employeeTable.grantReadData(getEmployeeLambda);

    const putEmployeesLambda = new lambda.Function(this, "InsertLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "lambda/put-employees.handler",
      code: lambda.Code.fromAsset("dist/src"),
      environment: {
        TABLE_NAME: employeeTable.tableName,
        PRIMARY_KEY: "EmployeeID",
      },
    });
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

    // API
    const api = new apigateway.RestApi(this, 'employee-api', {
      restApiName: 'employee-api',
      description: 'API for accessing employee information'
    });

    const employees = api.root.addResource('employees');

    const employeeID = employees.addResource('{employeeId}');
    employeeID.addMethod('GET', new apigateway.LambdaIntegration(getEmployeeLambda));


  }
}