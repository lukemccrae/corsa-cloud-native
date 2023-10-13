import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event: any): Promise<any> => {
  try {
    const { Bucket, Key, userId, planName } = JSON.parse(event.Records[0].body);
    await writeMetadataToDynamo(Key, userId, planName);
  } catch (e) {
    console.log(e);
  }
};

const client = new DynamoDBClient({ region: 'us-east-1' });

export const writeMetadataToDynamo = async (
  Key: string,
  userId: string,
  planName: string
): Promise<void> => {
  const command = new PutItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: {
      BucketKey: { S: Key },
      UserId: { S: userId },
      Name: { S: planName },
      StartTime: { N: String(25200) }, //7am base start. dynamo requires numbers to be passed as strings
      MileData: { L: [] }
    }
  });

  const response = await client.send(command);
  console.log(response);
};
