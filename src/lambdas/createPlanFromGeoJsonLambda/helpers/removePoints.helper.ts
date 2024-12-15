import { FeatureCollectionBAD, LatLngAltitude, PointMetadata } from "../../types";

const haversineInFeet = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRadians = (degree: number) => degree * (Math.PI / 180);

    const R = 20902688; // Earth's radius in feet
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in feet
}

// calculate the overall length of the points to compare fidelity of the GPX tracks
const pointSegmentLength = (mapPoints: LatLngAltitude[]) => {
    let distance = 0;
    let i = 0

    while (i < mapPoints.length - 1) {
        let lat1: number = mapPoints[i][1]
        let long1: number = mapPoints[i][0]
        let lat2: number = mapPoints[i + 1][1]
        let long2: number = mapPoints[i + 1][0]

        distance += haversineInFeet(lat1, long1, lat2, long2)
        i++;
    }
    return Math.round(distance);
}

function isCollinear(
    p1: { lat: number; lon: number },
    p2: { lat: number; lon: number },
    p3: { lat: number; lon: number },
    tolerance: number
): boolean {
    // make a triangle out of three points and compare the area
    const area = p1.lat * (p2.lon - p3.lon) +
        p2.lat * (p3.lon - p1.lon) +
        p3.lat * (p1.lon - p2.lon);
    return Math.abs(area) <= tolerance
}

const removePoints = (map: LatLngAltitude[], coordTimes: string[], pointMetadata: PointMetadata[], tolerance: number) => {
    // use a set here insteaf of an array for performant filtering
    let collinearIndices = new Set<number>();
    // Iterate through the points
    for (let i = 0; i < map.length - 2; i++) {
        const p1 = { lat: map[i][1], lon: map[i][0] };
        const p2 = { lat: map[i + 1][1], lon: map[i + 1][0] };
        const p3 = { lat: map[i + 2][1], lon: map[i + 2][0] };

        // Check if these three points are collinear
        if (isCollinear(p1, p2, p3, tolerance)) {
            // Mark the middle point (p2) for removal
            collinearIndices.add(i + 1);
        }
    }

    // save some points for track fidelity
    // const indicesArray = Array.from(collinearIndices);

    // let pointDistance = 0;

    // for (let i = 0; i < indicesArray.length - 1; i++) {
    //     const current = indicesArray[i];
    //     pointDistance += pointSegmentLength([map[i], map[i + 1]])

        // Remove the current element from the Set during iteration
        // if (pointDistance > 20) {
        //     collinearIndices.delete(current);
        //     pointDistance = 0;
        // }
    // }

    // Filter out collinear points
    const shortenedPoints = map.filter((_, index) => !collinearIndices.has(index));
    const shortenedCoordTimes = coordTimes.filter((_, index) => !collinearIndices.has(index));
    const shortenedPointMetadata = pointMetadata.filter((_, index) => !collinearIndices.has(index));
    return { shortenedPoints, shortenedCoordTimes, shortenedPointMetadata }
}

export const shortenIteratively = (featureCollection: FeatureCollectionBAD) => {
    const map: LatLngAltitude[] = featureCollection.features[0].geometry.coordinates;
    const coordTimes: string[] = featureCollection.features[0].properties.coordTimes;
    const pointMetadata: PointMetadata[] = featureCollection.features[0].properties.pointMetadata;

    // start with base tolerance value that will be decreased in loop iterations
    let tolerance = .000001;
    let iterations = 0;
    const maxIterations = 8;
    const originalLength: number = Number.parseFloat((pointSegmentLength(map) / 5280).toFixed(4))
    // let { shortenedPoints, shortenedCoordTimes } = removePoints(map, coordTimes, tolerance);
    let shortenedLength: number;

    // do loop that makes new shortened point arrays if shortenedLength is outside of acceptable ratio to original
    while (iterations < maxIterations) {
        let { shortenedPoints, shortenedCoordTimes, shortenedPointMetadata } = removePoints(map, coordTimes, pointMetadata, tolerance);
        shortenedLength = Number.parseFloat((pointSegmentLength(shortenedPoints) / 5280).toFixed(4))

        // degree of difference between route lengths as a percent
        let ratio = (originalLength - shortenedLength) / originalLength;

        // check for tolerable distance difference between shortened route and original
        // increase comparison value to decrease points
        // decrease comparison value to increase route accuracy
        console.log(ratio, 'ratio')
        console.log(coordTimes.length, '<< original point length')
        console.log(shortenedPoints.length, '<< shortened points')
        console.log(originalLength, '<< originalLength')
        console.log(shortenedLength, '<< shortenedLength')

        console.log(iterations, '<< iterations')
        if (ratio > .3) {
            tolerance /= 10;
            iterations++
        } else {
            featureCollection.features[0].geometry.coordinates = shortenedPoints
            featureCollection.features[0].properties.coordTimes = shortenedCoordTimes
            featureCollection.features[0].properties.pointMetadata = shortenedPointMetadata

            break;
        }

    }



    return featureCollection;
}