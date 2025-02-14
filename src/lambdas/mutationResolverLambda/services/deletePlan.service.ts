import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import S3 = require('aws-sdk/clients/s3');

const client = new DynamoDBClient({ region: 'us-west-1' });
const s3 = new S3({ region: 'us-west-1' });

interface DeletePlanArgs {
  slug: string;
  userId: string;
  bucketKey: string;
}

const checkPublicPlan = async (userId: string, slug: string) => {
  // const queryCommand = new QueryCommand({
  //   TableName: tableName,
  //   KeyConditionExpression: 'UserId = :userId AND Slug = :slug',
  //   ExpressionAttributeValues: {
  //     ':userId': { S: userId },  // Partition key
  //     ':slug': { S: slug } // Sort key
  //   }
  // });
};

export const deletePlanById = async (args: DeletePlanArgs) => {
  if (
    process.env.DYNAMODB_TABLE_NAME == null ||
    process.env.DYNAMODB_TABLE_NAME === ''
  ) {
    throw new Error('Dynamo table name not provided');
  }

  if (
    process.env.GEO_JSON_BUCKET_NAME == null ||
    process.env.GEO_JSON_BUCKET_NAME === ''
  ) {
    throw new Error('S3 bucket name not provided');
  }

  // dont delete public plan
  // const isPubLicPlan = await checkPublicPlan(userId, slug)

  const input = {
    Key: {
      Slug: {
        S: args.slug
      },
      UserId: {
        S: args.userId
      }
    },
    TableName: process.env.DYNAMODB_TABLE_NAME
  };

  try {
    const command = new DeleteItemCommand(input);
    await client.send(command);

    const bucketParams = {
      Bucket: process.env.GEO_JSON_BUCKET_NAME,
      Key: args.bucketKey
    };

    async function deleteFromS3(
      bucketParams: S3.DeleteObjectRequest
    ): Promise<void> {
      try {
        const data = await s3.deleteObject(bucketParams).promise();
        console.log('File uploaded to S3:', data);
      } catch (error) {
        console.error('Error uploading to S3:', error);
      }
    }

    await deleteFromS3(bucketParams);

    return { success: true };
  } catch (e) {
    console.log(e), '<< error deleting';
    return { success: false };
  }
};
