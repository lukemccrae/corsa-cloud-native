export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPoint';
    coordinates: [number, number, number][];
  };
  properties: {
    id: number;
    name: string;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
