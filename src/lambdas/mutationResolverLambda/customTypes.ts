export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPoint';
    coordinates: [number, number, number][];
  };
  properties: {
    id: number;
    name: string;
    gain: number;
    loss: number;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}
