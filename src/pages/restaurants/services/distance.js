// Export please


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
  const miles = 2 * R * Math.asin(Math.sqrt(x));
  return miles
}

// Given data from API, extract coordinates in dictionary with form of:
// {Name: {"lat": coord,"lng": coord}}
function getRestaurantCoords(rows) {
  const restaurants = {};
  for (let i = 0; i < rows.length; i++) {
    restaurants[rows[i].name] = {
      lat: rows[i].Latitude, // y = latitude
      lng: rows[i].Longitude, // x = longitude
    };
  }
  return restaurants;
}

// Given coordinate dictionary and user location, Find distances, 
// return a list with a key value pair of restaurant and distance in miles (sorted)
function getRestaurantDistances(rows, userLoc) {
  const locations = getRestaurantCoords(rows);
  const distances = [];
  for (const [name, loc] of Object.entries(locations)) {
    distances.push({ name, miles: haversineMiles(userLoc, loc) });
  }
  // sort nearest → farthest
  distances.sort((a, b) => a.miles - b.miles);
  return distances;
}