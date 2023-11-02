import { MileData } from '../../../types';
import { FeatureCollection } from '../../types';

interface MakeProfilePoints {
  geoJson: FeatureCollection;
}

//make each point relative to the min / max as a percentage
//and display that percentage with a number from 1-20
function equalizeProfile(milePoints: number[], min: number, max: number) {
  let result = [];
  let avgIncrement = (max - min) / 20;

  for (const point of milePoints) {
    result.push(Math.round((point - min) / avgIncrement));
  }
  return result;
}

export const makeProfilePoints = (props: MakeProfilePoints) => {
  const pointsPerMile: number[][] = [];

  // grab the indices for where each mile begins
  const indices = props.geoJson.features[0].properties.mileData;
  const points = props.geoJson.features[0].geometry.coordinates;

  // for each starting indice...
  indices.forEach((index, i) => {
    // range tuple for mile points
    let range: [number, number];

    // for the last mile, the end is the end of the points array
    if (i === indices.length - 1) {
      range = [index.index, points.length];
    } else {
      // otherwise it is the next index
      range = [index.index, indices[i + 1].index];
    }
    // subarray with range tuple
    const mileArr = points.slice(...range);

    let percent = 0.01;
    let mileProfile = [];
    let max = 0;
    let min = 0;

    // 20 points representing the relative elevation of the mile point
    for (let j = 1; j < 21; j++) {
      const point = Math.round(mileArr[Math.ceil(percent * mileArr.length)][2]);

      // set min to point for the first point to solve less than 0 case
      if (j === 1) {
        min = point;
      }

      if (point > max) max = point;
      if (point < min) min = point;

      mileProfile.push(point);
      percent += 0.05;
    }

    pointsPerMile.push(equalizeProfile(mileProfile, min, max));
  });
  return { pointsPerMile };
};
