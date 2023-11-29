import { Altitude, Feature, LatLng, LatLngAltitude } from '../../types';
// import { calculateDistance } from './haversine.helper';
import haversine from 'haversine';

// Create an array of GeoJSON Point features
export const makeGeoJson = (latLng: LatLng[], altitude: Altitude): any => {
  const featureCollection: {
    type: string;
    features: Feature[];
  } = {
    type: 'FeatureCollection',
    features: []
  };

  let feature: Feature = {
    type: 'Feature',
    geometry: {
      type: 'MultiPoint',
      coordinates: []
    },
    properties: {
      id: 1,
      name: 'name',
      mileData: [{ index: 0 }],
      lastMileDistance: 0,
      coordTimes: []
    }
  };

  let distance = 0;

  for (let i = 0; i < latLng.length; i++) {
    // early return
    if (i === latLng.length - 2) {
      feature.properties.lastMileDistance =
        Math.round((distance / 5280) * 100) / 100;
      featureCollection.features.push(feature);
      return { featureCollection };
    }

    let feetBetweenPoints =
      haversine(
        {
          latitude: latLng[i][0],
          longitude: latLng[i][1]
        },
        {
          latitude: latLng[i + 1][0],
          longitude: latLng[i + 1][1]
        },
        { unit: 'meter' }
      ) * 3.28084;

    // careful, .reverse modifies the latLng array
    const latLongToPush = latLng[i].reverse();
    latLongToPush.push(altitude[i] * 3.28084);

    feature.geometry.coordinates.push(latLongToPush as LatLngAltitude);

    if (distance >= 5280) {
      feature.properties.mileData.push({ index: i });
      distance = 0;
    }

    distance += feetBetweenPoints;
  }
};
