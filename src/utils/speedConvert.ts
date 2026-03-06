/**
 * Converts a speed string like "4–6 m/s" to include km/h:
 * "4–6 m/s (14–22 km/h)"
 */
export function formatSpeedWithKmh(speedMs: string): string {
  const match = speedMs.match(/(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*m\/s/);
  if (!match) return speedMs;
  const low = Math.round(parseFloat(match[1]) * 3.6);
  const high = Math.round(parseFloat(match[2]) * 3.6);
  return `${match[1]}–${match[2]} m/s (${low}–${high} km/h)`;
}
