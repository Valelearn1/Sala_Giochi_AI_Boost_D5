/*
 * L'AUTO (logica pura, testata)
 *
 * Una guida "da sala giochi": niente motore fisico, solo velocità e direzione.
 * - gas: accelera fino alla velocità massima (più bassa fuori pista);
 * - freno: rallenta e, da fermi, fa retromarcia piano;
 * - sinistra/destra: sterza, tanto più quanto più si va veloci.
 */

export function createCar({ x, y, angle }) {
  return { x, y, angle, speed: 0 };
}

/**
 * Fa avanzare l'auto di `dt` secondi. Modifica e restituisce `car`.
 * @param {object} car
 * @param {{ gas: boolean, brake: boolean, left: boolean, right: boolean }} controls
 * @param {number} dt - secondi
 * @param {object} config - CAR da config/physics-config.js
 * @param {boolean} onRoad - vero se l'auto è sulla strada
 */
export function stepCar(car, controls, dt, config, onRoad) {
  const maxSpeed = onRoad ? config.maxSpeed : config.offroadMaxSpeed;
  const friction = onRoad ? config.friction : config.offroadFriction;

  if (controls.gas) {
    car.speed += config.acceleration * dt;
  } else if (controls.brake) {
    car.speed -= (car.speed > 0 ? config.braking : config.acceleration * 0.5) * dt;
  } else {
    // Senza pedali l'auto rallenta da sola fino a fermarsi
    const slowDown = Math.min(Math.abs(car.speed), friction * dt);
    car.speed -= Math.sign(car.speed) * slowDown;
  }

  // Fuori pista la velocità scende (non di colpo) verso il massimo consentito
  if (car.speed > maxSpeed) car.speed = Math.max(maxSpeed, car.speed - friction * 2 * dt);
  if (car.speed < -config.reverseMaxSpeed) car.speed = -config.reverseMaxSpeed;

  // Sterzo: da fermi non si gira; in retromarcia lo sterzo si inverte, come in un'auto vera
  const turn = (controls.right ? 1 : 0) - (controls.left ? 1 : 0);
  const grip = Math.min(1, Math.abs(car.speed) / config.steeringSpeed);
  car.angle += turn * config.steering * grip * Math.sign(car.speed) * dt;

  car.x += Math.cos(car.angle) * car.speed * dt;
  car.y += Math.sin(car.angle) * car.speed * dt;
  return car;
}

/** Tiene l'auto dentro il campo: contro il bordo si ferma. */
export function keepInside(car, width, height, margin = 12) {
  const x = Math.min(width - margin, Math.max(margin, car.x));
  const y = Math.min(height - margin, Math.max(margin, car.y));
  if (x !== car.x || y !== car.y) {
    car.x = x;
    car.y = y;
    car.speed *= 0.3;
  }
  return car;
}
