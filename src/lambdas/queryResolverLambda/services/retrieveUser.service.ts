import { DynamoDBClient, QueryCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
// dotenv necessary here only for local development with `yarn ll`
// this file is referencing environment variables defined in CDK
// the lambda runtime has dotenv in its environment so this may be redundant,
// i am unsure if the dependency overlap will cause issues
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

interface GetUserByUsernameArgs {
    username: string;
}

export const getUserByUsername = async (args: GetUserByUsernameArgs): Promise<any> => {
    console.log(args, '<< args')
    const client = new DynamoDBClient({ region: 'us-west-1' });
    const { username } = args;

    const queryCommand = new QueryCommand({
        TableName: "UserTable",
        KeyConditionExpression: 'Username = :username',
        ExpressionAttributeValues: {
            ':username': { S: username }
        }
    });

    try {
        const userResult = await client.send(queryCommand);
        if (userResult.Items === undefined) return [];

        const user = JSON.parse(JSON.stringify(userResult.Items[0]));
        //   this should fulfill the user schema
        const userMapped = {
            profilePicture: user.profilePicture.S,
            username: user.Username.S

        }
        return userMapped;
    } catch (e) {
        console.log(e, '<< error getPlanById');
    }
}
