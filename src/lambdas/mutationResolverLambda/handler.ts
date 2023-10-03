import { upsertActivityById, updatePlanById, createPlanFromActivity } from './services/upsertRecords.service'

export const handler = async (event: any, context: any): Promise<any> => {
  try {
    if (event.info.parentTypeName === 'Mutation') {
      switch (event.info.fieldName) {
        case 'createPlanFromActivity':
          console.log(event, '< event')
          return await createPlanFromActivity(event.arguments)
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
