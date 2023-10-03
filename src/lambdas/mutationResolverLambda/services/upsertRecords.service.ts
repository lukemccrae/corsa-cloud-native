import { stravaGetHttpClient } from '../../clients/httpClient'
import { makeGeoJson } from '../helpers/geoJson.helper'
import { type CreatedPlan } from '../types'

interface CreatePlanProps {
  activityId: string
  token: string
}

export const upsertActivityById = (): any => {
  return {}
}

export const updatePlanById = (): any => {
  return {}
}

export const createPlanFromActivity = async (props: CreatePlanProps): Promise<CreatedPlan> => {
  const { token } = props
  const url = `https://www.strava.com/api/v3/activities/${props.activityId}/streams?keys=latlng,altitude&key_by_type=true`
  console.log(url, '<< url')
  console.log(token, '<< token')
  try {
    const latLngAltitudeStream = await stravaGetHttpClient({ token, url })
    const geoJson = makeGeoJson(latLngAltitudeStream.latlng.data, latLngAltitudeStream.altitude.data)
    console.log(JSON.stringify(geoJson, null, 2), '<< geoJson')

    // upload this to S3
    // set up SQS trigger lambda to write metadata to Dynamo
    // how to pass metadata to lambda?
    // add metadata to the properties of geoJSON
    return { success: true }
  } catch (e) {
    console.log(e, '<< error')
    return { success: false }
  }
}
