import { stravaGetHttpClient } from '../../clients/httpClient';
import { makeGeoJson } from '../helpers/geoJson.helper';
import { makeMileData } from '../helpers/mileData.helper';
import S3 = require('aws-sdk/clients/s3');
import { type CreatedPlan, UpdatedPlan } from '../types';
import { v4 as uuidv4 } from 'uuid';
import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { mockActivityStream } from '../mockActivityStream';
import { makeProfilePoints } from '../helpers/vertProfile.helper';
import { addPacesToMileData } from '../helpers/paces.helper';
import { ActivityStreamData, Altitude, LatLng } from '../../types';

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

interface CreatePlanFromGpxArgs {
  gpx: string;
}

const client = new DynamoDBClient({ region: 'us-east-1' });

export const updatePlanById = async (
  planInputArgs: UpdatePlanProps
): Promise<UpdatedPlan> => {
  console.log(planInputArgs, '<< planInputArgs');
  const { startTime, userId, planName, sortKey, paces } = planInputArgs;

  const command = new UpdateItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      UserId: { S: userId },
      BucketKey: { S: sortKey }
    },
    // This is analogous to a SQL statement
    UpdateExpression:
      'SET #Name = :name, #StartTime = :startTime, #Paces = :paces',
    // This ties the passed values to the DB variables
    ExpressionAttributeNames: {
      '#Name': 'Name',
      '#StartTime': 'StartTime',
      '#Paces': 'Paces'
    },
    // This passes the values to the write operation
    ExpressionAttributeValues: {
      ':name': { S: planName },
      ':startTime': { N: String(startTime) },
      ':paces': { L: paces.map((item) => ({ N: String(item) })) }
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

export const createPlanFromGpx = async (
  args: CreatePlanFromGpxArgs
): Promise<CreatedPlan> => {
  console.log(args, '<< args');
  return { success: false };
};

export const createPlanFromActivity = async (
  props: CreatePlanProps
): Promise<CreatedPlan> => {
  const { token, userId, planName } = props;
  const url = `https://www.strava.com/api/v3/activities/
    ${props.activityId}/streams?keys=latlng,time,altitude&key_by_type=true`;

  try {
    const latLngAltitudeTimeStream: ActivityStreamData =
      await stravaGetHttpClient({ token, url });
    console.log(JSON.stringify(latLngAltitudeTimeStream), '<< stream');

    // to run this locally use this mock
    // const latLngAltitudeStream = JSON.parse(mockActivityStream);

    const { featureCollection } = makeGeoJson(
      // These casts could be folly
      latLngAltitudeTimeStream.latlng.data as [LatLng],
      latLngAltitudeTimeStream.altitude.data as Altitude
    );

    const { geoJson } = makeMileData(featureCollection);

    const { pointsPerMile } = makeProfilePoints({ geoJson });

    const s3 = new S3({ region: 'us-east-1' });

    if (
      process.env.GEO_JSON_BUCKET_NAME == null ||
      process.env.GEO_JSON_BUCKET_NAME === ''
    ) {
      throw new Error('S3 bucket name not provided');
    }

    const uuid = uuidv4();

    const bucketParams = {
      Bucket: process.env.GEO_JSON_BUCKET_NAME,
      Key: uuid,
      Body: JSON.stringify(geoJson)
    };

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
      L: geoJson.features[0].properties.mileData.map((dataItem, i) => ({
        M: {
          elevationGain: { N: dataItem.elevationGain!.toString() },
          elevationLoss: { N: dataItem.elevationLoss!.toString() },
          gainProfile: {
            L: pointsPerMile[i].map((value) => ({
              N: value.toString()
            }))
          }
        }
      }))
    };

    const generatePacesFromTimeSteam = () => {
      const paces = geoJson.features[0].properties.mileData.map((m, i) => {
        return latLngAltitudeTimeStream.time.data[
          // if i is the last, make it the end of the array
          i === geoJson.features[0].properties.mileData.length - 1
            ? latLngAltitudeTimeStream.time.data.length - 1
            : // otherwise its the next index is the BEGINNING point of the mile and here i need the end
              geoJson.features[0].properties.mileData[i + 1].index
        ];
      });

      return {
        L: paces.map((p, i) => ({
          N: String(i === 0 ? p : p - paces[i - 1])
        }))
      };
    };

    const { Key } = bucketParams;

    const command = new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        BucketKey: { S: Key },
        UserId: { S: userId },
        Name: { S: planName },
        StartTime: { N: String(0) }, //7am base start. dynamo requires numbers to be passed as strings
        MileData: mileDataAttribute,
        Paces: generatePacesFromTimeSteam()
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
