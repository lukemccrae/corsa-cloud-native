import { stravaGetHttpClient } from '../../clients/httpClient'
import { makeGeoJson } from '../helpers/geoJson.helper'
import S3 = require('aws-sdk/clients/s3')
import { type CreatedPlan } from '../types'
import { v4 as uuidv4 } from 'uuid'

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

    const s3 = new S3()

    if (process.env.GEO_JSON_BUCKET_NAME == null || process.env.GEO_JSON_BUCKET_NAME === '') {
      throw new Error('S3 bucket name not provided')
    }

    const params = {
      Bucket: process.env.GEO_JSON_BUCKET_NAME,
      Key: uuidv4(),
      Body: JSON.stringify(geoJson)
    }

    console.log(params, '<< params')

    const s3Result = s3.putObject(params, (err, data) => {
      console.log(err, '<< err')
      console.log(data, '<< data')
      // TODO checking for error like this feels weird
      if (err.code != null) {
        console.error('Error uploading to S3:', err)
        throw new Error(`Error uploading to S3: ${err.message}`)
      } else {
        console.log('File uploaded to S3:', data)
      }
    })
    console.log(s3Result, '<< s3Result')
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
