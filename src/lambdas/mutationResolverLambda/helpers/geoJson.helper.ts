import { Altitude, Feature, LatLng, LatLngAltitude } from '../../types';
// import { calculateDistance } from './haversine.helper';
import haversine from 'haversine';
import { calculateDistance } from './haversine.helper';

// Create an array of GeoJSON Point features
export const makeGeoJson = (latLng: [LatLng], altitude: Altitude): any => {
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
      name: 'name'
    }
  };

  const milePointers = [0]; //an array of the indices where miles start/end, beginning with 0

  let distance = 0;

  for (let i = 0; i < latLng.length; i++) {
    // early return
    if (i === latLng.length - 2) {
      featureCollection.features.push(feature);
      return { milePointers, featureCollection };
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
      milePointers.push(i);
      distance = 0;
      featureCollection.features.push(feature);
    }

    distance += feetBetweenPoints;
  }

  // let distance = 0;
  // let pointsForThisMile: LatLngAltitude[] = [];

  // iterate through latLng array and create a new feature collection for each mile
  // for (let i = 0; i < latLng.length; i++) {
  //   // last loop breaks, return 1 i early
  //   if (i === latLng.length - 2) return featureCollection;

  // let feetBetweenPoints =
  //   haversine(
  //     {
  //       latitude: latLng[i][0],
  //       longitude: latLng[i][1],
  //     },
  //     {
  //       latitude: latLng[i + 1][0],
  //       longitude: latLng[i + 1][1],
  //     },
  //     { unit: "mile" },
  //   ) * 5280;

  //   let feetBetweenPoints = calculateDistance(
  //     latLng[i][0],
  //     latLng[i][1],
  //     latLng[i + 1][0],
  //     latLng[i + 1][1]
  //   );

  //   distance += feetBetweenPoints;

  //   const latLongToPush = latLng[i].reverse();
  //   latLongToPush.push(altitude[i] * 3.28084);
  //   pointsForThisMile.push(latLongToPush as LatLngAltitude);
  //   feature.geometry.coordinates = pointsForThisMile;

  //   // if distance is over a mile, push feature into collection and reset
  //   if (distance >= 5280) {
  //     featureCollection.features.push(feature);
  //     distance = 0;

  //     feature = {
  //       type: 'Feature',
  //       geometry: {
  //         type: 'MultiPoint',
  //         coordinates: []
  //       },
  //       properties: {
  //         id: 1,
  //         name: 'name'
  //       }
  //     };
  //     pointsForThisMile = [];
  //   }
  // }
};
