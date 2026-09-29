// Haversine formula - distance in km between two lat/lng points
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  if (
    lat1 == null || lng1 == null || lat2 == null || lng2 == null
  ) return null;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

module.exports = { getDistanceKm };
