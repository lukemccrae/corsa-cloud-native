import { stravaGetHttpClient } from '../../clients/httpClient';
import { makeGeoJson } from '../helpers/geoJson.helper';
import { makeMileData } from '../helpers/mileData.helper';
import S3 = require('aws-sdk/clients/s3');
import SQS = require('aws-sdk/clients/sqs');
import { Plan, type CreatedPlan, UpdatedPlan } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { mockActivityStream } from '../mockActivityStream';

interface CreatePlanProps {
  activityId: string;
  token: string;
  userId: string;
  planName: string;
  bucketKey: string;
  startTime: number;
}

interface UpdatePlanProps {
  startTime: number;
  userId: string;
  planName: string;
  sortKey: string;
}

const client = new DynamoDBClient({ region: 'us-east-1' });

export const updatePlanById = async (
  planInputArgs: UpdatePlanProps
): Promise<UpdatedPlan> => {
  const { startTime, userId, planName, sortKey } = planInputArgs;

  const command = new UpdateItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      UserId: { S: userId },
      BucketKey: { S: sortKey }
    },
    UpdateExpression: 'SET #Name = :nameValue, #StartTime = :startTimeValue',
    ExpressionAttributeNames: {
      '#Name': 'Name',
      '#StartTime': 'StartTime'
      // '#pace': 'pace'
    },
    ExpressionAttributeValues: {
      ':nameValue': { S: planName },
      ':startTimeValue': { N: String(startTime) }
      // ':paceValue': { S: newPace }
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
    // const latLngAltitudeStream = await stravaGetHttpClient({ token, url });
    const latLngAltitudeStream = JSON.parse(mockActivityStream);

    const geoJson = makeGeoJson(
      latLngAltitudeStream.latlng.data,
      latLngAltitudeStream.altitude.data
    );

    const mileData = makeMileData(geoJson);

    console.log(mileData, '<< mileData');

    // const s3 = new S3({ region: 'us-east-1' });

    // const sqs = new SQS();

    // if (
    //   process.env.GEO_JSON_BUCKET_NAME == null ||
    //   process.env.GEO_JSON_BUCKET_NAME === ''
    // ) {
    //   throw new Error('S3 bucket name not provided');
    // }

    // if (
    //   process.env.METADATA_QUEUE_URL == null ||
    //   process.env.METADATA_QUEUE_URL === ''
    // ) {
    //   throw new Error('SQS queue URL not provided');
    // }

    // const params = {
    //   Bucket: process.env.GEO_JSON_BUCKET_NAME,
    //   Key: uuidv4(),
    //   Body: JSON.stringify(geoJson)
    // };

    // s3.putObject(params, (err: Error, data: any) => {
    //   if (err instanceof Error) {
    //     console.error('Error uploading to S3:', err);
    //     throw new Error(`Error uploading to S3: ${err.message}`);
    //   }
    //   console.log('File uploaded to S3:', data);
    // });

    // const { Key } = params;

    // const queueParams = {
    //   QueueUrl: process.env.METADATA_QUEUE_URL,
    //   MessageBody: JSON.stringify({ Key, userId, planName, startTime }) // SQS body is limited to 256KB
    // };

    // sqs.sendMessage(queueParams, (err: Error, data: any) => {
    //   if (err instanceof Error) {
    //     console.log('Error sending to SQS:', err);
    //     throw new Error(`Error sending to SQS: ${err.message}`);
    //   }
    //   console.log('Message sent to SQS:', data);
    // });

    return { success: true };
  } catch (e) {
    console.log(e, '<< error');
    return { success: false };
  }
};
