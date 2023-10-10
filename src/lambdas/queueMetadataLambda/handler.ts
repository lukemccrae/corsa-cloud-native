// import { DynamoDBClient, ListBackupsCommand } from '@aws-sdk/client-dynamodb'

export const handler = async (event: any): Promise<any> => {
  try {
    const { Bucket, Key } = JSON.parse(event.Records[0].body)
    await writeMetadataToDynamo(Bucket, Key)
  } catch (e) {
    console.log(e)
  }
}

export const writeMetadataToDynamo = async (Bucket: string, Key: string): Promise<void> => {
  console.log(Bucket, Key, '<< log')
  // const client = new DynamoDBClient({ region: 'us-east-1' })
  // // Bucket, Key
  // // Dynamo things

  // const params = {
  //   /** input parameters */
  // }
  // const command = new ListBackupsCommand(params)

  // try {
  //   const data = await client.send(command)
  //   // process data.
  // } catch (error) {
  //   // error handling.
  // } finally {
  //   // finally.
  // }
}
