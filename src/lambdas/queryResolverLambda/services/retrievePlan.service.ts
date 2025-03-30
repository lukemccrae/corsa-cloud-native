import {
  DynamoDBClient,
  QueryCommand,
  ScanCommand
} from '@aws-sdk/client-dynamodb';
// dotenv necessary here only for local development with `yarn ll`
// this file is referencing environment variables defined in CDK
// the lambda runtime has dotenv in its environment so this may be redundant,
// i am unsure if the dependency overlap will cause issues
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

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

type TextElement = {
  __typename: "TextElement";
  text: {
    content: string
  };
};

type ImageElement = {
  __typename: "ImageElement";
  url: string;
};

type PaceTableElement = {
  __typename: "PaceTableElement";
  paceTable: {
    columns: string[];
    miles: number[];
  };
};

type ArticleElement = TextElement | ImageElement | PaceTableElement;

type DbPlan = {
  UserId: {
    S: String;
  };
  Slug: {
    S: String;
  };
  BucketKey: {
    S: String;
  };
  Id: {
    S: String;
  }
  StartTime: {
    S: String;
  };
  TimeZone: {
    S: String;
  };
  Name: {
    S: String;
  };
  MileData: {
    L: dbMileData[];
  };
  Paces: {
    L: [{ N: Number }];
  };
  LastMileDistance: {
    N: Number;
  };
  ArticleContent: {
    S: String;
  };
  Published: {
    BOOL: Boolean;
  };
  CoverImage: {
    S: String;
  };
  Author: {
    S: String;
  };
  ProfilePhoto: {
    S: String;
  };
  PublishDate: {
    S: String;
  };
  ArticleElements: {
    L: ArticleElement[]
  }
};

export const getPublishedPlans = async (): Promise<any> => {
  const client = new DynamoDBClient({ region: 'us-west-1' });
  // const tableName = String(process.env.DYNAMODB_TABLE_NAME);
  const tableName =
    'CorsaBackendStack-TrackMetadataTable38567A80-1ATS8LGKJ2X2V';

  const scanCommand = new ScanCommand({
    TableName: tableName,
    FilterExpression: 'Published = :published',
    ExpressionAttributeValues: {
      ':published': { BOOL: true }
    }
  });

  try {
    const planResults = await client.send(scanCommand);
    if (planResults.Items === undefined) return [];

    // console.log(JSON.stringify(planResults.Items, null, 2), '<< results')
    // const plans = planResults.Items?.map(item => unmarshall(item)) as DbPlan[];
    const result = parsePlans(planResults.Items as unknown as DbPlan[]);
    return result;
  } catch (e) {
    console.log(e, '<< error getPublishedPlans');
  }
};

export const getPlanById = async (args: any): Promise<any> => {
  const client = new DynamoDBClient({ region: 'us-west-1' });
  const { slug } = args;

  const userId = await retrieveUserIdWithUsername(args.userId, client);

  // const tableName = String(process.env.DYNAMODB_TABLE_NAME);
  const tableName =
    'CorsaBackendStack-TrackMetadataTable38567A80-1ATS8LGKJ2X2V';

  if (!userId) throw new Error('fetching userId failed');
  const queryCommand = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: 'UserId = :userId AND Slug = :slug',
    ExpressionAttributeValues: {
      ':userId': { S: userId }, // Partition key
      ':slug': { S: slug } // Sort key
    }
  });

  try {
    const planResult = await client.send(queryCommand);
    if (planResult.Items === undefined) return [];

    //not sure why this is necessary
    const plan = JSON.parse(JSON.stringify(planResult.Items));
    const result = parsePlans(plan)[0];
    console.log(JSON.stringify(result), '<< res')

    return result;
  } catch (e) {
    console.log(e, '<< error getPlanById');
  }
};

export const percentageOfPace = (distance: number, secs: number) => {
  return Math.round((1 / distance) * secs);
};

const retrieveUserIdWithUsername = async (
  username: string,
  client: DynamoDBClient
): Promise<string | null> => {
  const queryCommand = new QueryCommand({
    TableName: 'UserTable',
    KeyConditionExpression: 'Username = :username',
    ExpressionAttributeValues: {
      ':username': { S: username }
    }
  });

  try {
    // Execute the query operation
    const result = await client.send(queryCommand);
    // Ensure that there are items in the result
    if (!result.Items?.length) {
      console.log(`No user found for username: ${username}`);
      return null;
    }

    const userId = result.Items[0].userId?.S;
    if (!userId) {
      console.log(`No userId found for username: ${username}`);
      return null;
    }

    return userId; // Return the userId
  } catch (e) {
    console.error(`Error retrieving userId for username: ${username}`, e);
    return null; // Return null on error
  }
};

const calcGap = (pace: number, gain: number, loss: number) => {
  // weight gain more than loss for gap, then convert meters to feet
  const weightedVert = (gain + loss * 0.2) * 3.28084;
  // if gain is positive use pacing formula
  if (weightedVert >= 0) {
    // divide weighted gain exponent by 100 for pacing equation
    const gainExponent = weightedVert / 100;
    const gap = pace / Math.pow(1.1, gainExponent);

    return Math.round(gap);
  } else {
    // pacing formula seems to break for downhill splits
    // not sure how to effectively modify pace for downhill splits, just subtracting for now
    return Math.round(pace - weightedVert);
  }
};

const calcLastMileGap = (
  pace: number,
  gain: number,
  loss: number,
  lmd: number
) => {
  const percentPace = percentageOfPace(lmd, pace);
  return calcGap(percentPace, gain, loss);
};

// big scary
const parsePlans = (plans: DbPlan[]) => {
  console.log(JSON.stringify(plans[0].ArticleElements, null, 2))
  let cumulativeGain = 0;
  let cumulativeLoss = 0;
  let duration = 0;
  return plans.map((plan: DbPlan) => ({
    slug: plan.Slug.S,
    bucketKey: plan.BucketKey.S,
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
        pace: !finalMile
          ? pace
          : percentageOfPace(Number(plan.LastMileDistance.N), pace), // Ns are string in the DB...
        stopTime: parseFloat(data.M.stopTime.N),
        gap: !finalMile
          ? calcGap(pace, gain, loss)
          : calcLastMileGap(pace, gain, loss, Number(plan.LastMileDistance.N))
      };
    }),
    lastMileDistance: plan.LastMileDistance.N,
    distanceInMiles: plan.MileData.L.length - 1,
    gainInMeters: Math.round(cumulativeGain),
    lossInMeters: Math.round(cumulativeLoss),
    durationInSeconds: Math.round(duration),
    published: plan.Published.BOOL,
    coverImage: plan.CoverImage.S,
    profilePhoto: plan.ProfilePhoto.S,
    author: plan.Author.S,
    publishDate: plan.PublishDate.S,
    articleElements: plan.ArticleElements?.L?.map((element: any) => {
      const type = element.M.Type.S; // Identify type  
      if (type === "TEXT") {
        return {
          __typename: "TextElement",
          id: element.M.Id.S,
          text: {
            content: element.M.Content?.S || "",
          }
        } as TextElement;
      }
  
      if (type === "IMAGE") {
        return {
          id: element.M.Id.S,
          __typename: "ImageElement",
          url: element.M.Url?.S || "",
        } as ImageElement;
      }
  
      if (type === "PACE_TABLE") {
        return {
          id: element.M.Id.S,
          __typename: "PaceTableElement",
          paceTable: {
            columns: element.M.PaceTable.M.Columns.L.map((col: any) => col.S),
            miles: element.M.PaceTable.M.Miles.L.map((mile: any) => Number(mile.N)), // Convert to number

          },
        } as PaceTableElement;
      }
      throw new Error(`Unknown article element type: ${type}`);
    })
  }));
};

// this method is used by handler for requests that need to retrieve the userId with username
export const getPlansByUserId = async (args: any): Promise<any> => {
  const client = new DynamoDBClient({ region: 'us-west-1' });

  const userId = await retrieveUserIdWithUsername(args.userId, client);
  if (!userId) throw new Error('fetching userId failed');
  const result = fetchUsersWithUserId(userId);

  return result;

  // const tableName = String(process.env.DYNAMODB_TABLE_NAME);
  // console.log(tableName)
};

// this method retrieves the users and takes a userId arg
// This fetcher logic exists in its own method because some code paths have the userId and don't need to fetch it first
export const fetchUsersWithUserId = async (userId: string) => {
  const client = new DynamoDBClient({ region: 'us-west-1' });
  const tableName =
    'CorsaBackendStack-TrackMetadataTable38567A80-1ATS8LGKJ2X2V';

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
    return parsePlans(plans);
  } catch (e) {
    console.log(e, '<< error batch get getPlansByUserId');
  }
};
