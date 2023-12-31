import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { type Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

export class CorsaBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a DynamoDB table for storing metadata for geoJSON track
    const trackMetadataTable = new dynamodb.Table(this, 'TrackMetadataTable', {
      partitionKey: {
        name: 'UserId',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'BucketKey',
        type: dynamodb.AttributeType.STRING
      }
    });

    const utilityApi = new apiGateway.RestApi(this, 'CorsaUtilityApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'https://58f8-70-59-19-22.ngrok-free.app',
          'http://localhost:3000'
        ],
        allowMethods: apiGateway.Cors.ALL_METHODS
      }
    });

    const utilityLambdaRole = new iam.Role(this, 'UtilityLambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    const gpxToGeoJsonLambda = new lambda.Function(this, 'gpxToGeoJsonLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambdas/gpxToGeoJsonLambda/dist'),
      role: utilityLambdaRole,
      timeout: cdk.Duration.seconds(10)
    });

    const resource = utilityApi.root.addResource('gpx-geojson');

    resource.addMethod(
      'POST',
      new apiGateway.LambdaIntegration(gpxToGeoJsonLambda)
    );

    const geoJsonBucket = new s3.Bucket(this, 'geoJsonBucket');

    // when a new item is added to the bucket trigger an event and write metadata to dynamo
    // metadata will be passed along with the file which will be retrieved from the activity
    // this should include name, date, distance

    // Create a GraphQL API
    const api = new appsync.GraphqlApi(this, 'CorsaGraphAPI', {
      name: 'corsa-graphql-api',
      schema: appsync.SchemaFile.fromAsset('infra/graphql/schema.graphql') // Replace with the path to your GraphQL schema file

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

    const cloudWatchLogsPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents'
          ],
          resources: ['*'] // Adjust this to limit resources as needed
        })
      ]
    });

    const cloudwatchPolicy = new iam.Policy(this, 'CloudWatchLogsPolicy', {
      document: cloudWatchLogsPolicy
    });

    // Attach the policy to your role
    const queryLambdaRole = new iam.Role(this, 'QueryLambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    // Attach the policy to your role
    const mutationLambdaRole = new iam.Role(
      this,
      'MutationLambdaExecutionRole',
      {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
      }
    );

    // Create a Lambda function for the Query resolver
    // This query resolver will handle reading records from the metadata table
    const queryResolverLambda = new lambda.Function(
      this,
      'QueryResolverLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('src/lambdas/queryResolverLambda/dist'),
        role: queryLambdaRole,
        environment: {
          DYNAMODB_TABLE_NAME: trackMetadataTable.tableName,
          GEO_JSON_BUCKET_NAME: geoJsonBucket.bucketName
        }
      }
    );

    // Create a Lambda function for the Mutation resolver
    // This mutation resolver will handle updating records on the metadata table
    const mutationResolverLambda = new lambda.Function(
      this,
      'MutationResolverLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('src/lambdas/mutationResolverLambda/dist'),
        role: mutationLambdaRole,
        timeout: Duration.seconds(15),
        environment: {
          DYNAMODB_TABLE_NAME: trackMetadataTable.tableName,
          GEO_JSON_BUCKET_NAME: geoJsonBucket.bucketName
        }
      }
    );

    // permissions
    queryLambdaRole.attachInlinePolicy(cloudwatchPolicy);
    mutationLambdaRole.attachInlinePolicy(cloudwatchPolicy);
    utilityLambdaRole.attachInlinePolicy(cloudwatchPolicy);

    geoJsonBucket.grantRead(queryLambdaRole);

    geoJsonBucket.grantReadWrite(mutationLambdaRole);

    trackMetadataTable.grantReadData(queryResolverLambda);
    trackMetadataTable.grantReadWriteData(mutationResolverLambda);

    const userIdDynamoPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:BatchGetItem'],
      resources: [`${trackMetadataTable.tableArn}/UserId`]
    });

    queryLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [geoJsonBucket.bucketArn]
      })
    );

    queryLambdaRole.addToPolicy(userIdDynamoPolicy);

    const queryDataSource = api.addLambdaDataSource(
      'QueryDataSource',
      queryResolverLambda
    );
    const mutationDataSource = api.addLambdaDataSource(
      'MutationDataSource',
      mutationResolverLambda
    );

    queryDataSource.createResolver('getActivityById', {
      typeName: 'Query',
      fieldName: 'getActivityById'
    });

    queryDataSource.createResolver('getActivities', {
      typeName: 'Query',
      fieldName: 'getActivities'
    });

    queryDataSource.createResolver('getPlansByUserId', {
      typeName: 'Query',
      fieldName: 'getPlansByUserId'
    });

    queryDataSource.createResolver('getGeoJsonBySortKey', {
      typeName: 'Query',
      fieldName: 'getGeoJsonBySortKey'
    });

    mutationDataSource.createResolver('createPlanFromActivity', {
      typeName: 'Mutation',
      fieldName: 'createPlanFromActivity'
    });

    mutationDataSource.createResolver('deletePlanById', {
      typeName: 'Mutation',
      fieldName: 'deletePlanById'
    });

    mutationDataSource.createResolver('createPlanFromGeoJson', {
      typeName: 'Mutation',
      fieldName: 'createPlanFromGeoJson'
    });

    mutationDataSource.createResolver('updatePlanById', {
      typeName: 'Mutation',
      fieldName: 'updatePlanById'
    });

    // TODO: what is this output doing? i dont remember having this before

    // Output the GraphQL API endpoint
    // new cdk.CfnOutput(this, 'GraphQLApiEndpoint', {
    //   value: api.graphqlUrl
    // })
  }
}
