import { calculateDistance } from './haversine.helper'

type LatLng = [number, number]

interface Feature {
  type: string
  geometry: {
    type: string
    coordinates: LatLng[]
  }
  properties: {
    id: number
    name: string
    remainder: number
  }
}

// Create an array of GeoJSON Point features
export const makeGeoJson = (latLng: [LatLng], altitude: number[]): any => {
  const featureCollection: {
    type: string
    features: Feature[]
  } = {
    type: 'FeatureCollection',
    features: []
  }

  const feature: Feature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPoint',
      coordinates: []
    },
    properties: {
      id: 1,
      name: 'name',
      remainder: 0
    }
  }

  // iterate through latLng array and create a new feature collection for each mile
  for (let i = 0; i < latLng.length; i++) {
    const pointsForThisMile: LatLng[] = []
    // add up distance of points for this mile in feet
    let distance = 0

    // if this is the last tick of the loop add the remaining distance as a percentage
    if (i === latLng.length - 1) {
      feature.properties.remainder = distance / 5280

    // if its not the last tick keep adding points
    } else {
      // this will break on the last loop
      distance += calculateDistance(latLng[i][1], latLng[i][0], latLng[i + 1][1], latLng[i + 1][0])

      pointsForThisMile.push(latLng[i].reverse() as LatLng)

      if (distance >= 5280) {
        feature.geometry.coordinates = pointsForThisMile
        featureCollection.features.push(feature)

        // reset points for the new mile
        pointsForThisMile.length = 0
        feature.geometry.coordinates.length = 0
      }
    }
  }

  return featureCollection
}
