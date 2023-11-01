import { MileData, S3MileData } from './types';

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPoint';
    coordinates: [number, number, number][];
  };
  properties: {
    id: number;
    name: string;
    mileData: S3MileData;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
