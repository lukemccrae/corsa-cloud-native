import { stravaGetHttpClient } from '../../clients/httpClient';
import { makeGeoJson } from '../helpers/geoJson.helper';
import { makeMileData } from '../helpers/mileData.helper';
import S3 = require('aws-sdk/clients/s3');
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { type CreatedPlan, UpdatedPlan, FeatureCollection, UpdatedArticle, PublishedPlan } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { makeProfilePoints } from '../helpers/vertProfile.helper';
import { addPacesToMileData } from '../helpers/paces.helper';
import {
  ActivityStreamData,
  Altitude,
  FeatureCollectionBAD,
  LatLng
} from '../../types';
import { makeMileIndices } from '../helpers/temp.mileIndicesHelper';
import { gpxToGeoJson } from './gpxGeoJson.service'
import { json } from '../mockJson'

interface CreatePlanProps {
  activityId: string;
  token: string;
  userId: string;
  planName: string;
  bucketKey: string;
  startTime: number;
}

interface UpdatePlanProps {
  sortKey: string;
  userId: string;
  startTime: number;
  planName: string;
  paces: number[];
  articleContent: string;
}

interface UpdateArticleProps {
  bucketKey: string;
  userId: string;
  articleContent: string;
}

interface PublishPlanProps {
  bucketKey: string;
  userId: string;
  published: boolean;
}

interface createPlanFromGeoJsonArgs {
  gpxId: string;
  userId: string;
}

const client = new DynamoDBClient({ region: 'us-west-1' });

export const publishPlan = async (
  props: PublishPlanProps): Promise<PublishedPlan> => {
    const { published, bucketKey, userId} = props;
    const command = new UpdateItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        UserId: { S: userId },
        BucketKey: { S: bucketKey }
      },
      // This is analogous to a SQL statement
      UpdateExpression:
        'SET #Published = :published',
      // This ties the passed values to the DB variables
      ExpressionAttributeNames: {
        '#Published': 'Published'
      },
      // This passes the values to the write operation
      ExpressionAttributeValues: {
        ':published': { BOOL: published }
      }
    });

    try {
      // console.log(command, '<< command')
      const response = await client.send(command);
      if (response.$metadata.httpStatusCode === 200)
        return {
          success: true
        };
      throw new Error('Publishing the article failed');
    } catch (e) {
      console.log(e, '<< error');
      return {
        success: false
      };
    }
}

export const updateArticleByPlanId = async (
  articleInputArgs: UpdateArticleProps
): Promise<UpdatedArticle> => {
  const { userId, bucketKey, articleContent } = articleInputArgs;

  const command = new UpdateItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      UserId: { S: userId },
      BucketKey: { S: bucketKey }
    },
    // This is analogous to a SQL statement
    UpdateExpression:
      'SET #ArticleContent = :articleContent',
    // This ties the passed values to the DB variables
    ExpressionAttributeNames: {
      '#ArticleContent': 'ArticleContent'
    },
    // This passes the values to the write operation
    ExpressionAttributeValues: {
      ':articleContent': { S: articleContent }
    }
  });

  try {
    // console.log(command, '<< command')
    const response = await client.send(command);
    if (response.$metadata.httpStatusCode === 200)
      return {
        success: true
      };
    throw new Error('Updating the article failed');
  } catch (e) {
    console.log(e, '<< error');
    return {
      success: false
    };
  }
}

export const updatePlanById = async (
  planInputArgs: UpdatePlanProps
): Promise<UpdatedPlan> => {
  const { startTime, userId, planName, sortKey, paces, articleContent } = planInputArgs;

  const command = new UpdateItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      UserId: { S: userId },
      BucketKey: { S: sortKey }
    },
    // This is analogous to a SQL statement
    UpdateExpression:
      'SET #Name = :name, #StartTime = :startTime, #Paces = :paces, #ArticleContent = :articleContent',
    // This ties the passed values to the DB variables
    ExpressionAttributeNames: {
      '#Name': 'Name',
      '#StartTime': 'StartTime',
      // '#Paces': 'Paces',
    },
    // This passes the values to the write operation
    ExpressionAttributeValues: {
      ':name': { S: planName },
      ':startTime': { N: String(startTime) },
      // ':paces': { L: paces.map((item) => ({ N: String(item) })) }, // paces not changeable for now
    }
  });

  try {
    const response = await client.send(command);
    if (response.$metadata.httpStatusCode === 200)
      return {
        success: true
      };
    throw new Error('Updating the plan failed');
  } catch (e) {
    console.log(e, '<< error');
    return {
      success: false
    };
  }
};

export const createPlanFromGeoJson = async (
  args: createPlanFromGeoJsonArgs
): Promise<CreatedPlan> => {
  // retrieve gpx from s3 with provided uuid
  const s3Client = new S3Client({ region: 'us-west-1' });

  const command = new GetObjectCommand({
    // Bucket: process.env.GEO_JSON_BUCKET_NAME,
    Bucket: "corsabackendstack-geojsonbucket37355d9d-yb8me5pyze3i",

    Key: args.gpxId
  });

  const response = await s3Client.send(command);

  if (!response.Body) throw new Error('Error processing GeoJson');

  const streamString = await response.Body.transformToString('utf-8');

  // const geoJsonString = gpxToGeoJson(streamString)

  // console.log(geoJsonString, '<< fc')
  const featureCollection: FeatureCollectionBAD = JSON.parse(streamString);

  const planName = featureCollection.features[0].properties.name;
  const userId = args.userId;

  // TODO: These functions are using '../../types'
  // which is a type file i made
  // IT IS WRONG
  // I should be using the types generated from the schema in '../types'
  const geoJsonWithMileIndices = makeMileIndices(featureCollection);



  const { geoJson } = makeMileData(geoJsonWithMileIndices);
  const generatePacesFromGeoJson = () => {
    const feature = geoJson.features[0];
    const paces = feature.properties.mileData.map((m, i) => {
      const timeInSeconds =
        Date.parse(
          // annoying indexing here because mileData stores the
          //  BEGINNING point of the mile and here i need the end
          feature.properties.coordTimes[
          // if i is the last, make it the end of the array
          i === feature.properties.mileData.length - 1
            ? feature.properties.coordTimes.length - 1
            : // otherwise its the next, since mileData[0].index is 0
            feature.properties.mileData[i + 1].index
          ]
        ) / 1000;

      return timeInSeconds;
    });

    const startTime =
      Date.parse(geoJson.features[0].properties.coordTimes[0]) / 1000;
    const returnPaces = {
      L: paces.map((p, i) => ({
        N: String(
          // if we are at the beginning give the pace back minus start time
          i === 0
            ? p - startTime
            : // otherwise subtract the previous mile time to get the split of the current mile
            p - paces[i - 1]
        )
      }))
    };

    return returnPaces;
  };

  const timeInSeconds = generatePacesFromGeoJson();

  return await uploadPlan(
    geoJson,
    timeInSeconds,
    userId,
    planName,
    args.gpxId
  );
};

const uploadPlan = async (
  geoJson: FeatureCollectionBAD,
  paces: AttributeValue,
  userId: string,
  planName: string,
  gpxId: string
) => {
  try {
    console.log("do i work?")

    const { pointsPerMile } = makeProfilePoints({ geoJson });
    console.log("do i work now?")


    const s3 = new S3({ region: 'us-west-1' });

    // if (
    //   process.env.GEO_JSON_BUCKET_NAME == null ||
    //   process.env.GEO_JSON_BUCKET_NAME === ''
    // ) {
    //   throw new Error('S3 bucket name not provided');
    // }

    const bucketParams = {
      // Bucket: process.env.GEO_JSON_BUCKET_NAME,
      Bucket: "corsabackendstack-geojsonbucket37355d9d-yb8me5pyze3i",
      Key: gpxId, // overwrite the GPX file with a more usable geoJSON
      Body: JSON.stringify(geoJson)
    };

    // I think this flow could be done decoupled
    // S3 upload could trigger the dynamo write
    // Dynamo would just need the object ID from s3
    async function uploadToS3(
      bucketParams: S3.PutObjectRequest
    ): Promise<void> {
      try {
        const data = await s3.putObject(bucketParams).promise();
        console.log('File uploaded to S3:', data);
      } catch (error) {
        console.error('Error uploading to S3:', error);
      }
    }

    await uploadToS3(bucketParams);

    const mileDataAttribute = {
      L: geoJson.features[0].properties.mileData.map((dataItem, i) => {
        console.log(dataItem, '<< dataItem')
        return ({
          M: {
            elevationGain: { N: dataItem.elevationGain!.toString() },
            elevationLoss: { N: dataItem.elevationLoss!.toString() },
            gainProfile: {
              L: pointsPerMile[i].map((value) => ({
                N: value.toString()
              }))
            },
            stopTime: { N: dataItem.stopTime!.toString() },
          }
        })
      })
    };

    const { Key } = bucketParams;

    const command = new PutItemCommand({
      // TableName: process.env.DYNAMODB_TABLE_NAME,
      TableName: "CorsaBackendStack-TrackMetadataTable38567A80-1ADFCHBQFB2NC",
      Item: {
        BucketKey: { S: Key },
        UserId: { S: userId },
        Name: { S: planName },
        StartTime: { N: String(0) }, //7am base start. dynamo requires numbers to be passed as strings
        MileData: mileDataAttribute,
        Paces: paces,
        LastMileDistance: {
          N: String(geoJson.features[0].properties.lastMileDistance)
        }
      }
    });

    const dynamoresponse = await client.send(command);

    if (dynamoresponse.$metadata.httpStatusCode?.valueOf() === 200) {
      return { success: true };
    }
    return { success: false };
  } catch (e) {
    console.log(e, 'Error');
    return { success: false };
  }
};
