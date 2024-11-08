import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { type Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib';

export class CorsaBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const trackMetadataTableName = this.node.tryGetContext('DYNAMODB_TABLE_NAME');
    const geoJsonBucketName = this.node.tryGetContext('GEO_JSON_BUCKET_NAME')
    const REGION = this.node.tryGetContext('REGION');
    const ACCOUNT = this.node.tryGetContext('ACCOUNT');
    
    const userPool = cognito.UserPool.fromUserPoolId(this, 'CorsaUserPool', 'us-west-1_S7GEufYHG');

    const preSignUpLambda = new lambda.Function(this, 'PreSignUpLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = (event, context, callback) => {
          event.response.autoConfirmUser = true;
          event.response.autoVerifyEmail = true;
          context.done(null, event);
        };
      `)
    });

    // userPool.addTrigger(cognito.UserPoolOperation.PRE_SIGN_UP, preSignUpLambda);

    const domain = userPool.addDomain('Domain', {
      cognitoDomain: {
        domainPrefix: 'corsa'
      }
    });

    new cdk.CfnOutput(this, 'CognitoDomainName', { value: domain.domainName });

    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolArn', { value: userPool.userPoolArn });

    const trackMetadataTable = dynamodb.Table.fromTableArn(this, 'TrackMetadataTable',
      `arn:aws:dynamodb:${REGION}:${ACCOUNT}:table/${trackMetadataTableName}`);

    // Create a DynamoDB table for storing metadata for geoJSON track
    // const trackMetadataTable = new dynamodb.Table(this, 'TrackMetadataTable', {
    //   partitionKey: {
    //     name: 'UserId',
    //     type: dynamodb.AttributeType.STRING
    //   },
    //   sortKey: {
    //     name: 'BucketKey',
    //     type: dynamodb.AttributeType.STRING
    //   }
    // });

    const utilityApi = new apiGateway.RestApi(this, 'CorsaUtilityApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        // allowOrigins: ['http://localhost:3000'],
        allowMethods: apiGateway.Cors.ALL_METHODS
      }
    });

    const utilityLambdaRole = new iam.Role(this, 'UtilityLambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    const presignUrlLambdaRole = new iam.Role(this, 'PresignUrlLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    const openAIassistantLambdaRole = new iam.Role(this, 'OpenAIassistantLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    const gpxToGeoJsonLambda = new lambda.Function(this, 'gpxToGeoJsonLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambdas/gpxToGeoJsonLambda/dist'),
      role: utilityLambdaRole,
      timeout: cdk.Duration.seconds(10)
    });

    const presignedGpxUrlLambda = new lambda.Function(
      this,
      'presignedGpxUrlLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('src/lambdas/presignedGpxUrlLambda/dist'),
        role: presignUrlLambdaRole,
        timeout: cdk.Duration.seconds(10),
        environment: {
          GEO_JSON_BUCKET_NAME: geoJsonBucketName
        }
      }
    );

    const openAIassistantLambda = new lambda.Function(
      this,
      'openAIassistantLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('src/lambdas/openAIassistantLambda/dist'),
        role: openAIassistantLambdaRole,
        timeout: cdk.Duration.seconds(10)
      }
    );

    const geoJsonApiConstruct = utilityApi.root.addResource('gpx-geojson');
    const presignedUrlForGpxUploads =
      utilityApi.root.addResource('gpx-presigned');


    const authorizer = new apiGateway.CognitoUserPoolsAuthorizer(this, 'CorsaApiAuthorizer', {
      cognitoUserPools: [userPool],
    });

    presignedUrlForGpxUploads.addMethod(
      'GET',
      new apiGateway.LambdaIntegration(presignedGpxUrlLambda),
      {
        authorizer,
        authorizationType: apiGateway.AuthorizationType.COGNITO
      }
    );

    geoJsonApiConstruct.addMethod(
      'POST',
      new apiGateway.LambdaIntegration(gpxToGeoJsonLambda),
      {
        authorizer,
        authorizationType: apiGateway.AuthorizationType.COGNITO
      }
    );

    const openAIassistantApiConstruct = utilityApi.root.addResource('corsa-assistant');

    openAIassistantApiConstruct.addMethod('POST',
      new apiGateway.LambdaIntegration(openAIassistantLambda),
      {
        authorizer,
        authorizationType: apiGateway.AuthorizationType.COGNITO
      }
    );

    // create new bucket template
    // const geoJsonBucket = new s3.Bucket(this, 'geoJsonBucket', {
    //   cors: [
    //     {
    //       allowedOrigins: ['http://localhost:5173', 'https://corsa-one.vercel.app'], // Specify the correct origin
    //       allowedMethods: [s3.HttpMethods.POST, s3.HttpMethods.PUT],
    //       allowedHeaders: ['*'],
    //       exposedHeaders: ['ETag'],
    //       maxAge: 3000
    //     }
    //   ]
    // });

    const geoJsonBucket = s3.Bucket.fromBucketArn(this, 'geoJsonBucket', `arn:aws:s3:::${geoJsonBucketName}`);

    // when a new item wss://afno5ipvkfamfagfok7ad4qnwm.appsync-realtime-api.us-west-1.amazonaws.com/graphqlis added to the bucket trigger an event and write metadata to dynamo
    // metadata will be passed along with the file which will be retrieved from the activity
    // this should include name, date, distance

    const corsOptions: apiGateway.CorsOptions = {
      allowOrigins: apiGateway.Cors.ALL_ORIGINS, // Allow requests from any origin
      allowMethods: apiGateway.Cors.ALL_METHODS // Allow all HTTP methods
    };

    // Create a GraphQL API
    const api = new appsync.GraphqlApi(this, 'CorsaGraphAPI', {
      name: 'corsa-graphql-api',
      ...corsOptions,
      schema: appsync.SchemaFile.fromAsset('infra/graphql/schema.graphql'), // Replace with the path to your GraphQL schema file
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userPool,
          }

        },
      },
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

    const createPlanFromGeoJsonLambdaRole = new iam.Role(
      this,
      'CreatePlanExecutionRole',
      {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')

      }
    )

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
          DYNAMODB_TABLE_NAME: trackMetadataTableName,
          GEO_JSON_BUCKET_NAME: geoJsonBucketName
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
          DYNAMODB_TABLE_NAME: trackMetadataTableName,
          GEO_JSON_BUCKET_NAME: geoJsonBucketName
        }
      }
    );

    // Create a Lambda function for the createPlan resolver
    // This mutation resolver will handle initial processing of GPX files 
    // and writing data to storage devices 
    const createPlanFromGeoJsonLambda = new lambda.Function(
      this,
      'CreatePlanFromGeoJsonLambda',
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        code: lambda.Code.fromAsset('src/lambdas/createPlanFromGeoJsonLambda/dist'),
        role: createPlanFromGeoJsonLambdaRole,
        timeout: Duration.seconds(120),
        memorySize: 1024,
        environment: {
          DYNAMODB_TABLE_NAME: trackMetadataTableName,
          GEO_JSON_BUCKET_NAME: geoJsonBucketName
        }
      }
    );

    // permissions
    queryLambdaRole.attachInlinePolicy(cloudwatchPolicy);
    mutationLambdaRole.attachInlinePolicy(cloudwatchPolicy);
    utilityLambdaRole.attachInlinePolicy(cloudwatchPolicy);
    presignUrlLambdaRole.attachInlinePolicy(cloudwatchPolicy);
    createPlanFromGeoJsonLambdaRole.attachInlinePolicy(cloudwatchPolicy);
    openAIassistantLambdaRole.attachInlinePolicy(cloudwatchPolicy)

    geoJsonBucket.grantRead(queryLambdaRole);

    geoJsonBucket.grantReadWrite(mutationLambdaRole);
    geoJsonBucket.grantReadWrite(createPlanFromGeoJsonLambdaRole);

    trackMetadataTable.grantReadData(queryResolverLambda);
    trackMetadataTable.grantReadWriteData(mutationResolverLambda);
    trackMetadataTable.grantReadWriteData(createPlanFromGeoJsonLambda)

    const userIdDynamoPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['dynamodb:BatchGetItem'],
      resources: [trackMetadataTable.tableArn]
    });

    queryLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [geoJsonBucket.bucketArn]
      })
    );

    queryLambdaRole.addToPolicy(userIdDynamoPolicy);

    presignUrlLambdaRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameters'],
        resources:         [
          `arn:aws:ssm:${REGION}:${ACCOUNT}:parameter/ACCESS_KEY_ID`,
          `arn:aws:ssm:${REGION}:${ACCOUNT}:parameter/SECRET_ACCESS_KEY`
        ]

      })
    );

    openAIassistantLambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['ssm:GetParameters'],
      resources: [
        `arn:aws:ssm:${REGION}:${ACCOUNT}:parameter/ASSISTANT_API_KEY`

      ]
    }))

    const queryDataSource = api.addLambdaDataSource(
      'QueryDataSource',
      queryResolverLambda
    );
    const mutationDataSource = api.addLambdaDataSource(
      'MutationDataSource',
      mutationResolverLambda
    );

    const createPlanDataSource = api.addLambdaDataSource(
      'createPlanFromGeoJsonLambda',
      createPlanFromGeoJsonLambda
    )

    createPlanDataSource.createResolver('createPlanFromGeoJson', {
      typeName: 'Mutation',
      fieldName: 'createPlanFromGeoJson'
    });

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

    queryDataSource.createResolver('getPlanById', {
      typeName: 'Query',
      fieldName: 'getPlanById'
    });

    mutationDataSource.createResolver('createPlanFromActivity', {
      typeName: 'Mutation',
      fieldName: 'createPlanFromActivity'
    });

    mutationDataSource.createResolver('deletePlanById', {
      typeName: 'Mutation',
      fieldName: 'deletePlanById'
    });

    mutationDataSource.createResolver('updatePlanById', {
      typeName: 'Mutation',
      fieldName: 'updatePlanById'
    });
  }
}
