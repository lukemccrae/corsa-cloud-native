import { deletePlanById } from './services/deletePlan.service';
import {
  updatePlanById,
  // createPlanFromActivity,
  createPlanFromGeoJson,
  updateArticleByPlanId
} from './services/upsertRecords.service';
import dotenv from 'dotenv';
dotenv.config({path: "../.env"});

export const handler = async (event: any, context: any): Promise<any> => {
  const isLocal = (process.env.LOCAL === 'true') || false;
  const currentEvent = isLocal ? event.body : event;
  console.log(event, '<< current event')

  try {
    if (currentEvent.info.parentTypeName === 'Mutation') {
      switch (currentEvent.info.fieldName) {
        // strava integration not working on new site
        // case 'createPlanFromActivity':
        //   return await createPlanFromActivity(event.arguments);
        // case 'createPlanFromGeoJson':
        //   return await createPlanFromGeoJson(event.arguments);
        case 'updatePlanById':
          return await updatePlanById(currentEvent.arguments.planInput);
        case 'deletePlanById':
          return await deletePlanById(currentEvent.arguments);
        case 'updateArticleByPlanId':
          return await updateArticleByPlanId(currentEvent.arguments);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
