import { makeMileData } from '../helpers/mileData.helper';
import S3 = require('aws-sdk/clients/s3');
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { type CreatedPlan, UpdatedPlan, UpdatedArticle, PublishedPlan } from '../types';
import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { makeProfilePoints } from '../helpers/vertProfile.helper';
import {
  FeatureCollectionBAD,
} from '../../types';
import { makeMileIndices } from '../helpers/temp.mileIndicesHelper';

interface UpdatePlanProps {
  sortKey: string;
  userId: string;
  startTime: number;
  planName: string;
  paces: number[];
  articleContent: string;
}

interface UpdateArticleProps {
  slug: string;
  userId: string;
  articleContent: string;
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
  props: PublishPlanProps): Promise<PublishedPlan> => {
    const { published, bucketKey, userId} = props;
    const command = new UpdateItemCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        UserId: { S: userId },
        BucketKey: { S: bucketKey }
      },
      // This is analogous to a SQL statement
      UpdateExpression:
        'SET #Published = :published',
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
      console.log(e, '<< error');
      return {
        success: false
      };
    }
}

export const updateArticleByPlanId = async (
  articleInputArgs: UpdateArticleProps
): Promise<UpdatedArticle> => {
  const { userId, slug, articleContent } = articleInputArgs;

  const command = new UpdateItemCommand({
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
      UserId: { S: userId },
      BucketKey: { S: slug }
    },
    // This is analogous to a SQL statement
    UpdateExpression:
      'SET #ArticleContent = :articleContent',
    // This ties the passed values to the DB variables
    ExpressionAttributeNames: {
      '#ArticleContent': 'ArticleContent'
    },
    // This passes the values to the write operation
    ExpressionAttributeValues: {
      ':articleContent': { S: articleContent }
    }
  });

  try {
    // console.log(command, '<< command')
    const response = await client.send(command);
    if (response.$metadata.httpStatusCode === 200)
      return {
        success: true
      };
    throw new Error('Updating the article failed');
  } catch (e) {
    console.log(e, '<< error');
    return {
      success: false
    };
  }
}

export const updatePlanById = async (
  planInputArgs: UpdatePlanProps
): Promise<UpdatedPlan> => {
  const { startTime, userId, planName, sortKey, paces, articleContent } = planInputArgs;

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
      '#StartTime': 'StartTime',
      // '#Paces': 'Paces',
    },
    // This passes the values to the write operation
    ExpressionAttributeValues: {
      ':name': { S: planName },
      ':startTime': { N: String(startTime) },
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

