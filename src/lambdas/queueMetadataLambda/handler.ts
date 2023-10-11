import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event: any): Promise<any> => {
  try {
    const { Bucket, Key, userId } = JSON.parse(event.Records[0].body);
    await writeMetadataToDynamo(Key, userId);
  } catch (e) {
    console.log(e);
  }
};
const client = new DynamoDBClient({ region: "us-east-1" });

export const writeMetadataToDynamo = async (
  Key: string,
  userId: string,
): Promise<void> => {
  const command = new PutItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Item: {
      BucketKey: { S: Key },
      UserId: { S: userId },
      Name: { S: "New Plan" },
      StartTime: { S: String(Date.now()) },
      MileData: { L: [] },
    },
  });

  const response = await client.send(command);
  console.log(response);
};
