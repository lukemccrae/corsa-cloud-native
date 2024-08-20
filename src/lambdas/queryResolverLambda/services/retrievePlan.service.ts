import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

type NumberObject = {
  N: string;
};

type NumberArray = {
  L: NumberObject[];
};

type dbMileData = {
  M: {
    elevationGain: {
      N: Number;
    };
    elevationLoss: {
      N: Number;
    };
    gainProfile: NumberArray;
    stopTime: {
      N: string;
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
  LastMileDistance: {
    N: Number;
  };
};

export const getPlanById = async (args: any): Promise<any> => {
  const client = new DynamoDBClient({ region: 'us-west-1' });
  const { planId } = args;
  const tableName = String(process.env.DYNAMODB_TABLE_NAME);

  const queryCommand = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'BucketKey = :planId',
    ExpressionAttributeValues: {
      ':BucketKey': { S: planId }
    }
  });

  try {
    const result = await client.send(queryCommand);
    if (result.Items === undefined) return [];

    //not sure why this is necessary
    const plan = JSON.parse(JSON.stringify(result.Items));

    console.log(JSON.stringify(plan));

    return plan;
  } catch (e) {
    console.log(e, '<< error batch get');
  }

}

export const getPlansByUserId = async (args: any): Promise<any> => {
  const client = new DynamoDBClient({ region: 'us-west-1' });

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

    console.log(JSON.stringify(plans));

    return plans.map((plan: DbPlan) => ({
      id: plan.BucketKey.S,
      userId: plan.UserId.S,
      name: plan.Name.S,
      startTime: plan.StartTime.N,
      mileData: plan.MileData.L.map((data, i) => {
        console.log(JSON.stringify(data), '<< plan')

        return {
          elevationGain: Math.round(
            parseFloat(data.M.elevationGain.N.toString())
          ),
          elevationLoss: Math.round(
            parseFloat(data.M.elevationLoss.N.toString()) // THIS IS SO GROSS
          ),
          mileVertProfile: data.M.gainProfile.L.map((n) => parseInt(n.N)),
          pace: parseFloat(plan.Paces.L[i].N.toString()), // Ns are string in the DB...
          stopTime: parseFloat(data.M.stopTime.N)
        };
      }),
      lastMileDistance: plan.LastMileDistance.N
    }));
  } catch (e) {
    console.log(e, '<< error batch get');
  }
};
