document.getElementById('ask').onclick = () => {
    getUserLocation().then(loc => {
        // console.log("Done", loc);
        console.log(getNearbyRestaurants(loc))
    });
};

const API_KEY = window.APP_CONFIG?.GOOGLE_API_KEY;
const DEFAULT_LOC = { lat: 38.83787365277667, lng: -77.04866272510975 }; // VT Innovation Campus

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






