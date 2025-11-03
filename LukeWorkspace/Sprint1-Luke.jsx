

// https://maps.googleapis.com/maps/api/directions/outputFormat?parameters
// where outputFormat may be either of the following values:

// json (recommended) indicates output in JavaScript Object Notation (JSON)
// xml indicates output as XML

// Innocation Campus:  E Glebe Rd, Alexandria, VA 22305 38.83787365277667, -77.04866272510975

// Tasks:
// If user grants permission, you get {lat, lng} and publish it to app state. If denied/failed, the manual entry flow works and yields {lat, lng}.
// Given userLoc and a list of restaurants with lat/lng, you attach distanceMeters (and optionally walkMinutes) to each item.


// Implement location access to determine user's current position
// Calculate distance from user's location to each restaurant
// filter restaurant result based on calculated distance


