// Distance calculation utilities using Haversine formula

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find nearest parking spot from user's location
 */
export function findNearestParking(
  userLat: number,
  userLon: number,
  parkingSpots: any[]
): any | null {
  if (!parkingSpots || parkingSpots.length === 0) return null;

  let nearest = parkingSpots[0];
  let minDistance = calculateDistance(
    userLat,
    userLon,
    parkingSpots[0].latitude,
    parkingSpots[0].longitude
  );

  for (let i = 1; i < parkingSpots.length; i++) {
    const distance = calculateDistance(
      userLat,
      userLon,
      parkingSpots[i].latitude,
      parkingSpots[i].longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = parkingSpots[i];
    }
  }

  return { ...nearest, distance: minDistance };
}

/**
 * Sort parking spots by distance from user location
 */
export function sortByDistance(
  userLat: number,
  userLon: number,
  parkingSpots: any[]
): any[] {
  return parkingSpots
    .map((spot) => ({
      ...spot,
      distance: calculateDistance(
        userLat,
        userLon,
        spot.latitude,
        spot.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
}
