import { calculateDistance } from './haversine.helper';
import haversine from 'haversine';

type LatLng = [number, number];
type Altitude = [number];
type LatLngAltitude = [number, number, number];

interface Feature {
  type: string;
  geometry: {
    type: string;
    coordinates: LatLngAltitude[];
  };
  properties: {
    id: number;
    name: string;
  };
}

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

  let distance = 0;
  let pointsForThisMile: LatLngAltitude[] = [];

  // iterate through latLng array and create a new feature collection for each mile
  for (let i = 0; i < latLng.length; i++) {
    // last loop breaks, return 1 i early
    if (i === latLng.length - 2) return featureCollection;

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

    let feetBetweenPoints = calculateDistance(
      latLng[i][0],
      latLng[i][1],
      latLng[i + 1][0],
      latLng[i + 1][1]
    );

    distance += feetBetweenPoints;

    const latLongToPush = latLng[i].reverse();
    latLongToPush.push(altitude[i] * 3.28084);
    pointsForThisMile.push(latLongToPush as LatLngAltitude);
    feature.geometry.coordinates = pointsForThisMile;

    // if distance is over a mile, push feature into collection and reset
    if (distance >= 5280) {
      featureCollection.features.push(feature);
      distance = 0;

      feature = {
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
      pointsForThisMile = [];
    }
  }
};
