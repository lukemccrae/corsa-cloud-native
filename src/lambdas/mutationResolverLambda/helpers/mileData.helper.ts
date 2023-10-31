import { GeoJSONFeatureCollection } from '../customTypes';
import { MileData } from '../types';

export const makeMileData = (
  geoJson: GeoJSONFeatureCollection,
  milePointers: number[]
) => {
  let elevationGain = 0;
  let elevationLoss = 0;

  let milePointer = 1;

  let geoJsonWithMileData = geoJson;

  const mileData: MileData[] = [];

  // calculate the cumulative elevation gain/loss
  // add gain/loss values to the geoJSON properties
  const points = geoJson.features[0].geometry.coordinates;

  for (let i = 1; i < points.length; i++) {
    // vert diff between points
    let rise = points[i][2] - points[i - 1][2];
    if (rise > 0) elevationGain += rise;
    if (rise < 0) elevationLoss += rise;

    // if we are on the next mile,
    if (i === milePointers[milePointer]) {
      milePointer++;

      mileData.push({
        elevationGain,
        elevationLoss
      });
      elevationGain = 0;
      elevationLoss = 0;
    }
  }

  geoJsonWithMileData.features[0].properties.mileData = mileData;

  // mileData.push({
  //   elevationGain: Math.round(gain),
  //   elevationLoss: Math.round(loss)
  // });

  return { geoJsonWithMileData };
};
