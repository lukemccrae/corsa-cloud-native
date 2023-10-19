import { stravaGetHttpClient } from '../../clients/httpClient';
import { makeGeoJson } from '../helpers/geoJson.helper';
import { makeMileData } from '../helpers/mileData.helper';
import S3 = require('aws-sdk/clients/s3');
import SQS = require('aws-sdk/clients/sqs');
import { type CreatedPlan, UpdatedPlan } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

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
    console.log(response, '<< response');
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

    const geoJson = makeGeoJson(
      latLngAltitudeStream.latlng.data,
      latLngAltitudeStream.altitude.data
    );

    // this could be refactored into makeGeoJson
    // leaving it separate because makeGeoJson is MESSY
    const { geoJsonWithMileData, mileData, paces } = makeMileData(geoJson);

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
      Body: JSON.stringify(geoJsonWithMileData)
    };

    const s3result = s3.putObject(bucketParams, (err: Error, data: any) => {
      if (err instanceof Error) {
        console.error('Error uploading to S3:', err);
        throw new Error(`Error uploading to S3: ${err.message}`);
      }
      console.log('File uploaded to S3:', data);
    });
    console.log(s3result, '<< s3result');
    const { Key } = bucketParams;

    const sqs = new SQS();

    const queueParams = {
      QueueUrl: process.env.METADATA_QUEUE_URL as string, // casting because we checked for undefined earlier
      MessageBody: JSON.stringify({
        Key,
        userId,
        planName,
        startTime,
        mileData,
        paces
      }) // SQS body is limited to 256KB
    };

    const sqsresult = sqs.sendMessage(queueParams, (err: Error, data: any) => {
      if (err instanceof Error) {
        console.log('Error sending to SQS:', err);
        throw new Error(`Error sending to SQS: ${err.message}`);
      }
      console.log('Message sent to SQS:', data);
    });
    console.log(sqsresult, '<< sqsresult');
    return { success: true };
  } catch (e) {
    console.log(e, '<< error');
    return { success: false };
  }
};
