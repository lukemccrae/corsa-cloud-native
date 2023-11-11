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
    mileData: S3MileData[];
  };
}

export type S3MileData = {
  index: number;
  elevationGain?: number;
  elevationLoss?: number;
};

export interface FeatureCollection {
  type: string;
  features: Feature[];
}

interface LatLngData {
  data: [number, number][];
  series_type: string;
  original_size: number;
  resolution: string;
}

interface DistanceData {
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
}

interface AltitudeData {
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
}

interface TimeData {
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
}

export interface ActivityStreamData {
  latlng: LatLngData;
  distance: DistanceData;
  altitude: AltitudeData;
  time: TimeData;
}
