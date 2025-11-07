import { DEFAULT_LOC } from "../constants";

export async function getUserLocation() {
  if (!("geolocation" in navigator)) {
    console.warn("Geolocation API not available; using default.");
    return { ...DEFAULT_LOC, source: "default_VT" };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        resolve({ ...loc, source: "browser" });
      },
      (err) => {
        console.warn("Location error:", err.message, "Using VT default.");
        resolve({ ...DEFAULT_LOC, source: "default_VT" });
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  });
}
