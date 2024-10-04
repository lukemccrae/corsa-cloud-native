import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { GetParametersCommandOutput, SSM } from '@aws-sdk/client-ssm';
import dotenv from 'dotenv';
dotenv.config({path: '../.env'});

export const handler = async (event: any, context: any): Promise<any> => {
  // retrieve parameters
  try {
    const ssm = new SSM({ region: 'us-west-1' });

    const result: GetParametersCommandOutput = await ssm.getParameters({
      Names: ['ACCESS_KEY_ID', 'SECRET_ACCESS_KEY'],
      WithDecryption: true
    });

    if (
      !result ||
      !result.Parameters ||
      !result.Parameters[0].Value ||
      !result.Parameters[1].Value
    )
      throw new Error('Retrieval of SSM parameters failed');

    const client = new S3Client({
      region: 'us-west-1',
      credentials: {
        accessKeyId: result.Parameters[0].Value,
        secretAccessKey: result.Parameters[1].Value
      }
    });

    const uuid = uuidv4();

    const command = new PutObjectCommand({
      Bucket: process.env.GEO_JSON_BUCKET_NAME,
      Key: uuid
    });

    const url = await getSignedUrl(client, command, { expiresIn: 60 });
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ url, uuid })
    };
  } catch (err) {
    console.error('Error retrieving parameter:', err);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: "There was an error with your request."
    };
  }
};
