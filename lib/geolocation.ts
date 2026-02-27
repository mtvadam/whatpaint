import zipData from '@/data/generated-zipcodes.json';

export type LocationResult = {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  zipCode?: string;
};

type ZipEntry = {
  zip: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
};

const zipDatabase = zipData as ZipEntry[];

/**
 * Request browser geolocation
 */
export async function getBrowserLocation(): Promise<LocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result: LocationResult = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        // Reverse geocode from bundled zip data (find nearest zip)
        const nearest = findNearestZip(pos.coords.latitude, pos.coords.longitude);
        if (nearest) {
          result.city = nearest.city;
          result.state = nearest.state;
          result.zipCode = nearest.zip;
        }
        resolve(result);
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/**
 * Look up location from zip code — uses bundled open-source data, no API key
 */
export async function getLocationFromZipCode(zipCode: string): Promise<LocationResult> {
  const cleaned = zipCode.trim().replace(/\D/g, '').slice(0, 5);
  const entry = zipDatabase.find(z => z.zip === cleaned);

  if (entry) {
    return {
      latitude: entry.lat,
      longitude: entry.lng,
      city: entry.city,
      state: entry.state,
      zipCode: entry.zip,
    };
  }

  // If exact zip not in our database, try to find closest zip prefix
  const prefix = cleaned.slice(0, 3);
  const nearby = zipDatabase.find(z => z.zip.startsWith(prefix));
  if (nearby) {
    return {
      latitude: nearby.lat,
      longitude: nearby.lng,
      city: nearby.city,
      state: nearby.state,
      zipCode: cleaned,
    };
  }

  // Fallback
  return {
    latitude: 0,
    longitude: 0,
    city: 'Unknown',
    state: '',
    zipCode: cleaned,
  };
}

/**
 * Find nearest zip code entry to given coordinates
 */
function findNearestZip(lat: number, lng: number): ZipEntry | null {
  if (zipDatabase.length === 0) return null;

  let nearest = zipDatabase[0];
  let minDist = haversine(lat, lng, nearest.lat, nearest.lng);

  for (const z of zipDatabase) {
    const d = haversine(lat, lng, z.lat, z.lng);
    if (d < minDist) {
      minDist = d;
      nearest = z;
    }
  }

  return nearest;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
