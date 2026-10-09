/*
 * GEOMETRIA DELLA PISTA (logica pura, testata)
 *
 * - smoothLoop: trasforma i punti di controllo in una curva morbida (Catmull-Rom).
 * - nearestOnTrack: il punto della linea centrale più vicino a una posizione,
 *   con la distanza e l'avanzamento nel giro (da 0 a 1).
 */

/**
 * Curva chiusa e morbida che passa per tutti i punti.
 * @param {number[][]} points - [[x, y], …]
 * @param {number} steps - quanti punti fra un punto di controllo e il successivo
 * @returns {{ x: number, y: number }[]}
 */
export function smoothLoop(points, steps = 8) {
  const result = [];
  const count = points.length;
  for (let i = 0; i < count; i++) {
    const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((offset) => points[(i + offset + count) % count]);
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      // Formula di Catmull-Rom: la curva passa per p1 e p2, p0 e p3 ne decidono la direzione
      const at = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      result.push({ x: at(p0[0], p1[0], p2[0], p3[0]), y: at(p0[1], p1[1], p2[1], p3[1]) });
    }
  }
  return result;
}

/** Lunghezze cumulative dei tratti, per sapere "a che punto del giro" si è. */
export function measureLoop(path) {
  const cumulative = [0];
  for (let i = 1; i <= path.length; i++) {
    const a = path[i - 1];
    const b = path[i % path.length];
    cumulative.push(cumulative[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  return { cumulative, total: cumulative[path.length] };
}

/**
 * Il punto della linea centrale più vicino a (x, y).
 * @returns {{ distance: number, progress: number, segment: number }}
 *   progress va da 0 (traguardo) a 1 (giro completo)
 */
export function nearestOnTrack(path, lengths, x, y) {
  let best = { distance: Infinity, progress: 0, segment: 0 };
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    const b = path[(i + 1) % path.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSquared = dx * dx + dy * dy || 1;
    // Quanto avanti sul tratto a→b cade la proiezione del punto (da 0 a 1)
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lengthSquared));
    const distance = Math.hypot(x - (a.x + dx * t), y - (a.y + dy * t));
    if (distance < best.distance) {
      const along = lengths.cumulative[i] + Math.sqrt(lengthSquared) * t;
      best = { distance, progress: along / lengths.total, segment: i };
    }
  }
  return best;
}

/** Direzione della pista in un punto (angolo in radianti), per mettere l'auto sulla griglia di partenza. */
export function directionAt(path, index) {
  const a = path[index];
  const b = path[(index + 1) % path.length];
  return Math.atan2(b.y - a.y, b.x - a.x);
}
