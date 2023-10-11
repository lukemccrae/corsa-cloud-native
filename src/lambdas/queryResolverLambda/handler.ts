import {
  getActivityById,
  getActivities,
} from "./services/retrieveActivity.service";
import { getPlansByUserId } from "./services/retrievePlan.service";

export const handler = async (event: any, context: any): Promise<any> => {
  try {
    console.log(event, "< event");
    if (event.info.parentTypeName === "Query") {
      switch (event.info.fieldName) {
        case "getActivityById":
          return getActivityById();
        case "getActivities":
          return await getActivities(event.arguments);
        case "getPlansByUserId":
          return await getPlansByUserId(event.arguments);
      }
    }
  } catch (e) {
    console.log(e);
  }
};
