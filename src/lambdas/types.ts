export type LatLng = [number, number];
export type Altitude = [number];
export type LatLngAltitude = [number, number, number];

export interface Feature {
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

export interface FeatureCollection {
  type: string;
  features: Feature[];
}
