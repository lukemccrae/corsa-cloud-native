import { GeoJSONFeatureCollection } from '../customTypes';
import { MileData } from '../types';

export const makeMileData = (geoJson: GeoJSONFeatureCollection) => {
  let gain = 0;
  let loss = 0;

  let geoJsonWithMileData = geoJson;

  const mileData: MileData[] = [];
  const paces: number[] = [];
  // for each mile...
  geoJsonWithMileData.features.forEach((mile, mileIndex) => {
    // calculate the cumulative elevation gain/loss
    // add gain/loss values to the geoJSON properties
    const milePoints = mile.geometry.coordinates;
    for (let i = 1; i < milePoints.length; i++) {
      // vert diff between points
      let rise = milePoints[i][2] - milePoints[i - 1][2];
      if (rise > 0) gain += rise;
      if (rise < 0) loss += rise;
    }
    geoJsonWithMileData.features[mileIndex].properties.gain = Math.round(gain);
    geoJsonWithMileData.features[mileIndex].properties.loss = Math.round(loss);

    mileData.push({
      elevationGain: Math.round(gain),
      elevationLoss: Math.round(loss)
    });

    paces.push(540);
  });
  return { geoJsonWithMileData, mileData, paces };
};
