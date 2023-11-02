import { FeatureCollection } from '../../types';

export const makeMileData = (geoJson: FeatureCollection) => {
  // calculate the elevation gain/loss
  // add values to the geoJSON properties
  const points = geoJson.features[0].geometry.coordinates;
  //loop through each mile coordinates
  geoJson.features[0].properties.mileData.forEach((md, mi) => {
    let elevationGain = 0;
    let elevationLoss = 0;
    let searchLength;
    // search length is either the next value in the array
    if (mi < geoJson.features[0].properties.mileData.length - 1) {
      searchLength = geoJson.features[0].properties.mileData[mi + 1].index;
      // or the length of points for the last mile
    } else {
      searchLength = points.length;
    }

    if (mi < geoJson.features[0].properties.mileData.length) {
      for (let i = md.index + 1; i < searchLength; i++) {
        const point1 = points[i][2];
        const point2 = points[i - 1][2];
        // vert diff between points
        let rise = point1 - point2;
        if (rise > 0) elevationGain += rise;
        if (rise < 0) elevationLoss += rise;
      }
      geoJson.features[0].properties.mileData[mi].elevationGain = elevationGain;
      geoJson.features[0].properties.mileData[mi].elevationLoss = elevationLoss;
    }
  });

  return { geoJson };
};
