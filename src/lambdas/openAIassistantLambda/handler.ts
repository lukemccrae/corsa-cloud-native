import { GetParametersCommandOutput, SSM } from '@aws-sdk/client-ssm';
import { chatCompletionAssistant } from './services/assistant.service';
import dotenv from 'dotenv';
dotenv.config({path: '../.env'});


export const handler = async (event: any, context: any): Promise<any> => {
  // If running locally with `yarn ll` use a different field from the event
  const isLocal = (process.env.LOCAL === 'true') || false;
  const currentEvent = isLocal ? event.body : event;
  // retrieve parameters
  try {
    const ssm = new SSM({ region: 'us-west-1' });

    const ssmResult: GetParametersCommandOutput = await ssm.getParameters({
      Names: ['ASSISTANT_API_KEY'],
      WithDecryption: true
    });

    if (
      !ssmResult ||
      !ssmResult.Parameters ||
      !ssmResult.Parameters[0].Value
    )
      throw new Error('Retrieval of SSM parameters failed');
    
    const promptBody: { messages: string[] } = JSON.parse(currentEvent.body)

    if (!promptBody || !promptBody.messages) throw new Error('Prompt messages not received in request')
    
    const assistantResponse = await chatCompletionAssistant(promptBody.messages, ssmResult.Parameters[0].Value)
    
    if(!assistantResponse || !assistantResponse.choices) {
      throw new Error('There was a problem with the Assistant API response')
    }
    
    console.log(assistantResponse.choices, '<< wp')
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(assistantResponse.choices[0])
    };
  } catch (err) {
    console.error('Error retrieving parameter:', err);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: "There was an error."
    };
  }
};
