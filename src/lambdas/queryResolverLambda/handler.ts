import {
  getActivityById,
  getActivities
} from './services/retrieveActivity.service';
import { getGeoJsonBySortKey } from './services/retrieveGeoJson.service';
import { getPlansByUserId } from './services/retrievePlan.service';
import { getPlanById } from './services/retrievePlan.service';
import dotenv from 'dotenv';
dotenv.config({path: '../.env'});

export const handler = async (event: any, context: any): Promise<any> => {
  try {
    // If running locally with `yarn ll` use a different field from the event
    const isLocal = (process.env.LOCAL === 'true') || false;
    const currentEvent = isLocal ? event.body : event;

    if (currentEvent.info.parentTypeName === 'Query') {
      switch (currentEvent.info.fieldName) {
        case 'getActivityById':
          return getActivityById();
        case 'getActivities':
          return await getActivities(currentEvent.arguments);
        case 'getPlansByUserId':
          return await getPlansByUserId(currentEvent.arguments);
        case 'getGeoJsonBySortKey':
          return await getGeoJsonBySortKey(currentEvent.arguments);
        case 'getPlanById':
          return await getPlanById(currentEvent.arguments)
      }
    }
  } catch (e) {
    console.log(e);
  }
};
