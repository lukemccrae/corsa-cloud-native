import { DynamoDBClient, BatchGetItemCommand } from "@aws-sdk/client-dynamodb";

export const getPlansByUserId = async (args: any): Promise<any> => {
  const client = new DynamoDBClient({ region: "us-east-1" });

  const { userId } = args;

  const tableName = String(process.env.DYNAMODB_TABLE_NAME);

  console.log(tableName, "<<< table name");

  // Define the BatchGetItem request
  const command = new BatchGetItemCommand({
    RequestItems: {
      [tableName]: {
        Keys: [
          {
            UserId: { S: userId },
          },
        ],
      },
    },
  });

  try {
    // Execute the BatchGetItem operation
    const result = await client.send(command);
    console.log(result, "<< result");
  } catch (e) {
    console.log(e, "<< error batch get");
  }

  return {
    id: "123",
    name: "String",
    startTime: "date string",
    goalHours: 5,
    goalMinutes: 5,
    mileData: [
      {
        elevationGain: 5,
        elevationLoss: 5,
        pace: 50,
        time: 50,
      },
    ],
  };
};
