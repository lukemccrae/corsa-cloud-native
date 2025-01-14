import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
// dotenv necessary here only for local development with `yarn ll`
// this file is referencing environment variables defined in CDK
// the lambda runtime has dotenv in its environment so this may be redundant,
// i am unsure if the dependency overlap will cause issues
import dotenv from 'dotenv';
dotenv.config({path: '../.env'});

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
    S: String;
  };
  TimeZone: {
    S: String;
  };
  Name: {
    S: String;
  };
  LastMileDistance: {
    N: Number;
  };
  ArticleContent: {
    S: String;
  }
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

export const percentageOfPace = (distance: number, secs: number) => {
  return Math.round((1 / distance) * secs);
};

const calcGap = (pace: number, gain: number, loss: number) => {
  // weight gain more than loss for gap, then convert meters to feet
  const weightedVert = (gain + (loss * .2)) * 3.28084
  // if gain is positive use pacing formula
  if (weightedVert >= 0) {
    // divide weighted gain exponent by 100 for pacing equation
    const gainExponent = weightedVert / 100;
    const gap = pace / Math.pow(1.1, gainExponent)

    return Math.round(gap);
  } else {
    // pacing formula seems to break for downhill splits
    // not sure how to effectively modify pace for downhill splits, just subtracting for now
    return Math.round(pace - weightedVert);
  }
}

const calcLastMileGap = (pace: number, gain: number, loss: number, lmd: number) => {
  const percentPace = percentageOfPace(lmd, pace)
  return calcGap(percentPace, gain, loss)
}

// big scary
const parsePlans = (plans: [DbPlan]) => {
  let cumulativeGain = 0;
  let cumulativeLoss = 0;
  let duration = 0;
  return plans.map((plan: DbPlan) => ({
    id: plan.BucketKey.S,
    articleContent: plan.ArticleContent.S,
    userId: plan.UserId.S,
    name: plan.Name.S,
    startTime: plan.StartTime.S,
    timezone: plan.TimeZone?.S,
    mileData: plan.MileData.L.map((data, i) => {

      duration += parseFloat(plan.Paces.L[i].N.toString());

      let finalMile: boolean = i === plan.MileData.L.length - 1;
      let loss = parseFloat(data.M.elevationLoss.N.toString());
      let gain = parseFloat(data.M.elevationGain.N.toString());
      let pace = parseFloat(plan.Paces.L[i].N.toString());

      cumulativeLoss += loss;
      cumulativeGain += gain;

      return {
        elevationGain: Math.round(
          parseFloat(data.M.elevationGain.N.toString())
        ),
        elevationLoss: Math.round(
          parseFloat(data.M.elevationLoss.N.toString()) // THIS IS SO GROSS
        ),
        mileVertProfile: data.M.gainProfile.L.map((n) => parseInt(n.N)),
        pace: !finalMile ? pace : percentageOfPace(Number(plan.LastMileDistance.N), pace), // Ns are string in the DB...
        stopTime: parseFloat(data.M.stopTime.N),
        gap: !finalMile ? calcGap(pace, gain, loss) : calcLastMileGap(pace, gain, loss, Number(plan.LastMileDistance.N))
      };
    }),
    lastMileDistance: plan.LastMileDistance.N,
    distanceInMiles: plan.MileData.L.length - 1,
    gainInMeters: Math.round(cumulativeGain),
    lossInMeters: Math.round(cumulativeLoss),
    durationInSeconds: Math.round(duration),
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
