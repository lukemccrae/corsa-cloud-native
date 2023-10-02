import { upsertActivityById, updatePlanById, createPlanFromActivity } from './services/upsertRecords.service'

export const handler = async (event: any, context: any): Promise<any> => {
  try {
    console.log(event, '< event')
    if (event.info.parentTypeName === 'Mutation') {
      switch (event.info.fieldName) {
        case 'createPlan':
          return createPlanFromActivity()
        case 'upsertActivity':
          return upsertActivityById()
        case 'updatePlan':
          return updatePlanById()
      }
    }
  } catch (e) {
    console.log(e)
  }
}
