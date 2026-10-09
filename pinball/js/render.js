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
    drawWalls();
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

  return { resize, draw };
}
