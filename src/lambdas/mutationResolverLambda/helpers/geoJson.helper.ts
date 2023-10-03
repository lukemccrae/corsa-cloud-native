type LatLng = [number, number]

// Create an array of GeoJSON Point features
export const makeGeoJson = (latLng: [LatLng], altitude: number[]): any => {
  const featureCollection = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'MultiPoint',
        coordinates: latLng.map((latLng, i) => [...(latLng.reverse()), altitude[i]])
      },
      properties: {
        id: 1,
        name: 'name'
      }
    }]
  }

  return featureCollection
}
