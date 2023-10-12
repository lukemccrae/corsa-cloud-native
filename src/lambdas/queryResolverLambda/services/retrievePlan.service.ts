import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { Plan } from '../types';

type dbMileData = {
  elevationGain: {
    N: number;
  };
  elevationLoss: {
    N: Number;
  };
  pace: {
    N: number;
  };
  time: {
    S: String;
  };
  elevationProfile: {
    L: [number];
  };
};

type DbPlan = {
  MileData: {
    L: [dbMileData];
  };
  BucketKey: {
    S: string;
  };
  UserId: {
    S: string;
  };
  StartTime: {
    S: String;
  };
  Name: {
    S: string;
  };
};

export const getPlansByUserId = async (args: any): Promise<any> => {
  const client = new DynamoDBClient({ region: 'us-east-1' });

  const { userId } = args;

  const tableName = String(process.env.DYNAMODB_TABLE_NAME);

  const queryCommand = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'UserId = :userId',
    ExpressionAttributeValues: {
      ':userId': { S: userId }
    }
  });

  try {
    // Execute the BatchGetItem operation
    const result = await client.send(queryCommand);
    if (result.Items === undefined) return [];

    //not sure why this is necessary
    const items = JSON.parse(JSON.stringify(result.Items));

    console.log(items, '<< items');

    return items.map((i: DbPlan) => ({
      id: i.BucketKey.S,
      userId: i.UserId.S,
      name: i.Name.S,
      startTime: i.StartTime.S,
      mileData: i.MileData.L.map((i) => ({
        elevationGain: i.elevationGain.N ?? null,
        elevationLoss: i.elevationLoss.N ?? null,
        pace: i.pace.N ?? null,
        time: i.time.S ?? null
      }))
    }));
  } catch (e) {
    console.log(e, '<< error batch get');
  }

  // return {
  //   id: '123',
  //   name: 'String',
  //   startTime: 'date string',
  //   goalHours: 5,
  //   goalMinutes: 5,
  //   mileData: [
  //     {
  //       elevationGain: 5,
  //       elevationLoss: 5,
  //       pace: 50,
  //       time: 50
  //     }
  //   ]
  // };
};
