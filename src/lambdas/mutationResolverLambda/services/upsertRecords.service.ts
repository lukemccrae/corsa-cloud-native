import { stravaGetHttpClient } from '../../clients/httpClient'
import { makeGeoJson } from '../helpers/geoJson.helper'
import S3 = require('aws-sdk/clients/s3')
import SQS = require('aws-sdk/clients/sqs')
import { type CreatedPlan } from '../types'
import { v4 as uuidv4 } from 'uuid'

interface CreatePlanProps {
  activityId: string
  token: string
  distance: number
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
  try {
    const latLngAltitudeStream = await stravaGetHttpClient({ token, url })
    const geoJson = makeGeoJson(latLngAltitudeStream.latlng.data, latLngAltitudeStream.altitude.data)

    console.log(geoJson, '<< geoJson')

    const s3 = new S3({ region: 'us-east-1' })

    const sqs = new SQS()

    if (process.env.GEO_JSON_BUCKET_NAME == null || process.env.GEO_JSON_BUCKET_NAME === '') {
      throw new Error('S3 bucket name not provided')
    }

    if (process.env.METADATA_QUEUE_URL == null || process.env.METADATA_QUEUE_URL === '') {
      throw new Error('SQS queue URL not provided')
    }

    const params = {
      Bucket: process.env.GEO_JSON_BUCKET_NAME,
      Key: uuidv4(),
      Body: JSON.stringify(geoJson)
    }

    s3.putObject(params, (err: Error, data: any) => {
      if (err instanceof Error) {
        console.error('Error uploading to S3:', err)
        throw new Error(`Error uploading to S3: ${err.message}`)
      }
      console.log('File uploaded to S3:', data)
    })

    const { Bucket, Key } = params

    const queueParams = {
      QueueUrl: process.env.METADATA_QUEUE_URL,
      MessageBody: JSON.stringify({ Bucket, Key }) // SQS body is limited to 256KB
    }

    sqs.sendMessage(queueParams, (err: Error, data: any) => {
      if (err instanceof Error) {
        console.log('Error sending to SQS:', err)
        throw new Error(`Error sending to SQS: ${err.message}`)
      }
      console.log('Message sent to SQS:', data)
    })

    return { success: true }
  } catch (e) {
    console.log(e, '<< error')
    return { success: false }
  }
}
