import { FeatureCollectionBAD } from "../../types";

export const generatePacesFromGeoJson = (geoJson: FeatureCollectionBAD) => {
    const feature = geoJson.features[0];
    const paces = feature.properties.mileData.map((m, i) => {
      const timeInSeconds =
        Date.parse(
          // annoying indexing here because mileData stores the
          //  BEGINNING point of the mile and here i need the end
          feature.properties.coordTimes[
          // if i is the last, make it the end of the array
          i === feature.properties.mileData.length - 1
            ? feature.properties.coordTimes.length - 1
            : // otherwise its the next, since mileData[0].index is 0
            feature.properties.mileData[i + 1].index
          ]
        ) / 1000;

      return timeInSeconds;
    });

    const startTime =
      Date.parse(geoJson.features[0].properties.coordTimes[0]) / 1000;
    const returnPaces = {
      L: paces.map((p: number, i: number) => ({
        N: String(
          // if we are at the beginning give the pace back minus start time
          i === 0
            ? p - startTime
            : // otherwise subtract the previous mile time to get the split of the current mile
            p - paces[i - 1]
        )
      }))
    };

    return returnPaces;
  };