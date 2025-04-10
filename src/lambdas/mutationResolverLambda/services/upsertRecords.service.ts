import {
  UpdatedPlan,
  UpdatedArticle,
  PublishedPlan,
  ArticleElement,
  PaceTable,
  Text
} from '../types';
import {
  DynamoDBClient,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import DynamoDB = require('aws-sdk/clients/dynamodb');

interface UpdatePlanProps {
  sortKey: string;
  userId: string;
  startTime: number;
  planName: string;
  paces: number[];
  articleContent: any;
}

interface UpdateArticleProps {
  slug: string;
  userId: string;
  articleElements: string;
  planName: string;
}

interface PublishPlanProps {
  bucketKey: string;
  userId: string;
  published: boolean;
}

interface createPlanFromGeoJsonArgs {
  gpxId: string;
  userId: string;
}

const client = new DynamoDBClient({ region: 'us-west-1' });

export const publishPlan = async (
  props: PublishPlanProps
): Promise<PublishedPlan> => {
  const { published, bucketKey, userId } = props;
  const command = new UpdateItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      UserId: { S: userId },
      BucketKey: { S: bucketKey }
    },
    // This is analogous to a SQL statement
    UpdateExpression: 'SET #Published = :published',
    // This ties the passed values to the DB variables
    ExpressionAttributeNames: {
      '#Published': 'Published'
    },
    // This passes the values to the write operation
    ExpressionAttributeValues: {
      ':published': { BOOL: published }
    }
  });

  try {
    // console.log(command, '<< command')
    const response = await client.send(command);
    if (response.$metadata.httpStatusCode === 200)
      return {
        success: true
      };
    throw new Error('Publishing the article failed');
  } catch (e) {
    console.log(e, '<< publish article error');
    return {
      success: false
    };
  }
};

export const updateArticleByPlanId = async (
  articleInputArgs: UpdateArticleProps
): Promise<UpdatedArticle> => {
  const { userId, slug, articleElements, planName } = articleInputArgs;

  const parsedElements = JSON.parse(articleElements)


  const isPaceTable = (e: ArticleElement): e is { paceTable: PaceTable, editing: boolean, id: string } =>
    "paceTable" in e;

  const isText = (e: ArticleElement): e is { text: Text, editing: boolean, id: string } => "text" in e;

  const returnProperElement = (element: ArticleElement) => {
    if (isPaceTable(element)) {
      if (!element.paceTable || !Array.isArray(element.paceTable.columns) || !Array.isArray(element.paceTable.miles)) {
        return null; // Return null if paceTable or its properties are invalid
      }
      return {
        M: {
          PaceTable: {
            M: {
              Columns: {
                L: element.paceTable.columns.map((col: string) => ({ S: col })),
              },
              Miles: {
                L: element.paceTable.miles.map((mile: number) => ({ N: mile.toString() })),
              },
            },
          },
          Type: { S: "PACE_TABLE" },
          Id: { S: element.id }
        },
      };
    } else if (isText(element)) {
      return {
        M: {
          Content: { S: `${element.text.content}` },
          Type: { S: "TEXT" },
          Id: { S: element.id }
        }
      }
    }
    return null; // Default case if no match
  };

  const elementsToInsert = parsedElements.map((e: any) => {
    return returnProperElement(e);
  }).filter((item: any): item is DynamoDB.DocumentClient.AttributeValue => item !== null);

  const command = new UpdateItemCommand({
    // TableName: process.env.DYNAMODB_TABLE_NAME,
    TableName: 'CorsaBackendStack-TrackMetadataTable38567A80-1ATS8LGKJ2X2V',
    Key: {
      UserId: { S: userId },
      Slug: { S: slug }
    },
    // This is analogous to a SQL statement
    UpdateExpression: 'SET #ArticleElements = :articleElements, #Name = :name',
    // This ties the passed values to the DB variables
    ExpressionAttributeNames: {
      '#ArticleElements': 'ArticleElements',
      '#Name': 'Name'
    },
    // This passes the values to the write operation
    ExpressionAttributeValues: {
      ':articleElements': { L: elementsToInsert },
      ':name': { S: planName }
    }
  });

  try {
    const response = await client.send(command);
    if (response.$metadata.httpStatusCode === 200)
      return {
        success: true
      };
    throw new Error('Updating the article failed');
  } catch (e) {
    console.log(e, '<< update article error');
    return {
      success: false
    };
  }
};

export const updatePlanById = async (
  planInputArgs: UpdatePlanProps
): Promise<UpdatedPlan> => {
  const { startTime, userId, planName, sortKey, paces, articleContent } =
    planInputArgs;

  const command = new UpdateItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      UserId: { S: userId },
      BucketKey: { S: sortKey }
    },
    // This is analogous to a SQL statement
    UpdateExpression:
      'SET #Name = :name, #StartTime = :startTime, #Paces = :paces, #ArticleContent = :articleContent',
    // This ties the passed values to the DB variables
    ExpressionAttributeNames: {
      '#Name': 'Name',
      '#StartTime': 'StartTime'
      // '#Paces': 'Paces',
    },
    // This passes the values to the write operation
    ExpressionAttributeValues: {
      ':name': { S: planName },
      ':startTime': { N: String(startTime) }
      // ':paces': { L: paces.map((item) => ({ N: String(item) })) }, // paces not changeable for now
    }
  });

  try {
    const response = await client.send(command);
    if (response.$metadata.httpStatusCode === 200)
      return {
        success: true
      };
    throw new Error('Updating the plan failed');
  } catch (e) {
    console.log(e, '<< error');
    return {
      success: false
    };
  }
};
