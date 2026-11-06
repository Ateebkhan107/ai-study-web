export const GRAVITY = 9.81;

export function calculateProjectile(angleDegrees, initialSpeedMps) {
  const radians = angleDegrees * Math.PI / 180;
  const vx = initialSpeedMps * Math.cos(radians);
  const vy = initialSpeedMps * Math.sin(radians);
  const apexTime = vy / GRAVITY;
  const flightTime = 2 * apexTime;
  const range = vx * flightTime;
  const height = vy * apexTime / 2;

  function atTime(seconds) {
    return {
      x: vx * seconds,
      y: seconds * (vy - GRAVITY * seconds / 2),
      vy: vy - GRAVITY * seconds,
    };
  }

  return { vx, vy, apexTime, flightTime, range, height, atTime };
}
