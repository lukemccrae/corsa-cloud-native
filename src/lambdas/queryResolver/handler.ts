// import { getActivityById, getAllActivities, getPlanByActivityId } from './services'

export const handler = async (event: any, context: any): Promise<any> => {
  try {
    console.log(event, '< event')
    if (event.info.parentTypeName === 'Query') {
      switch (event.info.fieldName) {
        // case 'getActivityById':
        //   return {
        //     id: '56789',
        //     name: 'Race',
        //     distance: 50.0,
        //     date: '56789'
        //   }
        // return await getActivityById()
        case 'getAllActivities':
          console.log(event.info.fieldName, '< event.info.fieldName')
          return [{
            id: '56789',
            name: 'Race',
            distance: 50.0,
            date: '56789'
          }]
          // return await getAllActivities()
        case 'getPlanByActivityId':
          console.log(event.info.fieldName, '< event.info.fieldName')
          return {
            id: '123',
            name: 'String',
            startTime: 'date string',
            goalHours: 5,
            goalMinutes: 5,
            mileData: [{
              elevationGain: 5,
              elevationLoss: 5,
              pace: 50,
              time: 50
            }]
          }
          // return await getPlanByActivityId()
      }
    }
  } catch (e) {
    console.log(e)
  }
}
