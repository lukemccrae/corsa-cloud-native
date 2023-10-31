import { MileData } from './types';

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPoint';
    coordinates: [number, number, number][];
  };
  properties: {
    id: number;
    name: string;
    mileData: MileData[];
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
