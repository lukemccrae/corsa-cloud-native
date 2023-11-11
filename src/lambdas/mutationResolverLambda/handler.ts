import {
  updatePlanById,
  createPlanFromActivity,
  createPlanFromGpx
} from './services/upsertRecords.service';

export const handler = async (event: any, context: any): Promise<any> => {
  try {
    if (event.info.parentTypeName === 'Mutation') {
      switch (event.info.fieldName) {
        case 'createPlanFromActivity':
          return await createPlanFromActivity(event.arguments);
        case 'updatePlanById':
          return await updatePlanById(event.arguments.planInput);
        case 'createPlanFromGpx':
          return await createPlanFromGpx(event.arguments.planInput);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
