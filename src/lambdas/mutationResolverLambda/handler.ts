import { deletePlanById } from './services/deletePlan.service';
import {
  updatePlanById,
  updateArticleByPlanId,
  publishPlan
} from './services/upsertRecords.service';
import dotenv from 'dotenv';
dotenv.config({path: "../.env"});

export const handler = async (event: any, context: any): Promise<any> => {
  console.log("handler")
  const isLocal = (process.env.LOCAL === 'true') || false;
  const currentEvent = isLocal ? event.body : event;

  try {
    if (currentEvent.info.parentTypeName === 'Mutation') {
      switch (currentEvent.info.fieldName) {
        case 'updatePlanById':
          return await updatePlanById(currentEvent.arguments.planInput);
        case 'deletePlanById':
          return await deletePlanById(currentEvent.arguments);
        case 'updateArticleByPlanId':
          return await updateArticleByPlanId(currentEvent.arguments);
        case 'publishPlan':
          return await publishPlan(currentEvent.arguments);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
