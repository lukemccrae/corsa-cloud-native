import { makeMileData } from '../helpers/mileData.helper';
import S3 = require('aws-sdk/clients/s3');

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { CreatedPlan } from '../types';
import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { makeProfilePoints } from '../helpers/vertProfile.helper';
import { FeatureCollectionBAD } from '../../types';
import { makeMileIndices } from '../helpers/temp.mileIndicesHelper';
import { gpxToGeoJson } from './gpxGeoJson.service';
import { validateEnvVar } from '../helpers/environmentVarValidate.helper';
import { shortenIteratively } from '../helpers/removePoints.helper';
import { generatePacesFromGeoJson } from '../helpers/paceFromJson.helper';
import { retrieveTimezone } from './timezone.service';
// dotenv necessary here only for local development with `yarn ll`
// this file is referencing environment variables defined in CDK
// the lambda runtime has dotenv in its environment so this may be redundant,
// i am unsure if the dependency overlap will cause issues
// import dotenv from 'dotenv';
// dotenv.config({ path: '../.env' });

interface createPlanFromGeoJsonArgs {
  gpxId: string;
  userId: string;
  username: string;
}

const client = new DynamoDBClient({ region: 'us-west-1' });

// welcome to hell =D
export const createPlanFromGeoJson = async (
  args: createPlanFromGeoJsonArgs
): Promise<CreatedPlan> => {
  // retrieve gpx from s3 with provided uuid
  const s3Client = new S3Client({ region: 'us-west-1' });

  const command = new GetObjectCommand({
    // Bucket: process.env.GEO_JSON_BUCKET_NAME,
    Bucket: 'corsabackendstack-geojsonbucket37355d9d-yb8me5pyze3i',
    Key: args.gpxId
  });

  const response = await s3Client.send(command);

  if (!response.Body) throw new Error('Failed to retrieve GPX from S3');

  // turn retrieved GPX into a geoJSON
  const streamString = await response.Body.transformToString('utf-8');

  const geoJsonString = gpxToGeoJson(streamString);
  // console.log(JSON.stringify(streamString, null, 2), '<< fc');

  const featureCollection: FeatureCollectionBAD = JSON.parse(geoJsonString);

  const planName = featureCollection.features[0].properties.name;
  const userId = args.userId;

  // TODO: These functions are using '../../types'
  // which is a type file i made
  // IT IS WRONG
  // I should be using the types generated from the schema in '../types'
  const geoJsonWithMileIndices = makeMileIndices(featureCollection);

  const { geoJson } = makeMileData(geoJsonWithMileIndices);

  const { pointsPerMile } = makeProfilePoints({ geoJson });

  const paces = generatePacesFromGeoJson(geoJson);

  // const reducedPoints: FeatureCollectionBAD =
  //   shortenIteratively(featureCollection);

  const startTimeInUTC: Date = new Date(
    geoJson.features[0].properties.pointMetadata[0].time
  );

  // find timezone of GPX so that frontend can perform a conversion
  const timezone = retrieveTimezone(
    geoJson.features[0].geometry.coordinates[0]
  );

  return await uploadPlan(
    featureCollection,
    paces,
    userId,
    planName,
    args.gpxId,
    startTimeInUTC,
    timezone,
    pointsPerMile,
    args.username
  );
};

const uploadPlan = async (
  geoJson: FeatureCollectionBAD,
  paces: AttributeValue,
  userId: string,
  planName: string,
  gpxId: string,
  startTime: Date,
  timezone: string,
  pointsPerMile: number[][],
  author: string
) => {
  console.log(geoJson.features[0].properties.lastMileDistance, '<< lmd');
  try {
    const s3 = new S3({ region: 'us-west-1' });

    // if (
    //   process.env.GEO_JSON_BUCKET_NAME == null ||
    //   process.env.GEO_JSON_BUCKET_NAME === ''
    // ) {
    //   throw new Error('S3 bucket name not provided');
    // }

    const bucketParams = {
      // Bucket: process.env.GEO_JSON_BUCKET_NAME,
      // Bucket: validateEnvVar(process.env.GEO_JSON_BUCKET_NAME),
      Bucket: 'corsabackendstack-geojsonbucket37355d9d-yb8me5pyze3i',

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
        return {
          M: {
            elevationGain: { N: dataItem.elevationGain!.toString() },
            elevationLoss: { N: dataItem.elevationLoss!.toString() },
            gainProfile: {
              L: pointsPerMile[i].map((value) => ({
                N: value.toString()
              }))
            },
            stopTime: { N: dataItem.stopTime!.toString() }
          }
        };
      })
    };

    const { Key } = bucketParams;

    const newMDstate = `# New Article`;

    const command = new PutItemCommand({
      // TableName: process.env.DYNAMODB_TABLE_NAME,
      // TableName: process.env.DYNAMODB_TABLE_NAME,
      TableName: 'CorsaBackendStack-TrackMetadataTable38567A80-1ATS8LGKJ2X2V',
      Item: {
        UserId: { S: userId },
        Slug: {
          S:
            planName.replace(/\s+/g, '-') +
            '-' +
            Math.random().toString(36).slice(2, 10)
        },
        BucketKey: { S: Key },
        Name: { S: planName },
        StartTime: { S: String(startTime) },
        TimeZone: { S: timezone },
        MileData: mileDataAttribute,
        Paces: paces,
        LastMileDistance: {
          N: String(geoJson.features[0].properties.lastMileDistance)
        },
        ArticleContent: {
          S: newMDstate
        },
        Published: {
          BOOL: false
        },
        CoverImage: {
          S: ''
        },
        ProfilePhoto: {
          S: ''
        },
        Author: {
          S: author
        },
        PublishDate: {
          S: String(Date.now())
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
