/**
 * Geohash Implementation for IPV7 Proximity Routing
 *
 * Geohash encodes geographic coordinates into a string that enables
 * proximity-based routing - nodes with similar geohashes are physically close.
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encode latitude/longitude into a geohash string
 */
export function encode(
  latitude: number,
  longitude: number,
  precision: number = 4
): string {
  // Validate inputs
  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }

  let latRange = { min: -90, max: 90 };
  let lonRange = { min: -180, max: 180 };
  let isLon = true;
  let bit = 0;
  let charIndex = 0;
  let geohash = '';

  while (geohash.length < precision) {
    if (isLon) {
      const mid = (lonRange.min + lonRange.max) / 2;
      if (longitude >= mid) {
        charIndex = (charIndex << 1) | 1;
        lonRange.min = mid;
      } else {
        charIndex = charIndex << 1;
        lonRange.max = mid;
      }
    } else {
      const mid = (latRange.min + latRange.max) / 2;
      if (latitude >= mid) {
        charIndex = (charIndex << 1) | 1;
        latRange.min = mid;
      } else {
        charIndex = charIndex << 1;
        latRange.max = mid;
      }
    }

    isLon = !isLon;
    bit++;

    if (bit === 5) {
      geohash += BASE32[charIndex];
      bit = 0;
      charIndex = 0;
    }
  }

  return geohash;
}

/**
 * Decode a geohash string back to latitude/longitude
 */
export function decode(geohash: string): {
  latitude: number;
  longitude: number;
  error: { latitude: number; longitude: number };
} {
  let latRange = { min: -90, max: 90 };
  let lonRange = { min: -180, max: 180 };
  let isLon = true;

  for (const char of geohash.toLowerCase()) {
    const charIndex = BASE32.indexOf(char);
    if (charIndex === -1) {
      throw new Error(`Invalid geohash character: ${char}`);
    }

    for (let bit = 4; bit >= 0; bit--) {
      const mask = 1 << bit;
      if (isLon) {
        const mid = (lonRange.min + lonRange.max) / 2;
        if (charIndex & mask) {
          lonRange.min = mid;
        } else {
          lonRange.max = mid;
        }
      } else {
        const mid = (latRange.min + latRange.max) / 2;
        if (charIndex & mask) {
          latRange.min = mid;
        } else {
          latRange.max = mid;
        }
      }
      isLon = !isLon;
    }
  }

  return {
    latitude: (latRange.min + latRange.max) / 2,
    longitude: (lonRange.min + lonRange.max) / 2,
    error: {
      latitude: (latRange.max - latRange.min) / 2,
      longitude: (lonRange.max - lonRange.min) / 2,
    },
  };
}

/**
 * Get all 8 neighboring geohashes
 */
export function neighbors(geohash: string): string[] {
  const { latitude, longitude, error } = decode(geohash);
  const precision = geohash.length;
  const latStep = error.latitude * 2;
  const lonStep = error.longitude * 2;

  const directions = [
    { lat: latStep, lon: 0 }, // North
    { lat: latStep, lon: lonStep }, // Northeast
    { lat: 0, lon: lonStep }, // East
    { lat: -latStep, lon: lonStep }, // Southeast
    { lat: -latStep, lon: 0 }, // South
    { lat: -latStep, lon: -lonStep }, // Southwest
    { lat: 0, lon: -lonStep }, // West
    { lat: latStep, lon: -lonStep }, // Northwest
  ];

  return directions.map(({ lat, lon }) =>
    encode(latitude + lat, longitude + lon, precision)
  );
}

/**
 * Calculate approximate distance between two geohashes in kilometers
 */
export function distance(geohash1: string, geohash2: string): number {
  const pos1 = decode(geohash1);
  const pos2 = decode(geohash2);

  return haversineDistance(
    pos1.latitude,
    pos1.longitude,
    pos2.latitude,
    pos2.longitude
  );
}

/**
 * Haversine formula for distance between two points on Earth
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Get the common prefix length between two geohashes
 * Longer prefix = closer proximity
 */
export function commonPrefixLength(geohash1: string, geohash2: string): number {
  let length = 0;
  const minLen = Math.min(geohash1.length, geohash2.length);

  for (let i = 0; i < minLen; i++) {
    if (geohash1[i] === geohash2[i]) {
      length++;
    } else {
      break;
    }
  }

  return length;
}

/**
 * Check if geohash2 is within the area of geohash1
 */
export function contains(geohash1: string, geohash2: string): boolean {
  return geohash2.startsWith(geohash1);
}
