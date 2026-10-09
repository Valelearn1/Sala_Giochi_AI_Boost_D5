/*
 * DISEGNO
 *
 * Disegna il tavolo sul Canvas leggendo la disposizione (table-layout.js),
 * i colori (theme.js) e lo stato del momento preso dalla fisica.
 * Non modifica mai la fisica né le regole.
 *
 * Per non rifare ogni volta il lavoro pesante, le parti che non si muovono
 * (fondo, pareti, decorazioni) vengono disegnate UNA volta su un canvas
 * nascosto ("strato statico") e poi copiate a ogni fotogramma.
 */

const FLASH_MS = 280;
const PLANKTON_COUNT = 42;

export function createRenderer({ canvas, layout, theme }) {
  const ctx = canvas.getContext('2d');
  const colors = theme.colors;
  const staticLayer = document.createElement('canvas');
  const staticCtx = staticLayer.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let pixelScale = 1; // pixel reali per unità del tavolo
  const flashes = new Map();
  const plankton = createPlankton(layout);

  // --- Dimensioni ---------------------------------------------------------

  /** Adatta il canvas allo spazio disponibile (in pixel CSS), mantenendo le proporzioni del tavolo. */
  function resize(maxWidth, maxHeight) {
    const scale = Math.min(maxWidth / layout.TABLE_WIDTH, maxHeight / layout.TABLE_HEIGHT);
    const width = Math.floor(layout.TABLE_WIDTH * scale);
    const height = Math.floor(layout.TABLE_HEIGHT * scale);
    const pixelRatio = window.devicePixelRatio || 1;
    pixelScale = scale * pixelRatio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = staticLayer.width = Math.floor(width * pixelRatio);
    canvas.height = staticLayer.height = Math.floor(height * pixelRatio);
    drawStaticLayer();
  }

  // Il font pixel arriva dopo il primo disegno: quando è pronto rifacciamo lo strato statico
  document.fonts?.ready.then(() => drawStaticLayer());

  // --- Lampeggi -----------------------------------------------------------

  /** Fa lampeggiare un elemento (es. flash('bumper', 2)). */
  function flash(type, id) {
    flashes.set(`${type}:${id}`, performance.now());
  }

  /** Intensità del lampeggio da 0 (spento) a 1 (appena colpito). */
  function flashLevel(type, id) {
    const startedAt = flashes.get(`${type}:${id}`);
    if (startedAt === undefined) return 0;
    const level = 1 - (performance.now() - startedAt) / FLASH_MS;
    if (level <= 0) flashes.delete(`${type}:${id}`);
    return Math.max(0, level);
  }

  // --- Disegno di ogni fotogramma -----------------------------------------

  /**
   * @param {object} snapshot - stato della fisica (physics.getSnapshot())
   * @param {{ charge: number, lanesLit: boolean[] }} view - carica del lanciatore e luci delle corsie
   */
  function draw(snapshot, view) {
    const time = performance.now() / 1000;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(staticLayer, 0, 0);
    ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);

    drawPlankton(time);
    drawLanes(view.lanesLit ?? []);
    drawOutlanes();
    drawTargets(snapshot.targetsDown);
    drawSlingshots();
    drawBumpers(time);
    drawPlunger(view.charge);
    if (snapshot.gateClosed) drawGate();
    snapshot.flippers.forEach(drawFlipper);
    if (snapshot.ball) drawBall(snapshot.ball);
  }

  /* ======================================================================
     Strato statico: fondo, decorazioni del campo, pareti
     ====================================================================== */

  function drawStaticLayer() {
    if (!staticLayer.width) return;
    const c = staticCtx;
    c.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);

    // Fondo: dal blu dell'acqua in alto al nero degli abissi in basso
    const depth = c.createLinearGradient(0, 0, 0, layout.TABLE_HEIGHT);
    depth.addColorStop(0, colors.abyssTop);
    depth.addColorStop(1, colors.abyssBottom);
    c.fillStyle = depth;
    c.fillRect(0, 0, layout.TABLE_WIDTH, layout.TABLE_HEIGHT);

    // Luce che filtra dall'alto
    const light = c.createRadialGradient(300, -80, 40, 300, -80, 760);
    light.addColorStop(0, 'rgba(124, 249, 255, 0.22)');
    light.addColorStop(1, 'rgba(124, 249, 255, 0)');
    c.fillStyle = light;
    c.fillRect(0, 0, layout.TABLE_WIDTH, layout.TABLE_HEIGHT);

    drawSonarRings(c);
    drawTableName(c);
    drawDepthMarks(c);
    drawWalls(c);
  }

  /** Cerchi concentrici sottili, come lo schermo di un sonar, attorno ai bumper. */
  function drawSonarRings(c) {
    c.strokeStyle = 'rgba(47, 227, 211, 0.07)';
    c.lineWidth = 2;
    for (let radius = 90; radius <= 330; radius += 60) {
      c.beginPath();
      c.arc(276, 345, radius, 0, Math.PI * 2);
      c.stroke();
    }
  }

  /** Il nome del tavolo "dipinto" sul campo di gioco. */
  function drawTableName(c) {
    const [first, ...rest] = theme.tableName.toUpperCase().split(' ');
    c.save();
    c.textAlign = 'center';
    c.fillStyle = 'rgba(124, 249, 255, 0.14)';
    c.font = '26px "Press Start 2P", monospace';
    c.fillText(first, 276, 690);
    c.font = '40px "Press Start 2P", monospace';
    c.fillText(rest.join(' '), 276, 740);
    c.restore();
  }

  /** Tacche di profondità accanto alla corsia di lancio (più giù = più profondo). */
  function drawDepthMarks(c) {
    c.save();
    c.fillStyle = 'rgba(124, 249, 255, 0.28)';
    c.font = '9px "Press Start 2P", monospace';
    c.textAlign = 'right';
    for (let mark = 1; mark <= 3; mark++) {
      const y = 320 + mark * 110;
      c.fillRect(526, y, 8, 2);
      c.fillText(`-${mark * 250}m`, 522, y + 4);
    }
    c.restore();
  }

  function drawWalls(c) {
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const wall of layout.WALLS) {
      // Corpo della parete
      tracePolyline(c, wall.points);
      c.strokeStyle = colors.wall;
      c.lineWidth = wall.thickness;
      c.stroke();

      // Bordo luminoso con alone
      tracePolyline(c, wall.points);
      c.strokeStyle = colors.wallEdge;
      c.lineWidth = 2;
      c.shadowColor = colors.wallEdge;
      c.shadowBlur = 10;
      c.stroke();
      c.shadowBlur = 0;
    }
  }

  /* ======================================================================
     Elementi che cambiano
     ====================================================================== */

  /** Plancton luminoso che sale lentamente (fermo con "riduci movimento"). */
  function drawPlankton(time) {
    const drift = reducedMotion.matches ? 0 : time;
    for (const speck of plankton) {
      const y = ((speck.y - drift * speck.speed) % layout.TABLE_HEIGHT + layout.TABLE_HEIGHT) % layout.TABLE_HEIGHT;
      const x = speck.x + Math.sin(drift * 0.6 + speck.phase) * 6;
      const twinkle = 0.35 + 0.35 * Math.sin(drift * 1.7 + speck.phase);
      ctx.fillStyle = `rgba(124, 249, 255, ${twinkle * speck.alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, speck.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** I bumper sono meduse: cupola luminosa, macchie e tentacoli che ondeggiano. */
  function drawBumpers(time) {
    const sway = reducedMotion.matches ? 0 : time;
    for (const bumper of layout.BUMPERS) {
      const level = flashLevel('bumper', bumper.id);
      const r = bumper.radius * (1 + level * 0.1);
      const { x, y } = bumper;

      // Alone
      const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * (1.7 + level));
      halo.addColorStop(0, colors.bumperGlow);
      halo.addColorStop(1, 'rgba(255, 95, 162, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, r * (1.7 + level), 0, Math.PI * 2);
      ctx.fill();

      // Corpo
      const body = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
      body.addColorStop(0, level > 0 ? '#ffffff' : '#ffc2dc');
      body.addColorStop(0.55, colors.bumper);
      body.addColorStop(1, '#8a1f57');
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Tentacoli disegnati sul corpo, nella metà bassa
      ctx.strokeStyle = 'rgba(255, 230, 242, 0.75)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (let i = -2; i <= 2; i++) {
        const startX = x + i * r * 0.28;
        ctx.beginPath();
        ctx.moveTo(startX, y + r * 0.05);
        ctx.quadraticCurveTo(startX + Math.sin(sway * 2 + i) * 5, y + r * 0.45, startX + Math.sin(sway * 2 + i + 1) * 4, y + r * 0.8);
        ctx.stroke();
      }

      // Bordo della cupola
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI * 1.05, Math.PI * 1.95);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  /** Slingshot: conchiglie con il lato attivo luminoso. */
  function drawSlingshots() {
    for (const sling of layout.SLINGSHOTS) {
      const level = flashLevel('slingshot', sling.id);
      ctx.beginPath();
      ctx.moveTo(...sling.a);
      ctx.lineTo(...sling.b);
      ctx.lineTo(...sling.c);
      ctx.closePath();
      const shell = ctx.createLinearGradient(sling.b[0], sling.b[1], sling.a[0], sling.a[1]);
      shell.addColorStop(0, '#0b2e52');
      shell.addColorStop(1, '#155a7e');
      ctx.fillStyle = shell;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(...sling.a);
      ctx.lineTo(...sling.c);
      ctx.lineWidth = 5 + level * 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = level > 0 ? '#ffffff' : colors.slingshot;
      ctx.shadowColor = colors.slingshot;
      ctx.shadowBlur = 8 + level * 26;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  /** Bersagli: esche luminose, come quelle dei pesci degli abissi. */
  function drawTargets(targetsDown) {
    layout.TARGETS.forEach((target, index) => {
      const level = flashLevel('target', target.id);
      const left = target.x - target.width / 2;

      if (targetsDown[index]) {
        ctx.fillStyle = colors.targetDown;
        roundRect(left, target.y + target.height / 2 - 3, target.width, 3, 1.5);
        ctx.fill();
        return;
      }

      ctx.fillStyle = level > 0 ? '#ffffff' : colors.target;
      ctx.shadowColor = colors.target;
      ctx.shadowBlur = 12 + level * 26;
      roundRect(left, target.y - target.height / 2, target.width, target.height, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  /** Luci delle corsie superiori: perle che si accendono. */
  function drawLanes(lanesLit) {
    layout.TOP_LANES.forEach((lane, index) => {
      const level = flashLevel('lane', lane.id);
      const lit = lanesLit[index];
      ctx.beginPath();
      ctx.arc(lane.x, lane.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = lit || level > 0 ? colors.laneOn : colors.laneOff;
      ctx.shadowColor = colors.laneOn;
      ctx.shadowBlur = lit ? 18 : level * 22;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(124, 249, 255, 0.5)';
      ctx.stroke();
    });
  }

  /** Segni delle corsie di uscita: un piccolo corallo che si accende quando ci passa la pallina. */
  function drawOutlanes() {
    for (const outlane of layout.OUTLANES) {
      const level = flashLevel('outlane', outlane.id);
      ctx.fillStyle = colors.outlane;
      ctx.globalAlpha = 0.4 + level * 0.6;
      ctx.shadowColor = colors.outlane;
      ctx.shadowBlur = level * 20;
      ctx.beginPath();
      ctx.arc(outlane.x, outlane.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }
  }

  /** Il lanciatore: una molla che si comprime e un indicatore di carica. */
  function drawPlunger(charge) {
    const { laneLeft, laneRight, plungerTopY } = layout.SHOOTER;
    const width = laneRight - laneLeft;
    const pull = charge * 28;
    const top = plungerTopY + pull;

    // Testa del pistone
    ctx.fillStyle = colors.plunger;
    roundRect(laneLeft + 2, top, width - 4, 10, 3);
    ctx.fill();

    // Molla a zig-zag fino in fondo
    ctx.beginPath();
    const coils = 6;
    const springTop = top + 10;
    const springHeight = layout.TABLE_HEIGHT - springTop;
    ctx.moveTo(laneLeft + width / 2, springTop);
    for (let i = 1; i <= coils * 2; i++) {
      const x = i % 2 ? laneLeft + 6 : laneRight - 6;
      ctx.lineTo(x, springTop + (springHeight * i) / (coils * 2));
    }
    ctx.strokeStyle = 'rgba(124, 249, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Indicatore di carica: si riempie d'oro mentre si tiene premuto
    if (charge > 0) {
      const meterHeight = 120 * charge;
      ctx.fillStyle = colors.target;
      ctx.shadowColor = colors.target;
      ctx.shadowBlur = 14;
      roundRect(laneRight - 3, plungerTopY - 10 - meterHeight, 4, meterHeight, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawGate() {
    const { laneLeft, laneRight, gateY } = layout.SHOOTER;
    ctx.strokeStyle = colors.gate;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = colors.gate;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(laneLeft - 14, gateY);
    ctx.lineTo(laneRight + 2, gateY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawFlipper(flipper) {
    const points = flipper.vertices;
    ctx.beginPath();
    points.forEach((point, index) => (index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
    ctx.closePath();
    ctx.fillStyle = colors.flipper;
    ctx.shadowColor = colors.flipper;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = colors.flipperEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /** La pallina: una perla con riflesso. */
  function drawBall(ball) {
    const { x, y, radius } = ball;
    ctx.shadowColor = colors.ballGlow;
    ctx.shadowBlur = 18;
    const pearl = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.4, radius * 0.1, x, y, radius);
    pearl.addColorStop(0, '#ffffff');
    pearl.addColorStop(0.6, colors.ball);
    pearl.addColorStop(1, '#8fc9df');
    ctx.fillStyle = pearl;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // --- Utilità ------------------------------------------------------------

  function roundRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  return { resize, draw, flash };
}

function tracePolyline(c, points) {
  c.beginPath();
  c.moveTo(points[0][0], points[0][1]);
  for (const [x, y] of points.slice(1)) c.lineTo(x, y);
}

/** Posizioni casuali (ma sempre uguali) per il plancton. */
function createPlankton(layout) {
  let seed = 42;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: PLANKTON_COUNT }, () => ({
    x: 30 + random() * (layout.TABLE_WIDTH - 90),
    y: random() * layout.TABLE_HEIGHT,
    size: 0.8 + random() * 1.8,
    speed: 4 + random() * 10,
    phase: random() * Math.PI * 2,
    alpha: 0.4 + random() * 0.6,
  }));
}
