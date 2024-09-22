import { Omics } from 'aws-sdk';
import {
  getActivityById,
  getActivities
} from './services/retrieveActivity.service';
import { getGeoJsonBySortKey } from './services/retrieveGeoJson.service';
import { getPlansByUserId } from './services/retrievePlan.service';
import { getPlanById } from './services/retrievePlan.service'

export const handler = async (event: any, context: any): Promise<any> => {
  // export const handler = async (localevent: any, context: any): Promise<any> => {
  //   const event = localevent.body;
  try {
    console.log(event, '< event');
    if (event.info.parentTypeName === 'Query') {
      switch (event.info.fieldName) {
        case 'getActivityById':
          return getActivityById();
        case 'getActivities':
          return await getActivities(event.arguments);
        case 'getPlansByUserId':
          return await getPlansByUserId(event.arguments);
        case 'getGeoJsonBySortKey':
          return await getGeoJsonBySortKey(event.arguments);
        case 'getPlanById':
          return await getPlanById(event.arguments)
      }
    }
  } catch (e) {
    console.log(e);
  }
};
