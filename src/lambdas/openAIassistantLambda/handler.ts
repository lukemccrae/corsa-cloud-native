import { GetParametersCommandOutput, SSM } from '@aws-sdk/client-ssm';
import { chatCompletionAssistant } from './services/assistant.service'

export const handler = async (event: any, context: any): Promise<any> => {
  // retrieve parameters
  try {
    const ssm = new SSM({ region: 'us-west-1' });

    const result: GetParametersCommandOutput = await ssm.getParameters({
      Names: ['ASSISTANT_API_KEY'],
      WithDecryption: true
    });

    if (
      !result ||
      !result.Parameters ||
      !result.Parameters[0].Value
    )
      throw new Error('Retrieval of SSM parameters failed');

    const workoutPlan = await chatCompletionAssistant(event.arguments, result.Parameters[0].Value)
    console.log(workoutPlan, '<< workout plan')

  } catch (err) {
    console.error('Error retrieving parameter:', err);
    throw err;
  }
};
