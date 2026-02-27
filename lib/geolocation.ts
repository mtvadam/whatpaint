export type LocationResult = {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  zipCode?: string;
};

/**
 * Request browser geolocation permission and get coordinates
 */
export async function getBrowserLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Mock location lookup from zip code
 * In production, this would call a geocoding API
 */
export async function getLocationFromZipCode(zipCode: string): Promise<LocationResult> {
  // Mock implementation - would use real geocoding API in production
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        latitude: 0,
        longitude: 0,
        zipCode,
        city: 'City Name',
        state: 'ST',
      });
    }, 500);
  });
}

/**
 * Mock reverse geocoding
 * In production, this would call a reverse geocoding API
 */
export async function reverseGeocode(lat: number, lng: number): Promise<Partial<LocationResult>> {
  // Mock implementation - would use real reverse geocoding API in production
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        city: 'Your City',
        state: 'ST',
        zipCode: '12345',
      });
    }, 500);
  });
}
