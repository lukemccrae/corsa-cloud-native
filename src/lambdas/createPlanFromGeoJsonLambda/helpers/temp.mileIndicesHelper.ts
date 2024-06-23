// Messy to have this helper, these indices can be calculated elsewhere
// Doing this for a short term solution

import haversine from 'haversine';
import { FeatureCollectionBAD } from '../../types';

export const makeMileIndices = (geoJson: FeatureCollectionBAD) => {
  if (!geoJson.features) throw new Error('This geoJson has no features');
  if (!geoJson.features[0]) throw new Error('This geoJson has no features');
  if (!geoJson.features[0].geometry) throw new Error('Feature has no geometry');
  if (!geoJson.features[0].geometry.coordinates)
    throw new Error('Geometry has no coordinates');
  if (!geoJson.features[0].properties)
    throw new Error('Geometry has no properties');
  if (!geoJson.features[0].type) throw new Error('Geometry has no type');

  const mileData = [{ index: 0, elevationGain: 0, elevationLoss: 0 }];
  const points = geoJson.features[0].geometry.coordinates;

  let distance = 0;

  // gpx to geoJSON is working right
  // all the points are coming through
  // the time for the activity is working right
  // the distance is just coming up shor

  for (let i = 0; i < points.length - 1; i++) {
    let feetBetweenPoints =
      haversine(
        {
          // cast here is not good, figure out how to check for null
          // without using ! type assertion override
          latitude: points[i]![1] as number,
          longitude: points[i]![0] as number
        },
        {
          // GPX to geoJSON service returns points in lat/long format
          latitude: points[i + 1]![1] as number,
          longitude: points[i + 1]![0] as number
        },
        { unit: 'mile' }
      ) * 5280;

    if (distance >= 5280) {
      mileData.push({ index: i, elevationGain: 0, elevationLoss: 0 });
      distance = 0;
    }

    distance += feetBetweenPoints;
  }

  geoJson.features[0].properties.lastMileDistance =
    Math.round((distance / 5280) * 100) / 100;
  geoJson.features[0].properties.mileData = mileData;
  return geoJson;
};
