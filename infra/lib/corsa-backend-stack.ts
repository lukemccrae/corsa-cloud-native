import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class CorsaBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table for storing metadata for geoJSON track
    const trackMetadataTable = new dynamodb.Table(this, 'TrackMetadataTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    const geoJsonBucket = new s3.Bucket(this, 'geoJsonBucket')

    // when a new item is added to the bucket trigger an event and write metadata to dynamo
    // metadata will be passed along with the file which will be retrieved from the activity
    // this should include name, date, distance

    // Create a GraphQL API
    const api = new appsync.GraphqlApi(this, 'CorsaGraphAPI', {
      name: 'corsa-graphql-api',
      schema: appsync.SchemaFile.fromAsset('infra/graphql/schema.graphql'), // Replace with the path to your GraphQL schema file

      // I dont want to include this yet
      // I can develop with my own strava credentials in an ENV
      // authorizationConfig: {
      //   defaultAuthorization: {
      //     authorizationType: appsync.AuthorizationType.API_KEY,
      //     apiKeyConfig: {
      //       expires: cdk.Expiration.after(cdk.Duration.days(365)),
      //     },
      //   },
      // },
    });

    // Create a Lambda function for the Query resolver
    // This query resolver will handle reading records from the metadata table
    const queryResolver = new lambda.Function(this, 'QueryResolver', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'query-resolver.handler', 
      code: lambda.Code.fromAsset('src/lambdas/queryResolver/dist'),
      environment: {
        DYNAMODB_TABLE_NAME: trackMetadataTable.tableName,
      },
    });

    // Grant Lambda permissions to access metadata table
    trackMetadataTable.grantReadWriteData(queryResolver);

    // Create a Lambda function for the Mutation resolver
    // This mutation resolver will handle updating records on the metadata table
    const mutationResolver = new lambda.Function(this, 'MutationResolver', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'mutation-resolver.handler',
      code: lambda.Code.fromAsset('src/lambdas/mutationResolver/dist'),
      environment: {
        DYNAMODB_TABLE_NAME: trackMetadataTable.tableName,
      },
    });

    // Grant Lambda permissions to access the DynamoDB table
    trackMetadataTable.grantReadWriteData(mutationResolver);

    // TODO: what is this output doing? i dont remember having this before

    // Output the GraphQL API endpoint
    new cdk.CfnOutput(this, 'GraphQLApiEndpoint', {
      value: api.graphqlUrl,
    });
  }
}
