document.getElementById('ask').onclick = () => {
    getUserLocation().then(loc => {
        // console.log("Done", loc);
        getNearbyRestaurants(loc)
    });
};

// Task 1: Implement location access to determine user's current position
function getUserLocation() {
    // location format = obj --> {lat: cord, lng: cord}
    const DEFAULT_LOC = { lat: 38.83787365277667, lng: -77.04866272510975 }; // VT Innovation Campus

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
function getNearbyRestaurants(user_loc){
    console.log("Here is the user: ", user_loc);
}

function getRestaurantDistances(restaurants) {

}

// Task 3: Filter restaurant result based on calculated distance






