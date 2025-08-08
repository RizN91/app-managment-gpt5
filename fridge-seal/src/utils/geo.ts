export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export interface Point { id: string; lat: number; lon: number; }

export function nearestNextRoute(points: Point[], start: Point): Point[] {
  const remaining = [...points];
  const route: Point[] = [];
  let current = start;
  while (remaining.length) {
    let bestIdx = 0;
    let best = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i];
      const d = haversineKm(current.lat, current.lon, p.lat, p.lon);
      if (d < best) { best = d; bestIdx = i; }
    }
    current = remaining.splice(bestIdx,1)[0];
    route.push(current);
  }
  return route;
}