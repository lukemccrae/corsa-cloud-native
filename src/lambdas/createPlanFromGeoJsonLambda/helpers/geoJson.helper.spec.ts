import { Altitude, LatLng } from '../../types';
import { makeGeoJson } from './geoJson.helper'; // Update with the correct path

describe('makeGeoJson', () => {
  it('should create a GeoJSON feature collection with correct properties', () => {
    const latLng: LatLng[] = [
      [0, 0],
      [1, 1],
      [2, 2]
    ];
    const altitude: Altitude = [100, 200, 300];

    const result = makeGeoJson(latLng, altitude);

    expect(result).toHaveProperty('featureCollection');
    expect(result.featureCollection).toHaveProperty(
      'type',
      'FeatureCollection'
    );
    expect(result.featureCollection.features).toHaveLength(1);

    const feature = result.featureCollection.features[0];
    expect(feature).toHaveProperty('type', 'Feature');
    expect(feature.geometry).toHaveProperty('type', 'MultiPoint');
    expect(feature.properties).toHaveProperty('id', 1);
    expect(feature.properties).toHaveProperty('name', 'name');
    expect(feature.properties).toHaveProperty('mileData', [{ index: 0 }]);

    // Add more assertions based on your specific expectations
  });

  // Add more test cases as needed
});
