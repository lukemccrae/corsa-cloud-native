import * as cdk from 'aws-cdk-lib'
import * as appsync from 'aws-cdk-lib/aws-appsync'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications'
// import * as s3 from 'aws-cdk-lib/aws-s3'
import * as iam from 'aws-cdk-lib/aws-iam'
import { type Construct } from 'constructs'

export class CorsaBackendStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Create a DynamoDB table for storing metadata for geoJSON track
    const trackMetadataTable = new dynamodb.Table(this, 'TrackMetadataTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      }
    })

    const geoJsonBucket = new s3.Bucket(this, 'geoJsonBucket')

    const sqsQueue = new sqs.Queue(this, 'TrackMetadataQueue', {
      visibilityTimeout: cdk.Duration.seconds(30) // Set the visibility timeout as needed
    })

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
    })

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
    })

    // Attach the policy to your role
    const queueTriggeredMetadataWriterLambdaRole = new iam.Role(this, 'QueueTriggeredMetadataWriterLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })

    const cloudwatchPolicy = new iam.Policy(this, 'CloudWatchLogsPolicy', {
      document: cloudWatchLogsPolicy
    })

    queueTriggeredMetadataWriterLambdaRole.attachInlinePolicy(cloudwatchPolicy)

    const queueTriggeredMetadataWriterLambda = new lambda.Function(this, 'queueTriggeredMetadataWriterLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambdas/queueMetadataLambda/dist'),
      role: queueTriggeredMetadataWriterLambdaRole,
      environment: {
        DYNAMODB_TABLE_NAME: trackMetadataTable.tableName
      }
    })

    sqsQueue.grantSendMessages(queueTriggeredMetadataWriterLambda)

    geoJsonBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3Notifications.LambdaDestination(queueTriggeredMetadataWriterLambda))

    trackMetadataTable.grantReadWriteData(queueTriggeredMetadataWriterLambda)

    // Attach the policy to your role
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })

    lambdaRole.attachInlinePolicy(cloudwatchPolicy)

    // Create a Lambda function for the Query resolver
    // This query resolver will handle reading records from the metadata table
    const queryResolverLambda = new lambda.Function(this, 'QueryResolverLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambdas/queryResolverLambda/dist'),
      role: lambdaRole,
      environment: {
        DYNAMODB_TABLE_NAME: trackMetadataTable.tableName
      }
    })

    // Grant Lambda permissions to access metadata table
    trackMetadataTable.grantReadWriteData(queryResolverLambda)

    // Create a Lambda function for the Mutation resolver
    // This mutation resolver will handle updating records on the metadata table
    const mutationResolverLambda = new lambda.Function(this, 'MutationResolverLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambdas/mutationResolverLambda/dist'),
      role: lambdaRole,
      environment: {
        DYNAMODB_TABLE_NAME: trackMetadataTable.tableName
      }
    })

    const queryDataSource = api.addLambdaDataSource('QueryDataSource', queryResolverLambda)
    const mutationDataSource = api.addLambdaDataSource('MutationDataSource', mutationResolverLambda)

    queryDataSource.createResolver('getActivityById', {
      typeName: 'Query',
      fieldName: 'getActivityById'
    })

    queryDataSource.createResolver('getActivities', {
      typeName: 'Query',
      fieldName: 'getActivities'
    })

    queryDataSource.createResolver('getPlanByActivityId', {
      typeName: 'Query',
      fieldName: 'getPlanByActivityId'
    })

    mutationDataSource.createResolver('createPlanFromActivity', {
      typeName: 'Mutation',
      fieldName: 'createPlanFromActivity'
    })

    // Grant Lambda permissions to access the DynamoDB table
    trackMetadataTable.grantReadWriteData(mutationResolverLambda)

    // TODO: what is this output doing? i dont remember having this before

    // Output the GraphQL API endpoint
    // new cdk.CfnOutput(this, 'GraphQLApiEndpoint', {
    //   value: api.graphqlUrl
    // })
  }
}
