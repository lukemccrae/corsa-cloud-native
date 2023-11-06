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

export const createPlanFromActivity = async (
  props: CreatePlanProps
): Promise<CreatedPlan> => {
  const { token, userId, planName, startTime } = props;
  const url = `https://www.strava.com/api/v3/activities/
    ${props.activityId}/streams?keys=latlng,altitude&key_by_type=true`;

  try {
    const latLngAltitudeStream = await stravaGetHttpClient({ token, url });

    // to run this locally use this mock
    // const latLngAltitudeStream = JSON.parse(mockActivityStream);

    const { featureCollection } = makeGeoJson(
      latLngAltitudeStream.latlng.data,
      latLngAltitudeStream.altitude.data
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

    const bucketParams = {
      Bucket: process.env.GEO_JSON_BUCKET_NAME,
      Key: uuidv4(),
      Body: JSON.stringify(geoJson)
    };

    s3.putObject(bucketParams, (err: Error, data: any) => {
      if (err instanceof Error) {
        console.error('Error uploading to S3:', err);
        throw new Error(`Error uploading to S3: ${err.message}`);
        return { success: false };
      }
      console.log('File uploaded to S3:', data);
    });

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

    const { Key } = bucketParams;

    const command = new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        BucketKey: { S: Key },
        UserId: { S: userId },
        Name: { S: planName },
        StartTime: { N: String(25200) }, //7am base start. dynamo requires numbers to be passed as strings
        MileData: mileDataAttribute,
        Paces: {
          L: geoJson.features[0].properties.mileData.map(() => ({
            N: String(540)
          }))
        } //540 for every pace
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
