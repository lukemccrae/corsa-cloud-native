import haversine from 'haversine';

const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    return haversine(
        {
            latitude: lat1,
            longitude: lon1
        },
        {
            latitude: lat2,
            longitude: lon2
        },
        { unit: 'mile' }
    ) * 5280;
}

// point arg is a subset of points to calculate an accurate pace
// times arg is corrposponding timestamps
export const calcPaceGrade = (points: number[][], times: string[]): { pacePoint: number, gradePoint: number } => {
    let distance = 0;
    let time = 0;

    for (let i = 0; i < points.length - 1; i++) {
        let feetBetweenPoints = calcDistance(points[i][1], points[i][0], points[i + 1][1], points[i + 1][0])
        distance += feetBetweenPoints;
        let time1 = new Date(times[i]).getTime();
        let time2 = new Date(times[i + 1]).getTime();
        time += time2 - time1;
    }
    const timeInSeconds = time / 1000;
    const pacePoint = Math.round(timeInSeconds / (distance / 5280));
    const vertChange = Math.round(points[points.length - 1][2] - points[0][2]);
    const gradePoint = parseFloat((((vertChange * 3.28084) / distance) * 100).toFixed(2));
    return { pacePoint, gradePoint }
}