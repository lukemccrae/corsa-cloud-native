// Messy to have this helper, these indices can be calculated elsewhere
// Doing this for a short term solution

import haversine from 'haversine';
import { FeatureCollectionBAD, PointMetadata } from '../../types';
import { calcPaceGrade } from './calcPace.helper'

export const makeMileIndices = (geoJson: FeatureCollectionBAD) => {
  if (!geoJson.features) throw new Error('This geoJson has no features');
  if (!geoJson.features[0]) throw new Error('This geoJson has no features');
  if (!geoJson.features[0].geometry) throw new Error('Feature has no geometry');
  if (!geoJson.features[0].geometry.coordinates)
    throw new Error('Geometry has no coordinates');
  if (!geoJson.features[0].properties)
    throw new Error('Geometry has no properties');
  if (!geoJson.features[0].type) throw new Error('Geometry has no type');

  const mileData = [{ index: 0, elevationGain: 0, elevationLoss: 0, stopTime: 0 }];
  const points = geoJson.features[0].geometry.coordinates;
  const timeStamps = geoJson.features[0].properties.coordTimes;

  let distance = 0;
  let pointMetadata: PointMetadata[] = [];
  let maxElevation = -Infinity;
  let minElevation = Infinity;

  let maxGrade = -Infinity;
  let minGrade = Infinity;

  let maxPace = -Infinity;
  let minPace = Infinity;

  for (let i = 0; i < points.length - 1; i++) {
    // calculate time between points
    const time1 = new Date(timeStamps[i]).getTime()
    const time2 = new Date(timeStamps[i + 1]).getTime()
    let feetBetweenPoints =
      haversine(
        {
          // cast here is not good, figure out how to check for null
          latitude: points[i]![1] as number,
          longitude: points[i]![0] as number
        },
        {
          // GPX to geoJSON service returns points in lat/long format
          latitude: points[i + 1]![1] as number,
          longitude: points[i + 1]![0] as number
        },
        { unit: 'mile' }
      ) * 5280;

    if (distance >= 5280) {
      mileData.push({ index: i, elevationGain: 0, elevationLoss: 0, stopTime: 0 });
      distance = 0;

    }

    if (feetBetweenPoints < 1) {
      mileData[mileData.length - 1].stopTime += (time2 - time1) / 1000
    }

    // set min/max elevation
    let elevation = points[i][2]
    if (elevation < minElevation) {
      minElevation = elevation;
    }
    if (elevation > maxElevation) {
      maxElevation = elevation;
    }

    let tempMetadata: PointMetadata = { grade: 0, pace: 0, cumulativeDistance: 0, elevation: points[i][2], time: timeStamps[i] }

    distance += feetBetweenPoints;
    let currentDistance = pointMetadata.length > 0
      ? pointMetadata[pointMetadata.length - 1].cumulativeDistance
      : 0;
    tempMetadata['cumulativeDistance'] = parseFloat((currentDistance + feetBetweenPoints).toFixed(2))

    // sliding window for point comparison
    const start = Math.max(0, i - 5);
    const end = Math.min(points.length, i + 5);

    const { pacePoint, gradePoint } = calcPaceGrade(
      points.slice(start, end),
      geoJson.features[0].properties.coordTimes.slice(start, end)
    );

    // set min/max grade
    if (gradePoint < minGrade) {
      minGrade = gradePoint;
    }
    if (gradePoint > maxGrade) {
      maxGrade = gradePoint;
    }

    // set min/max pace
    if (pacePoint < minPace) {
      minPace = pacePoint;
    }
    if (pacePoint > maxPace) {
      maxPace = pacePoint;
    }


    tempMetadata['grade'] = gradePoint;
    tempMetadata['pace'] = pacePoint;
    pointMetadata.push(tempMetadata);
  }

  geoJson.features[0].properties.lastMileDistance =
    Math.round((distance / 5280) * 100) / 100;
  geoJson.features[0].properties.mileData = mileData;

  geoJson.features[0].properties.pointMetadata = pointMetadata;
  geoJson.features[0].properties.maxElevationInFeet = maxElevation
  geoJson.features[0].properties.minElevationInFeet = minElevation

  geoJson.features[0].properties.minGrade = minGrade
  geoJson.features[0].properties.maxGrade = maxGrade

  geoJson.features[0].properties.minPace = minPace
  geoJson.features[0].properties.maxPace = maxPace

  return geoJson;
};
