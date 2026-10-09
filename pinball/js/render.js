/*
 * DISEGNO
 *
 * Disegna il tavolo sul Canvas leggendo la disposizione (table-layout.js),
 * i colori (theme.js) e lo stato del momento preso dalla fisica.
 * Non modifica mai la fisica né le regole.
 */

export function createRenderer({ canvas, layout, theme }) {
  const ctx = canvas.getContext('2d');
  const colors = theme.colors;
  let scale = 1;

  // Lampeggi: per ogni elemento colpito ricordiamo quando è stato colpito
  const FLASH_MS = 260;
  const flashes = new Map();

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

  /** Adatta il canvas allo spazio disponibile (in pixel CSS), mantenendo le proporzioni del tavolo. */
  function resize(maxWidth, maxHeight) {
    scale = Math.min(maxWidth / layout.TABLE_WIDTH, maxHeight / layout.TABLE_HEIGHT);
    const width = Math.floor(layout.TABLE_WIDTH * scale);
    const height = Math.floor(layout.TABLE_HEIGHT * scale);
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    // Da qui in poi disegniamo in "unità del tavolo": il canvas pensa alla scala
    ctx.setTransform(scale * pixelRatio, 0, 0, scale * pixelRatio, 0, 0);
  }

  /**
   * @param {object} snapshot - stato della fisica (physics.getSnapshot())
   * @param {object} view - informazioni extra per il disegno (es. carica del lanciatore)
   */
  function draw(snapshot, view) {
    drawBackground();
    drawLanes(view.lanesLit);
    drawOutlanes();
    drawWalls();
    drawTargets(snapshot.targetsDown);
    drawSlingshots();
    drawBumpers();
    drawPlunger(view.charge);
    if (snapshot.gateClosed) drawGate();
    snapshot.flippers.forEach(drawFlipper);
    if (snapshot.ball) drawBall(snapshot.ball);
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, layout.TABLE_HEIGHT);
    gradient.addColorStop(0, colors.abyssTop);
    gradient.addColorStop(1, colors.abyssBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, layout.TABLE_WIDTH, layout.TABLE_HEIGHT);
  }

  function drawWalls() {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const wall of layout.WALLS) {
      tracePolyline(wall.points);
      ctx.strokeStyle = colors.wall;
      ctx.lineWidth = wall.thickness;
      ctx.stroke();

      tracePolyline(wall.points);
      ctx.strokeStyle = colors.wallEdge;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function tracePolyline(points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
  }

  function drawBumpers() {
    for (const bumper of layout.BUMPERS) {
      const level = flashLevel('bumper', bumper.id);
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.radius * (1 + level * 0.12), 0, Math.PI * 2);
      ctx.fillStyle = colors.bumper;
      ctx.shadowColor = colors.bumperGlow;
      ctx.shadowBlur = 8 + level * 30;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 3;
      ctx.strokeStyle = level > 0 ? '#ffffff' : colors.flipperEdge;
      ctx.stroke();
    }
  }

  function drawSlingshots() {
    for (const sling of layout.SLINGSHOTS) {
      const level = flashLevel('slingshot', sling.id);
      ctx.beginPath();
      ctx.moveTo(...sling.a);
      ctx.lineTo(...sling.b);
      ctx.lineTo(...sling.c);
      ctx.closePath();
      ctx.fillStyle = colors.wall;
      ctx.fill();
      // Il lato attivo si illumina
      ctx.beginPath();
      ctx.moveTo(...sling.a);
      ctx.lineTo(...sling.c);
      ctx.lineWidth = 4 + level * 4;
      ctx.strokeStyle = colors.slingshot;
      ctx.shadowColor = colors.slingshot;
      ctx.shadowBlur = level * 24;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  function drawTargets(targetsDown) {
    layout.TARGETS.forEach((target, index) => {
      const level = flashLevel('target', target.id);
      const down = targetsDown[index];
      ctx.fillStyle = down ? colors.targetDown : colors.target;
      ctx.shadowColor = colors.target;
      ctx.shadowBlur = down ? 0 : 6 + level * 24;
      const height = down ? target.height * 0.35 : target.height;
      ctx.fillRect(target.x - target.width / 2, target.y - height / 2, target.width, height);
      ctx.shadowBlur = 0;
    });
  }

  function drawLanes(lanesLit = []) {
    layout.TOP_LANES.forEach((lane, index) => {
      const level = flashLevel('lane', lane.id);
      const lit = lanesLit[index];
      ctx.beginPath();
      ctx.arc(lane.x, lane.y, 9, 0, Math.PI * 2);
      ctx.fillStyle = lit || level > 0 ? colors.laneOn : colors.laneOff;
      ctx.shadowColor = colors.laneOn;
      ctx.shadowBlur = lit ? 16 : level * 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function drawOutlanes() {
    for (const outlane of layout.OUTLANES) {
      const level = flashLevel('outlane', outlane.id);
      ctx.fillStyle = colors.outlane;
      ctx.globalAlpha = 0.35 + level * 0.65;
      ctx.beginPath();
      ctx.arc(outlane.x, outlane.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawPlunger(charge) {
    const { laneLeft, laneRight, plungerTopY } = layout.SHOOTER;
    const pull = charge * 28; // il pistone si abbassa mentre si carica
    ctx.fillStyle = colors.plunger;
    ctx.fillRect(laneLeft, plungerTopY + pull, laneRight - laneLeft, layout.TABLE_HEIGHT - plungerTopY);
  }

  function drawGate() {
    const { laneLeft, laneRight, gateY } = layout.SHOOTER;
    ctx.strokeStyle = colors.gate;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(laneLeft - 16, gateY);
    ctx.lineTo(laneRight + 4, gateY);
    ctx.stroke();
  }

  function drawFlipper(flipper) {
    ctx.beginPath();
    flipper.vertices.forEach((point, index) => (index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)));
    ctx.closePath();
    ctx.fillStyle = colors.flipper;
    ctx.fill();
    ctx.strokeStyle = colors.flipperEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = colors.ball;
    ctx.shadowColor = colors.ballGlow;
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  return { resize, draw, flash };
}
