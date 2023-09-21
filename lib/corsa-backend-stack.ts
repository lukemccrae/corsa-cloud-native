import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CorsaBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table
    const table = new dynamodb.Table(this, 'MyDynamoDBTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // WARNING: This will delete the table when the stack is deleted
    });

    // Create a GraphQL API
    const api = new appsync.GraphqlApi(this, 'MyGraphQLApi', {
      name: 'my-graphql-api',
      schema: appsync.SchemaFile.fromAsset('schema.graphql'), // Replace with the path to your GraphQL schema file
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
    });

    // Create a Lambda function for the Query resolver
    const queryResolver = new lambda.Function(this, 'QueryResolver', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'query-resolver.handler', // Replace with your query resolver code file
      code: lambda.Code.fromAsset('lambda'), // Replace with the directory containing your resolver code
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });

    // Grant Lambda permissions to access the DynamoDB table
    table.grantReadWriteData(queryResolver);

    // Create a Lambda function for the Mutation resolver
    const mutationResolver = new lambda.Function(this, 'MutationResolver', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'mutation-resolver.handler', // Replace with your mutation resolver code file
      code: lambda.Code.fromAsset('lambda'), // Replace with the directory containing your resolver code
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
    });

    // Grant Lambda permissions to access the DynamoDB table
    table.grantReadWriteData(mutationResolver);

    // Output the GraphQL API endpoint
    new cdk.CfnOutput(this, 'GraphQLApiEndpoint', {
      value: api.graphqlUrl,
    });
  }
}
