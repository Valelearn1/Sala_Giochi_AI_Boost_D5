/*
 * DISEGNO DELLA PISTA (Canvas)
 *
 * - Strato statico (prato, strada, cordoli, traguardo, decorazioni): disegnato
 *   una volta in un canvas nascosto e ricopiato a ogni fotogramma.
 * - A ogni fotogramma: la scia e il veicolo.
 * Il tema (config/theme.js) decide colori, decorazioni e veicolo.
 */

import { TRACK_WIDTH, TRACK_HEIGHT, ROAD_WIDTH } from './config/track.js';
import { nearestOnTrack } from './track.js';

const TRAIL_LENGTH = 14;

export function createRenderer({ canvas, path, lengths, theme: initialTheme }) {
  const ctx = canvas.getContext('2d');
  const staticLayer = document.createElement('canvas');
  const staticCtx = staticLayer.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let theme = initialTheme;
  let pixelScale = 1;
  const trail = [];
  // Posti liberi per le decorazioni: lontani dalla strada, calcolati una volta sola
  const decorSpots = findDecorSpots(path, lengths);

  function resize(maxWidth, maxHeight) {
    const scale = Math.min(maxWidth / TRACK_WIDTH, maxHeight / TRACK_HEIGHT);
    const width = Math.floor(TRACK_WIDTH * scale);
    const height = Math.floor(TRACK_HEIGHT * scale);
    const ratio = window.devicePixelRatio || 1;
    pixelScale = scale * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = staticLayer.width = Math.floor(width * ratio);
    canvas.height = staticLayer.height = Math.floor(height * ratio);
    drawStaticLayer();
  }

  function setTheme(newTheme) {
    theme = newTheme;
    drawStaticLayer();
  }

  /** Una nuova corsa: niente scia della corsa di prima. */
  function reset() {
    trail.length = 0;
  }

  // --- Strato statico -----------------------------------------------------

  function drawStaticLayer() {
    if (!staticLayer.width) return;
    const c = staticCtx;
    const { colors } = theme;
    c.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);

    // Prato (o cielo notturno) a strisce
    c.fillStyle = colors.ground;
    c.fillRect(0, 0, TRACK_WIDTH, TRACK_HEIGHT);
    c.fillStyle = colors.groundStripe;
    for (let y = 0; y < TRACK_HEIGHT; y += 60) c.fillRect(0, y, TRACK_WIDTH, 30);

    if (theme.decor === 'rune') drawStars(c);
    drawDecor(c);

    // Bordo della strada: cordoli, marciapiede o alone d'oro
    c.lineJoin = 'round';
    c.lineCap = 'round';
    if (colors.outline) {
      traceLoop(c);
      c.strokeStyle = colors.outline;
      c.lineWidth = ROAD_WIDTH + 18;
      c.stroke();
    }
    traceLoop(c);
    c.strokeStyle = colors.curbA;
    c.lineWidth = ROAD_WIDTH + 12;
    if (colors.edgeGlow) {
      c.shadowColor = colors.edgeGlow;
      c.shadowBlur = 16;
    }
    c.stroke();
    c.shadowBlur = 0;
    if (colors.curbB !== colors.curbA) {
      traceLoop(c);
      c.strokeStyle = colors.curbB;
      c.setLineDash([14, 14]);
      c.stroke();
      c.setLineDash([]);
    }

    // La strada
    traceLoop(c);
    c.strokeStyle = colors.road;
    c.lineWidth = ROAD_WIDTH;
    c.stroke();

    // Riga di mezzo tratteggiata
    traceLoop(c);
    c.strokeStyle = colors.centerLine;
    c.lineWidth = 3;
    c.setLineDash([18, 22]);
    c.stroke();
    c.setLineDash([]);

    if (theme.decor === 'rune') drawRuneDots(c);
    drawStartLine(c);
  }

  function traceLoop(c) {
    c.beginPath();
    c.moveTo(path[0].x, path[0].y);
    for (const point of path) c.lineTo(point.x, point.y);
    c.closePath();
  }

  /** Il traguardo: una striscia a scacchi di traverso sulla strada. */
  function drawStartLine(c) {
    const a = path[0];
    const b = path[1];
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    c.save();
    c.translate(a.x, a.y);
    c.rotate(angle);
    const size = 7;
    const half = ROAD_WIDTH / 2;
    for (let row = 0; row < 2; row++) {
      for (let y = -half; y < half; y += size) {
        const dark = (Math.round((y + half) / size) + row) % 2 === 0;
        c.fillStyle = dark ? '#111111' : '#ffffff';
        c.fillRect(-size + row * size, y, size, size);
      }
    }
    c.restore();
  }

  function drawStars(c) {
    let seed = 7;
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 90; i++) {
      c.fillStyle = `rgba(255, 244, 200, ${0.25 + random() * 0.6})`;
      c.beginPath();
      c.arc(random() * TRACK_WIDTH, random() * TRACK_HEIGHT, 0.6 + random() * 1.4, 0, Math.PI * 2);
      c.fill();
    }
  }

  /** Puntini d'oro sul sentiero, come rune incise. */
  function drawRuneDots(c) {
    c.fillStyle = 'rgba(236, 194, 70, 0.22)';
    for (let i = 0; i < path.length; i += 2) {
      const p = path[i];
      c.beginPath();
      c.arc(p.x, p.y, 2, 0, Math.PI * 2);
      c.fill();
    }
  }

  function drawDecor(c) {
    decorSpots.forEach((spot, index) => {
      if (theme.decor === 'funghi') {
        if (index % 2) drawQuestionBlock(c, spot.x, spot.y);
        else drawMushroom(c, spot.x, spot.y);
      } else if (theme.decor === 'rune') {
        drawMagicCircle(c, spot.x, spot.y, index);
      } else if (theme.decor === 'springfield') {
        if (index % 3 === 0) drawHouse(c, spot.x, spot.y, index);
        else if (index % 3 === 1) drawTree(c, spot.x, spot.y);
        else drawBigDonut(c, spot.x, spot.y);
      }
    });
  }

  function drawQuestionBlock(c, x, y) {
    c.fillStyle = '#000000';
    c.fillRect(x - 15, y - 15, 30, 30);
    c.fillStyle = '#f8b800';
    c.fillRect(x - 13, y - 13, 26, 26);
    c.fillStyle = '#b05800';
    for (const [dx, dy] of [[-11, -11], [9, -11], [-11, 9], [9, 9]]) c.fillRect(x + dx, y + dy, 2, 2);
    c.fillStyle = '#ffffff';
    c.font = '18px "Press Start 2P", monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('?', x + 1, y + 2);
  }

  function drawMushroom(c, x, y) {
    c.fillStyle = '#ffd8a8';
    c.fillRect(x - 7, y, 14, 12);
    c.fillStyle = '#e4202a';
    c.beginPath();
    c.arc(x, y + 2, 16, Math.PI, 0);
    c.fill();
    c.fillStyle = '#ffffff';
    for (const [dx, dy, r] of [[0, -7, 4], [-9, -1, 3], [9, -1, 3]]) {
      c.beginPath();
      c.arc(x + dx, y + dy, r, 0, Math.PI * 2);
      c.fill();
    }
  }

  function drawMagicCircle(c, x, y, index) {
    c.save();
    c.translate(x, y);
    c.rotate(index);
    c.strokeStyle = 'rgba(236, 194, 70, 0.35)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(0, 0, 20, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    for (let i = 0; i <= 6; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2; // stella a cinque punte
      if (i === 0) c.moveTo(Math.cos(angle) * 16, Math.sin(angle) * 16);
      else c.lineTo(Math.cos(angle) * 16, Math.sin(angle) * 16);
    }
    c.stroke();
    c.restore();
  }

  function drawHouse(c, x, y, index) {
    const walls = ['#f6a96b', '#9ec9f5', '#c7a3e0'][index % 3];
    c.lineWidth = 2.5;
    c.strokeStyle = '#1b1b1b';
    c.fillStyle = walls;
    c.fillRect(x - 18, y - 6, 36, 24);
    c.strokeRect(x - 18, y - 6, 36, 24);
    c.fillStyle = '#b5523b';
    c.beginPath();
    c.moveTo(x - 23, y - 6);
    c.lineTo(x, y - 24);
    c.lineTo(x + 23, y - 6);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = '#ffffff';
    c.fillRect(x - 4, y + 6, 8, 12);
    c.strokeRect(x - 4, y + 6, 8, 12);
  }

  function drawTree(c, x, y) {
    c.fillStyle = '#7a4a24';
    c.fillRect(x - 3, y + 4, 6, 12);
    c.fillStyle = '#2f9e44';
    c.strokeStyle = '#1b1b1b';
    c.lineWidth = 2.5;
    c.beginPath();
    c.arc(x, y - 4, 14, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }

  function drawBigDonut(c, x, y) {
    c.lineWidth = 2.5;
    c.strokeStyle = '#1b1b1b';
    c.fillStyle = '#f4b860';
    c.beginPath();
    c.arc(x, y, 17, 0, Math.PI * 2);
    c.fill();
    c.stroke();
    c.fillStyle = '#f48fb1';
    c.beginPath();
    c.arc(x, y, 13, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = theme.colors.ground;
    c.beginPath();
    c.arc(x, y, 5, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }

  // --- Ogni fotogramma -----------------------------------------------------

  /**
   * @param {{ x, y, angle, speed }} car
   * @param {{ offRoad: boolean }} view
   */
  function draw(car, view = {}) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(staticLayer, 0, 0);
    ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
    if (!car) return;

    updateTrail(car);
    drawTrail(view.offRoad);
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    if (theme.vehicle === 'broom') drawBroom();
    else if (theme.vehicle === 'sedan') drawSedan();
    else drawKart();
    ctx.restore();
  }

  function updateTrail(car) {
    if (reducedMotion.matches || Math.abs(car.speed) < 40) {
      if (trail.length) trail.shift();
      return;
    }
    // Il punto della scia parte dal retro del veicolo
    trail.push({ x: car.x - Math.cos(car.angle) * 16, y: car.y - Math.sin(car.angle) * 16 });
    if (trail.length > TRAIL_LENGTH) trail.shift();
  }

  function drawTrail(offRoad) {
    // Fuori strada la scia diventa polvere marrone
    const rgb = offRoad && theme.decor !== 'rune' ? '150, 110, 60' : theme.colors.trail;
    trail.forEach((point, index) => {
      const age = (index + 1) / trail.length;
      ctx.fillStyle = `rgba(${rgb}, ${0.4 * age})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2 + age * 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /** Kart rosso visto dall'alto, con il pilota col cappello (versione classica). */
  function drawKart() {
    const { colors } = theme;
    ctx.fillStyle = '#111111';
    for (const [x, y] of [[-12, -11], [8, -11], [-12, 7], [8, 7]]) ctx.fillRect(x, y, 8, 4);
    ctx.fillStyle = colors.car;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-15, -8, 30, 16, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd8a8';
    ctx.beginPath();
    ctx.arc(-3, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.car; // cappello
    ctx.beginPath();
    ctx.arc(-3, 0, 5.5, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();
    ctx.fillStyle = colors.carDetail;
    ctx.fillRect(10, -5, 3, 10); // paraurti
  }

  /** Un Cavaliere Magico a cavallo della scopa (versione anime). */
  function drawBroom() {
    const { colors } = theme;
    // Saggina, dietro
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-24, -8);
    ctx.lineTo(-22, 0);
    ctx.lineTo(-24, 8);
    ctx.closePath();
    ctx.fill();
    // Manico
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
    // Mantello e testa
    ctx.fillStyle = colors.car;
    ctx.beginPath();
    ctx.ellipse(-2, 0, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2d2b6';
    ctx.beginPath();
    ctx.arc(4, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.carDetail; // fermaglio d'oro
    ctx.beginPath();
    ctx.arc(-2, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /** L'auto rosa di famiglia, con i vetri azzurri (versione Simpson). */
  function drawSedan() {
    const { colors } = theme;
    ctx.fillStyle = '#1b1b1b';
    for (const [x, y] of [[-12, -11], [7, -11], [-12, 8], [7, 8]]) ctx.fillRect(x, y, 7, 3);
    ctx.fillStyle = colors.car;
    ctx.strokeStyle = '#1b1b1b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-16, -9, 32, 18, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = colors.carDetail;
    ctx.beginPath();
    ctx.roundRect(2, -6, 7, 12, 2); // parabrezza
    ctx.roundRect(-11, -6, 5, 12, 2); // lunotto
    ctx.fill();
    ctx.stroke();
  }

  return { resize, draw, setTheme, reset };
}

/** Punti di una griglia lontani dalla strada (e dai bordi): lì vanno le decorazioni. */
function findDecorSpots(path, lengths) {
  const spots = [];
  for (let y = 70; y < TRACK_HEIGHT - 40; y += 85) {
    for (let x = 50; x < TRACK_WIDTH - 30; x += 95) {
      const offsetX = (y / 85) % 2 ? 40 : 0; // a file sfalsate, non in colonna
      const px = x + offsetX;
      if (px > TRACK_WIDTH - 30) continue;
      if (nearestOnTrack(path, lengths, px, y).distance > ROAD_WIDTH / 2 + 34) spots.push({ x: px, y });
    }
  }
  return spots;
}
