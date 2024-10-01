import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
// dotenv necessary here only for local development with `yarn ll`
// this file is referencing environment variables defined in CDK
// the lambda runtime has dotenv in its environment so this may be redundant,
// i am unsure if the dependency overlap will cause issues
import dotenv from 'dotenv';
dotenv.config();

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
  const { planId, userId } = args;
  const tableName = String(process.env.DYNAMODB_TABLE_NAME);

  const queryCommand = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'UserId = :userId AND BucketKey = :planId',
    ExpressionAttributeValues: {
      ':userId': { S: userId },  // Partition key
      ':planId': { S: planId } // Sort key
    }
  });

  try {
    const planResult = await client.send(queryCommand);
    if (planResult.Items === undefined) return [];

    //not sure why this is necessary
    const plan = JSON.parse(JSON.stringify(planResult.Items));
    const result = parsePlans(plan)[0];

    return result;
  } catch (e) {
    console.log(e, '<< error getPlanById');
  }
}

const parsePlans = (plans: [DbPlan]) => {
  return plans.map((plan: DbPlan) => ({
    id: plan.BucketKey.S,
    userId: plan.UserId.S,
    name: plan.Name.S,
    startTime: plan.StartTime.N,
    mileData: plan.MileData.L.map((data, i) => {
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

    return parsePlans(plans)
  } catch (e) {
    console.log(e, '<< error batch get getPlansByUserId');
  }
};
