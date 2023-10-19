import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import SQS = require('aws-sdk/clients/sqs');

export const handler = async (event: any): Promise<any> => {
  if (
    process.env.METADATA_QUEUE_URL == null ||
    process.env.METADATA_QUEUE_URL === ''
  ) {
    throw new Error('Queue url not provided to metadata lambda');
  }
  try {
    const { Key, userId, planName, mileData, paces, sqsMessageId } = JSON.parse(
      event.Records[0].body
    );
    await writeMetadataToDynamo(
      Key,
      userId,
      planName,
      mileData,
      paces,
      sqsMessageId
    );
  } catch (e) {
    console.log(e);
  }
};

type TrackMetaData = {
  elevationGain: number;
  elevationLoss: number;
  pace: number;
};

const client = new DynamoDBClient({ region: 'us-east-1' });

export const writeMetadataToDynamo = async (
  Key: string,
  userId: string,
  planName: string,
  mileData: TrackMetaData[],
  paces: number[],
  sqsMessageId: string
): Promise<void> => {
  const mileDataAttribute = {
    L: mileData.map((dataItem) => ({
      M: {
        elevationGain: { N: dataItem.elevationGain.toString() },
        elevationLoss: { N: dataItem.elevationLoss.toString() }
      }
    }))
  };

  const command = new PutItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: {
      BucketKey: { S: Key },
      UserId: { S: userId },
      Name: { S: planName },
      StartTime: { N: String(25200) }, //7am base start. dynamo requires numbers to be passed as strings
      MileData: mileDataAttribute,
      Paces: { L: paces.map((item) => ({ N: String(item) })) }
    }
  });

  const response = await client.send(command);
  console.log(response, '<< response');
  await deleteMessage(sqsMessageId);
  console.log(response);
};

const deleteMessage = async (sqsMessageId: string) => {
  const sqs = new SQS();

  const deleteParams = {
    QueueUrl: process.env.METADATA_QUEUE_URL as string, // we check for this earlier
    ReceiptHandle: sqsMessageId
  };
  sqs.deleteMessage(deleteParams, (deleteErr: Error, deleteData: any) => {
    if (deleteErr instanceof Error) {
      console.log('Error deleting message:', deleteErr);
      // Handle the error or retry the deletion if necessary.
    } else {
      console.log('Message deleted:', deleteData);
    }
  });
};
