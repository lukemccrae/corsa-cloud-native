export const gpxToGeoJson = (gpxString: string) => {
    var tj = require('@mapbox/togeojson'),
        fs = require('fs'),
        // node doesn't have xml parsing or a dom. use xmldom
        DOMParser = require('xmldom').DOMParser;

    const gpx = new DOMParser().parseFromString(gpxString, 'utf8');

    const converted = tj.gpx(gpx);

    const geojson = JSON.stringify(converted);

    return geojson;
}