
import {
  createPlanFromGeoJson
} from './services/upsertRecords.service';
import dotenv from 'dotenv';
dotenv.config({path: '../.env'});


export const handler = async (event: any, context: any): Promise<any> => {
  // If running locally with `yarn ll` use a different field from the event
  const isLocal = (process.env.LOCAL === 'true') || false;
  const currentEvent = isLocal ? event.body : event;

  try {
    if (currentEvent.info.parentTypeName === 'Mutation') {
      switch (currentEvent.info.fieldName) {
        // strava integration not working on new site
        // case 'createPlanFromActivity':
        //   return await createPlanFromActivity(event.arguments);
        case 'createPlanFromGeoJson':
          return await createPlanFromGeoJson(currentEvent.arguments);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
