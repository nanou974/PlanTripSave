function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function nearestNeighbor(places) {
  if (places.length === 0) return [];
  if (places.length === 1) return places;
  const unvisited = [...places];
  const route = [unvisited.shift()];
  while (unvisited.length > 0) {
    const current = route[route.length - 1];
    let nearest = unvisited[0];
    let minDistance = calculateDistance(current.latitude, current.longitude, nearest.latitude, nearest.longitude);
    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(current.latitude, current.longitude, unvisited[i].latitude, unvisited[i].longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = unvisited[i];
      }
    }
    route.push(nearest);
    unvisited.splice(unvisited.indexOf(nearest), 1);
  }
  return route;
}

async function calculateOptimalRoute(places) {
  if (!places || places.length === 0) {
    return { route: [], totalDistance: 0, optimizationLevel: 'N/A' };
  }
  const optimized = nearestNeighbor(places);
  let totalDistance = 0;
  for (let i = 0; i < optimized.length - 1; i++) {
    totalDistance += calculateDistance(
      optimized[i].latitude,
      optimized[i].longitude,
      optimized[i + 1].latitude,
      optimized[i + 1].longitude
    );
  }
  return {
    route: optimized,
    totalDistance: Math.round(totalDistance * 100) / 100,
    optimizationLevel: 'Nearest Neighbor'
  };
}

module.exports = { calculateOptimalRoute, calculateDistance };
