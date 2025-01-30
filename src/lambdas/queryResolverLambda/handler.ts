import { getGeoJsonByBucketKey } from './services/retrieveGeoJson.service';
import { getPlanById, getPublishedPlans, getPlansByUserId } from './services/retrievePlan.service';
import dotenv from 'dotenv';
import { getUserByUsername } from './services/retrieveUser.service';
dotenv.config({path: '../.env'});

export const handler = async (event: any, context: any): Promise<any> => {
  try {
    // If running locally with `yarn ll` use a different field from the event
    const isLocal = (process.env.LOCAL === 'true') || false;
    const currentEvent = isLocal ? event.body : event;

    if (currentEvent.info.parentTypeName === 'Query') {
      switch (currentEvent.info.fieldName) {
        case 'getPlansByUserId':
          return await getPlansByUserId(currentEvent.arguments);
        case 'getGeoJsonByBucketKey':
          return await getGeoJsonByBucketKey(currentEvent.arguments);
        case 'getPlanById':
          return await getPlanById(currentEvent.arguments);
        case 'getPublishedPlans':
          return await getPublishedPlans(); 
        case 'getUserByUsername':
          return await getUserByUsername(currentEvent.arguments); 
      }
    }
  } catch (e) {
    console.log(e);
  }
};
