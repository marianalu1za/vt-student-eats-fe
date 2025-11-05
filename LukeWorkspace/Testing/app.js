document.getElementById('ask').onclick = () => {
    getUserLocation().then(loc => {
        // console.log("Done", loc);
        x = getNearbyRestaurants(loc)
        console.log(x)
        console.log(getRestaurantResults(x))
        // x = getRestaurantResults(VT_RESTAURANTS)
        // console.log(x)

    });
};

const API_KEY = window.APP_CONFIG?.GOOGLE_API_KEY;
const DEFAULT_LOC = { lat: 38.83787365277667, lng: -77.04866272510975 }; // VT Innovation Campus
const VT_RESTAURANTS =
{
    "places": [
        {
            "formattedAddress": "3525 Richmond Hwy, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.836838,
                "longitude": -77.0510996
            },
            "priceLevel": "PRICE_LEVEL_MODERATE",
            "displayName": {
                "text": "CAVA",
                "languageCode": "en"
            },
            "primaryType": "mediterranean_restaurant"
        },
        {
            "formattedAddress": "3525 Richmond Hwy, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.836711799999996,
                "longitude": -77.0510403
            },
            "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
            "displayName": {
                "text": "&pizza",
                "languageCode": "en"
            },
            "primaryType": "pizza_restaurant"
        },
        {
            "formattedAddress": "3525 Richmond Hwy, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.836664,
                "longitude": -77.0510453
            },
            "priceLevel": "PRICE_LEVEL_MODERATE",
            "displayName": {
                "text": "Five Guys",
                "languageCode": "en"
            },
            "primaryType": "fast_food_restaurant"
        },
        {
            "formattedAddress": "3825 Jefferson Davis Hwy Suite B, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.8388966,
                "longitude": -77.0515672
            },
            "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
            "displayName": {
                "text": "Subway",
                "languageCode": "en"
            },
            "primaryType": "sandwich_shop"
        },
        {
            "formattedAddress": "C Jefferson Davis, 3825 Potomac Yard Trl Center, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.8388,
                "longitude": -77.05174
            },
            "priceLevel": "PRICE_LEVEL_MODERATE",
            "displayName": {
                "text": "Starbucks",
                "languageCode": "en"
            },
            "primaryType": "coffee_shop"
        },
        {
            "formattedAddress": "3425-A Richmond Hwy, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.8359076,
                "longitude": -77.05111760000001
            },
            "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
            "displayName": {
                "text": "IHOP",
                "languageCode": "en"
            },
            "primaryType": "breakfast_restaurant"
        },
        {
            "formattedAddress": "3425 Richmond Hwy, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.835772,
                "longitude": -77.0512823
            },
            "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
            "displayName": {
                "text": "Chipotle Mexican Grill",
                "languageCode": "en"
            },
            "primaryType": "mexican_restaurant"
        },
        {
            "formattedAddress": "3325 Jefferson Davis Hwy, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.8351103,
                "longitude": -77.0509732
            },
            "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
            "displayName": {
                "text": "Dunkin'",
                "languageCode": "en"
            },
            "primaryType": "coffee_shop"
        },
        {
            "formattedAddress": "3314 Richmond Hwy, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.8352825,
                "longitude": -77.0519171
            },
            "displayName": {
                "text": "Flavor Hive",
                "languageCode": "en"
            },
            "primaryType": "restaurant"
        },
        {
            "formattedAddress": "3100 Richmond Hwy, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.833826099999996,
                "longitude": -77.0517466
            },
            "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
            "displayName": {
                "text": "Omar's Pitas & Platters",
                "languageCode": "en"
            },
            "primaryType": "restaurant"
        },
        {
            "formattedAddress": "3650 S Glebe Rd # 185, Arlington, VA 22202, USA",
            "location": {
                "latitude": 38.8423107,
                "longitude": -77.05094520000002
            },
            "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
            "displayName": {
                "text": "Paisano's Pizza",
                "languageCode": "en"
            },
            "primaryType": "pizza_restaurant"
        },
        {
            "formattedAddress": "3535 S Ball St, Arlington, VA 22202, USA",
            "location": {
                "latitude": 38.8430908,
                "longitude": -77.0507832
            },
            "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
            "displayName": {
                "text": "Domino's Pizza",
                "languageCode": "en"
            },
            "primaryType": "meal_delivery"
        },
        {
            "formattedAddress": "3639 S Glebe Rd, Arlington, VA 22202, USA",
            "location": {
                "latitude": 38.8431336,
                "longitude": -77.0513229
            },
            "displayName": {
                "text": "Social All Day",
                "languageCode": "en"
            },
            "primaryType": "restaurant"
        },
        {
            "formattedAddress": "410 E Glebe Rd, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.8327007,
                "longitude": -77.0518376
            },
            "displayName": {
                "text": "Caffe Utopia & Bar",
                "languageCode": "en"
            },
            "primaryType": "restaurant"
        },
        {
            "formattedAddress": "428 A Hume Ave, Alexandria, VA 22301, USA",
            "location": {
                "latitude": 38.8317145,
                "longitude": -77.05157419999999
            },
            "priceLevel": "PRICE_LEVEL_MODERATE",
            "displayName": {
                "text": "Sam’s Pizza Cafe’",
                "languageCode": "en"
            },
            "primaryType": "pizza_restaurant"
        },
        {
            "formattedAddress": "1 Marina Dr, Alexandria, VA 22314, USA",
            "location": {
                "latitude": 38.8333686,
                "longitude": -77.0418815
            },
            "displayName": {
                "text": "Burgers for Sail",
                "languageCode": "en"
            },
            "primaryType": "bar_and_grill"
        },
        {
            "formattedAddress": "3400 S Clark St, Arlington, VA 22202, USA",
            "location": {
                "latitude": 38.844262,
                "longitude": -77.0522367
            },
            "priceLevel": "PRICE_LEVEL_INEXPENSIVE",
            "displayName": {
                "text": "Subway",
                "languageCode": "en"
            },
            "primaryType": "sandwich_shop"
        },
        {
            "formattedAddress": "10 E Glebe Rd, Alexandria, VA 22305, USA",
            "location": {
                "latitude": 38.835591199999996,
                "longitude": -77.05720509999999
            },
            "priceLevel": "PRICE_LEVEL_MODERATE",
            "displayName": {
                "text": "Northside 10",
                "languageCode": "en"
            },
            "primaryType": "bar_and_grill"
        },
        {
            "formattedAddress": "1 Marina Dr, Alexandria, VA 22314, USA",
            "location": {
                "latitude": 38.8331867,
                "longitude": -77.041795
            },
            "displayName": {
                "text": "Catboat Pizza Bar",
                "languageCode": "en"
            },
            "primaryType": "pizza_restaurant"
        }
    ]
}

// Task 1: Implement location access to determine user's current position
function getUserLocation() {
    // location format = obj --> {lat: cord, lng: cord}

    // If Geolocation doesnt work just use Default VT
    // Geolcation DOCS: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
    if (!('geolocation' in navigator)) {
        console.warn('Geolocation API not available; using default.');
        return Promise.resolve({ ...DEFAULT_LOC, source: 'default_VT' });
    }

    // return Promise of user location on success and promise of VT location on failure
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                // console.log('Success; user location:', loc);
                resolve({ ...loc, source: 'browser' });
            },
            (err) => {
                console.warn('Location error:', err.message, 'Using VT default.');
                // console.log("Failure. Using default location: ", DEFAULT_LOC)
                resolve({ ...DEFAULT_LOC, source: 'default_VT' });
            },
            { enableHighAccuracy: false, timeout: 8000 }
        );
    });
}

// Task 2: Calculate distance from user's location to each restaurant
// Function: Check if user location is near or at Virginia Tech (within 150 meters) using haversine formula
function isNearVT(userLoc) {
    // Earth radius in meters
    const R = 6371000;

    // degrees → radians
    const toRad = (deg) => deg * Math.PI / 180;

    // Great-circle distance in meters between two {lat,lng} points
    function haversineMeters(a, b) {
        const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
        const Δφ = toRad(b.lat - a.lat);
        const Δλ = toRad(b.lng - a.lng);

        const s = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

        return 2 * R * Math.asin(Math.sqrt(s));
    }

    const dist = haversineMeters(userLoc, DEFAULT_LOC);

    return dist <= 150; // meters
}
// Function: Get Restaurants for User: If at or near VT, then no need for API call, else do API call on user location
function getNearbyRestaurants(user_loc) {
    console.log("Here is the user: ", user_loc);
    // if user location is VT (or nearby?), then just give preset list of nearby restaurants
    if (isNearVT(user_loc)) {
        return VT_RESTAURANTS
    } else {
        return findPlacesNearby(user_loc)
    }
}

// Function: make a Nearby Search API call and log results
// Documentation here: https://developers.google.com/maps/documentation/places/web-service/op-overview
async function findPlacesNearby(user_loc) {
    const url = "https://places.googleapis.com/v1/places:searchNearby";
    const body = {
        includedTypes: ["restaurant"],
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: {
            circle: {
                center: { latitude: user_loc.lat, longitude: user_loc.lng },
                radius: 800.0
            }
        }
    };

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": API_KEY,
                "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.primaryType,places.priceLevel"
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            console.error("HTTP error:", res.status, await res.text());
            return null;
        }

        const data = await res.json();
        console.log("Raw Places API response:", data);
        return data; // <-- now you actually return the result
    } catch (err) {
        console.error("Fetch failed:", err);
        return null;
    }
}

// Task 3: Filter restaurant result based on calculated distance
// Since API result is already sorted by distance we will just parse JSON into a map for easy access
function getRestaurantResults(data) {
  const places = data.places;
  const restaurants = new Map(); // preserves insertion order for ranked distance

  for (const p of places) {
    const name = p.displayName.text;

    if (!restaurants.has(name)) {
      restaurants.set(name, []); // first time we see this brand
    }

    restaurants.get(name).push({
      location: p.location, // coordinates
      address: p.formattedAddress, // address
      primaryType: p.primaryType, // restaurant type ie "breakfast"
      priceLevel: p.priceLevel // price level ie "inexpensive"
    });
  }

  return restaurants;
}






