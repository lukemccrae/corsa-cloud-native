import { find } from 'geo-tz';

export const retrieveTimezone = (coord: number[]) => {
    const correctedCoord = coord.slice(0, 2).reverse()
    if (!Array.isArray(correctedCoord) || correctedCoord.length !== 2) {
        throw new Error("Invalid coordinates: Expected an array with at least two elements.");
    }
    const timezone = find(correctedCoord[0], correctedCoord[1])[0];


    return timezone;
}