import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

type dbMileData = {
  M: {
    elevationGain: {
      N: Number;
    };
    elevationLoss: {
      N: Number;
    };
  };
};

type DbPlan = {
  MileData: {
    L: dbMileData[];
  };
  Paces: {
    L: [{ N: Number }];
  };
  BucketKey: {
    S: String;
  };
  UserId: {
    S: String;
  };
  StartTime: {
    N: Number;
  };
  Name: {
    S: String;
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
    const plans = JSON.parse(JSON.stringify(result.Items));

    return plans.map((plan: DbPlan) => ({
      id: plan.BucketKey.S,
      userId: plan.UserId.S,
      name: plan.Name.S,
      startTime: plan.StartTime.N,
      mileData: plan.MileData.L.map((data, i) => {
        return {
          elevationGain: data.M.elevationGain.N,
          elevationLoss: data.M.elevationLoss.N,
          // type cast to attibute value so we can access the N field
          pace: plan.Paces.L[i].N
        };
      })
    }));
  } catch (e) {
    console.log(e, '<< error batch get');
  }
};
