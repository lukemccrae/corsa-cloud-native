import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { FeatureCollection } from '../../types';
type RetrieveGeoJsonProps = {
  sortKey: string;
};

const s3Client = new S3Client({ region: 'us-east-1' });

export const getGeoJsonBySortKey = async (
  args: RetrieveGeoJsonProps
): Promise<FeatureCollection> => {
  const { sortKey } = args;

  if (
    process.env.GEO_JSON_BUCKET_NAME == null ||
    process.env.GEO_JSON_BUCKET_NAME === ''
  ) {
    throw new Error('S3 bucket name not provided');
  }

  const command = new GetObjectCommand({
    Bucket: process.env.GEO_JSON_BUCKET_NAME,
    Key: sortKey
  });

  const response = await s3Client.send(command);

  if (response.Body) {
    const streamString = await response.Body.transformToString('utf-8');

    const { features, type } = JSON.parse(streamString);

    return {
      features,
      type
    };
  }
  throw new Error('Error processing GeoJson');
};
