import { deletePlanById } from './services/deletePlan.service';
import {
  updatePlanById,
  createPlanFromActivity,
  createPlanFromGpx
} from './services/upsertRecords.service';

export const handler = async (event: any, context: any): Promise<any> => {
  console.log(event, '<< event');
  try {
    if (event.info.parentTypeName === 'Mutation') {
      switch (event.info.fieldName) {
        case 'createPlanFromActivity':
          return await createPlanFromActivity(event.arguments);
        case 'updatePlanById':
          return await updatePlanById(event.arguments.planInput);
        case 'createPlanFromGpx':
          return createPlanFromGpx(event.arguments.planInput);
        case 'deletePlanById':
          return await deletePlanById(event.arguments);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
