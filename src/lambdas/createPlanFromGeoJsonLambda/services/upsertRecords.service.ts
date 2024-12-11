import { stravaGetHttpClient } from '../../clients/httpClient';
import { makeGeoJson } from '../helpers/geoJson.helper';
import { makeMileData } from '../helpers/mileData.helper';
import S3 = require('aws-sdk/clients/s3');
const { find } = require('geo-tz')

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { CreatedPlan, } from '../types';
import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { makeProfilePoints } from '../helpers/vertProfile.helper';
import {
  FeatureCollectionBAD,
  
} from '../../types';
import { makeMileIndices } from '../helpers/temp.mileIndicesHelper';
import { gpxToGeoJson } from './gpxGeoJson.service'
import {validateEnvVar} from '../helpers/environmentVarValidate.helper';
import { shortenIteratively } from '../helpers/removePoints.helper';
import { generatePacesFromGeoJson } from '../helpers/paceFromJson.helper';
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
}

interface createPlanFromGeoJsonArgs {
  gpxId: string;
  userId: string;
}

const client = new DynamoDBClient({ region: 'us-west-1' });

// welcome to hell =D
export const createPlanFromGeoJson = async (
  args: createPlanFromGeoJsonArgs
): Promise<CreatedPlan> => {

  // retrieve gpx from s3 with provided uuid
  const s3Client = new S3Client({ region: 'us-west-1' });

  const command = new GetObjectCommand({
    Bucket: process.env.GEO_JSON_BUCKET_NAME,

    Key: args.gpxId
  });

  const response = await s3Client.send(command);

  if (!response.Body) throw new Error('Failed to retrieve GPX from S3');

  // turn retrieved GPX into a geoJSON
  const streamString = await response.Body.transformToString('utf-8');

  const geoJsonString = gpxToGeoJson(streamString)

  const featureCollection: FeatureCollectionBAD = JSON.parse(geoJsonString);

  const planName = featureCollection.features[0].properties.name;
  const userId = args.userId;

  const reducedPoints = shortenIteratively(featureCollection)

  // TODO: These functions are using '../../types'
  // which is a type file i made
  // IT IS WRONG
  // I should be using the types generated from the schema in '../types'
  const geoJsonWithMileIndices = makeMileIndices(reducedPoints);

  const { geoJson } = makeMileData(geoJsonWithMileIndices);

  const paces = generatePacesFromGeoJson(geoJson)

  const startTime: string = geoJson.features[0].properties.pointMetadata[0].time

  // do a find for location with geo tz

  // it returns timezone

  // make new date object with timezone and pass to upload

  return await uploadPlan(
    geoJson,
    paces,
    userId,
    planName,
    args.gpxId,
    startTime
  );
};

// export const createPlanFromActivity = async (
//   props: CreatePlanProps
// ): Promise<CreatedPlan> => {
//   const { token, userId, planName } = props;
//   const url = `https://www.strava.com/api/v3/activities/
//     ${props.activityId}/streams?keys=latlng,time,altitude&key_by_type=true`;

//   try {
//     const latLngAltitudeTimeStream: ActivityStreamData =
//       await stravaGetHttpClient({ token, url });

//     // to run this locally use this mock
//     // const latLngAltitudeStream = JSON.parse(mockActivityStream);

//     // need to split out mile index code
//     const { featureCollection } = makeGeoJson(
//       // These casts could be folly
//       latLngAltitudeTimeStream.latlng.data as [LatLng],
//       latLngAltitudeTimeStream.altitude.data as Altitude
//     );

//     const { geoJson } = makeMileData(featureCollection);

//     const generatePacesFromTimeSteam = () => {
//       const paces = geoJson.features[0].properties.mileData.map((m, i) => {
//         return latLngAltitudeTimeStream.time.data[
//           // if i is the last, make it the end of the array
//           i === geoJson.features[0].properties.mileData.length - 1
//             ? latLngAltitudeTimeStream.time.data.length - 1
//             : // otherwise its the next. index is the BEGINNING point of the mile and here i need the end
//             geoJson.features[0].properties.mileData[i + 1].index
//         ];
//       });

//       const returnPaces = {
//         L: paces.map((p, i) => ({
//           N: String(i === 0 ? p : p - paces[i - 1])
//         }))
//       };

//       console.log(returnPaces, '<< returnPaces');

//       return returnPaces;
//     };

//     console.log(generatePacesFromTimeSteam(), '<< generatePacesFromTimeSteam');

//     return await uploadPlan(
//       geoJson,
//       generatePacesFromTimeSteam(),
//       userId,
//       planName,
//     );
//   } catch (e) {
//     console.log(e);
//     return { success: false };
//   }
// };

const uploadPlan = async (
  geoJson: FeatureCollectionBAD,
  paces: AttributeValue,
  userId: string,
  planName: string,
  gpxId: string,
  startTime: string
) => {
  try {
    const { pointsPerMile } = makeProfilePoints({ geoJson });

    const s3 = new S3({ region: 'us-west-1' });

    // if (
    //   process.env.GEO_JSON_BUCKET_NAME == null ||
    //   process.env.GEO_JSON_BUCKET_NAME === ''
    // ) {
    //   throw new Error('S3 bucket name not provided');
    // }

    const bucketParams = {
      // Bucket: process.env.GEO_JSON_BUCKET_NAME,
      Bucket: validateEnvVar(process.env.GEO_JSON_BUCKET_NAME),
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

    console.log(startTime, '<< startTime')

    const command = new PutItemCommand({
      // TableName: process.env.DYNAMODB_TABLE_NAME,
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        BucketKey: { S: Key },
        UserId: { S: userId },
        Name: { S: planName },
        StartTime: { S: startTime },
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

