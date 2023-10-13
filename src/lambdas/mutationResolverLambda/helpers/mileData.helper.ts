import { GeoJSONFeatureCollection } from '../customTypes';

export const makeMileData = (geoJson: GeoJSONFeatureCollection) => {
  geoJson.features.forEach((mile) => {
    //for each mile calculate the cumulative elevation gain/loss
    const vertChange = mile.geometry.coordinates.map((point) => {
      //refer to routine-timer-backend for logic to calculate this
      //   return [gain, loss];
    });
    console.log(vertChange, '<< change');
  });
};
