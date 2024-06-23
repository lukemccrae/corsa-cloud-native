
import {
  createPlanFromGeoJson
} from './services/upsertRecords.service';

export const handler = async (event: any, context: any): Promise<any> => {
  // export const handler = async (localevent: any, context: any): Promise<any> => {
  //   const event = localevent.body;
  try {
    if (event.info.parentTypeName === 'Mutation') {
      switch (event.info.fieldName) {
        // strava integration not working on new site
        // case 'createPlanFromActivity':
        //   return await createPlanFromActivity(event.arguments);
        case 'createPlanFromGeoJson':
          return await createPlanFromGeoJson(event.arguments);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
