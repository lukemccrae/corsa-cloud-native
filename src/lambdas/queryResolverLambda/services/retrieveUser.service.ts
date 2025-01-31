import { DynamoDBClient, QueryCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
// dotenv necessary here only for local development with `yarn ll`
// this file is referencing environment variables defined in CDK
// the lambda runtime has dotenv in its environment so this may be redundant,
// i am unsure if the dependency overlap will cause issues
import dotenv from 'dotenv';
import { fetchUsersWithUserId, getPlansByUserId } from './retrievePlan.service';
import { User } from '../../types';
dotenv.config({ path: '../.env' });

interface GetUserByUsernameArgs {
    username: string;
}

interface GetPublishedUserInfoArgs {
    username: string;
}

export const getPublishedUserInfo = async (args: GetPublishedUserInfoArgs): Promise<any> => {
    const { username } = args;
    const { profilePicture, userId, bio } = await getUserByUsername({ username })
    const plans = await fetchUsersWithUserId(userId)

    return {
        profilePicture, 
        bio,
        plans
    }
}

export const getUserByUsername = async (args: GetUserByUsernameArgs): Promise<User> => {
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
        if (userResult.Items === undefined) throw new Error(`retrieving userId for ${username} failed`)

        const user = JSON.parse(JSON.stringify(userResult.Items[0]));
        //   this should fulfill the user schema
        const userMapped = {
            profilePicture: user.profilePicture.S,
            bio: user.bio.S,
            userId: user.userId.S,
            Username: user.Username.S
        }
        return userMapped;
    } catch (e) {
        console.log(e, '<< error getPlanById');
        throw new Error("retrieving userId failed")
    }
}
