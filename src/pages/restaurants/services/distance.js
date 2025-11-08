export {
  haversineMiles,
  changeTransormedData,
};


// Get distance from point a to point b in miles using Haversine formula
// Input must be in form a = { lat: 38.9072, lng: -77.0369 }
// Return type might need rounding
function haversineMiles(a, b) {
  const toRad = d => d * Math.PI / 180;
  const R = 3958.7613; // miles
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat/2)**2 +
            Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  const miles = 2 * R * Math.asin(Math.sqrt(s));
  return Number(miles.toFixed(2));
}

// Using transformed data from API and user location, get the right distances to display
function changeTransformedData(data, userLoc) {
  for (let i = 0; i < data.length; i++) {
    // user to restaurant in miles
    let coords = {"lat": data[i].yCoordinate,"lng": data[i].xCoordinate}
    let correct_distance = haversineMiles(userLoc, coords);
    data[i].distance = correct_distance;
  };

}
