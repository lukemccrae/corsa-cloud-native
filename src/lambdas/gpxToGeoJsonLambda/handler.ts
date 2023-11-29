const tj = require('@mapbox/togeojson'),
  fs = require('fs'),
  // node doesn't have xml parsing or a dom. use xmldom
  DOMParser = require('xmldom').DOMParser;

export const handler = async (event: any, context: any): Promise<any> => {
  try {
    const gpx = new DOMParser().parseFromString(event.body, 'utf8');

    const converted = tj.gpx(gpx);

    const geojson = JSON.stringify(converted);

    // add a bunch of logic to make sure that the JSON is what we need

    return {
      statusCode: 200,
      headers: {
        ContentType: 'application/json',
        // 'Access-Control-Allow-Origin': 'https://58f8-70-59-19-22.ngrok-free.app'
        'Access-Control-Allow-Origin': 'http://localhost:3000'
      },
      body: geojson
    };
  } catch (e) {
    console.log(e);
  }
};
