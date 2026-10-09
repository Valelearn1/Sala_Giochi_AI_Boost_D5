/*
 * FISICA
 *
 * Costruisce il mondo di Matter.js a partire dalla disposizione del tavolo
 * (config/table-layout.js) e lo fa avanzare a passi fissi.
 *
 * Questo file non sa nulla di punti, turni o giocatori: quando la pallina
 * colpisce qualcosa chiama `onEvent({ type, id })` e se ne occupa main.js.
 */

import { Matter } from './matter.js';

const { Engine, Bodies, Body, Bounds, Composite, Events, Vector, Vertices } = Matter;

// "Categorie" di collisione: servono per accendere e spegnere elementi
const CATEGORY_DEFAULT = 0x0001;
const COLLIDE_WITH_ALL = 0xffffffff;
const COLLIDE_WITH_NOTHING = 0;

/**
 * @param {object} options
 * @param {object} options.layout - il contenuto di config/table-layout.js
 * @param {object} options.config - PHYSICS da config/physics-config.js
 * @param {(event: {type: string, id?: any}) => void} options.onEvent
 */
export function createPhysics({ layout, config, onEvent }) {
  const engine = Engine.create({ gravity: { x: 0, y: config.gravityY } });
  engine.positionIterations = 10;
  engine.velocityIterations = 8;

  const flippers = layout.FLIPPERS.map((data) => createFlipper(data, config));
  const shooterGate = createShooterGate(layout.SHOOTER);
  const drain = Bodies.rectangle(layout.DRAIN.x, layout.DRAIN.y, layout.DRAIN.width, layout.DRAIN.height, {
    isStatic: true,
    isSensor: true,
    plugin: { kind: 'drain' },
  });

  const bumpers = layout.BUMPERS.map((data) => createBumper(data, config));
  const slingshots = layout.SLINGSHOTS.map((data) => createSlingshot(data, config));
  const targets = layout.TARGETS.map((data) => createTarget(data, config));
  const sensors = [
    ...layout.TOP_LANES.map((data) => createSensor(data, 'lane')),
    ...layout.OUTLANES.map((data) => createSensor(data, 'outlane')),
  ];

  Composite.add(engine.world, [
    ...layout.WALLS.flatMap((wall) => createWall(wall, config)),
    createPlunger(layout.SHOOTER, config),
    shooterGate,
    drain,
    ...flippers.map((flipper) => flipper.body),
    ...bumpers,
    ...slingshots.map((slingshot) => slingshot.body),
    ...targets,
    ...sensors,
  ]);

  let ball = null;
  let stillMs = 0; // da quanto tempo la pallina è (quasi) ferma
  let targetsWaitingToRise = false; // bersagli da rialzare appena la pallina non c'è sopra

  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const other = otherBody(pair, ball);
      if (other) handleBallCollision(other);
    }
  });

  function handleBallCollision(body) {
    const { kind, id, points } = body.plugin ?? {};

    if (kind === 'drain') {
      removeBall();
      onEvent({ type: 'drain' });
    } else if (kind === 'bumper') {
      kickAwayFrom(body.position, config.bumperKick);
      onEvent({ type: 'bumper', id, points });
    } else if (kind === 'slingshot') {
      // Spinge solo il lato "attivo", quello rivolto verso il centro del tavolo
      const slingshot = slingshots.find((item) => item.body === body);
      if (isOnActiveEdge(slingshot, ball.position, config.ballRadius)) {
        Body.setVelocity(ball, Vector.mult(slingshot.normal, config.slingshotKick));
        onEvent({ type: 'slingshot', id, points });
      }
    } else if (kind === 'target' && !body.plugin.isDown) {
      setTargetDown(body, true);
      onEvent({ type: 'target', id, points });
    } else if (kind === 'lane' || kind === 'outlane') {
      onEvent({ type: kind, id, points });
    }
  }

  /** Respinge la pallina lontano da un punto (il centro del bumper). */
  function kickAwayFrom(point, speed) {
    const direction = Vector.normalise(Vector.sub(ball.position, point));
    Body.setVelocity(ball, Vector.mult(direction, speed));
  }

  // --- Bersagli ------------------------------------------------------------

  function setTargetDown(target, down) {
    target.plugin.isDown = down;
    target.collisionFilter.mask = down ? COLLIDE_WITH_NOTHING : COLLIDE_WITH_ALL;
  }

  /** Rialza tutti i bersagli (appena la pallina non ci sta sopra, per non intrappolarla). */
  function resetTargets() {
    targetsWaitingToRise = true;
  }

  function raiseWaitingTargets() {
    const blocked = ball && targets.some((target) => Bounds.overlaps(target.bounds, ball.bounds));
    if (!blocked) {
      targets.forEach((target) => setTargetDown(target, false));
      targetsWaitingToRise = false;
    }
  }

  // --- Pallina -----------------------------------------------------------

  function spawnBall() {
    removeBall();
    ball = Bodies.circle(layout.SHOOTER.laneX, layout.SHOOTER.ballStartY, config.ballRadius, {
      restitution: config.ballRestitution,
      friction: 0,
      frictionStatic: 0,
      frictionAir: config.ballFrictionAir,
      density: 0.004,
      plugin: { kind: 'ball' },
    });
    Composite.add(engine.world, ball);
    setGateClosed(false);
    stillMs = 0;
  }

  function removeBall() {
    if (ball) {
      Composite.remove(engine.world, ball);
      ball = null;
    }
  }

  function isBallInShooterLane() {
    if (!ball) return false;
    const { x, y } = ball.position;
    return x > layout.SHOOTER.laneLeft - 4 && y > layout.SHOOTER.gateY;
  }

  /** Lancia la pallina se è ferma sul pistone. `charge` va da 0 a 1. */
  function launch(charge) {
    if (!ball || !isBallInShooterLane() || Body.getSpeed(ball) > 0.5) return false;
    const speed = config.launchMinSpeed + charge * (config.launchMaxSpeed - config.launchMinSpeed);
    Body.setVelocity(ball, { x: 0, y: -speed });
    return true;
  }

  // --- Passo della simulazione ------------------------------------------

  /** Fa avanzare il mondo di un passo fisso. `controls` dice quali alette sono premute. */
  function step(controls) {
    for (const flipper of flippers) {
      moveFlipper(flipper, controls[flipper.id], config);
    }

    if (ball) {
      limitBallSpeed();
    }

    Engine.update(engine, config.stepMs);

    if (targetsWaitingToRise) raiseWaitingTargets();

    if (ball) {
      updateShooterGate();
      checkStuckBall();
      checkBallOutside();
    }
  }

  function limitBallSpeed() {
    const speed = Body.getSpeed(ball);
    if (speed > config.maxBallSpeed) {
      Body.setSpeed(ball, config.maxBallSpeed);
    }
  }

  // Il cancello in cima alla corsia di lancio si chiude quando la pallina è entrata nel campo
  function updateShooterGate() {
    if (!isGateClosed() && ball.position.x < layout.SHOOTER.laneLeft - 30) {
      setGateClosed(true);
    }
  }

  function isGateClosed() {
    return shooterGate.collisionFilter.mask !== COLLIDE_WITH_NOTHING;
  }

  function setGateClosed(closed) {
    shooterGate.collisionFilter.mask = closed ? COLLIDE_WITH_ALL : COLLIDE_WITH_NOTHING;
  }

  // Se la pallina resta ferma a lungo (fuori dalla corsia di lancio), riceve una piccola spinta
  function checkStuckBall() {
    if (isBallInShooterLane() || Body.getSpeed(ball) > config.stuckSpeed) {
      stillMs = 0;
      return;
    }
    stillMs += config.stepMs;
    if (stillMs > config.stuckMs) {
      const direction = Math.random() < 0.5 ? -1 : 1;
      Body.setVelocity(ball, { x: direction * config.stuckNudge, y: -config.stuckNudge });
      stillMs = 0;
    }
  }

  // Rete di sicurezza: se per qualunque motivo la pallina esce dal tavolo, è persa
  function checkBallOutside() {
    const { x, y } = ball.position;
    const margin = 60;
    if (x < -margin || x > layout.TABLE_WIDTH + margin || y < -margin || y > layout.TABLE_HEIGHT + margin) {
      removeBall();
      onEvent({ type: 'drain' });
    }
  }

  // --- Stato per il disegno ---------------------------------------------

  function getSnapshot() {
    return {
      ball: ball ? { x: ball.position.x, y: ball.position.y, radius: config.ballRadius } : null,
      flippers: flippers.map((flipper) => ({ id: flipper.id, vertices: flipper.body.vertices })),
      gateClosed: isGateClosed(),
      targetsDown: targets.map((target) => target.plugin.isDown),
    };
  }

  return {
    engine,
    step,
    spawnBall,
    removeBall,
    launch,
    resetTargets,
    isBallInShooterLane,
    hasBall: () => ball !== null,
    getBall: () => ball,
    getSnapshot,
  };
}

/* ========================================================================
   Costruzione dei corpi
   ======================================================================== */

/**
 * Una parete è una polilinea: per ogni segmento creiamo un rettangolo spesso,
 * e in ogni punto un cerchio, così gli angoli sono arrotondati e senza fessure.
 */
function createWall(wall, config) {
  const options = { isStatic: true, restitution: config.wallRestitution, friction: 0, plugin: { kind: 'wall' } };
  const bodies = [];

  for (let i = 0; i < wall.points.length - 1; i++) {
    const [x1, y1] = wall.points[i];
    const [x2, y2] = wall.points[i + 1];
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    bodies.push(Bodies.rectangle((x1 + x2) / 2, (y1 + y2) / 2, length, wall.thickness, { ...options, angle }));
  }

  for (const [x, y] of wall.points) {
    bodies.push(Bodies.circle(x, y, wall.thickness / 2, options));
  }

  return bodies;
}

/** Bumper: cerchio fisso che respinge la pallina (la spinta è in handleBallCollision). */
function createBumper(data, config) {
  return Bodies.circle(data.x, data.y, data.radius, {
    isStatic: true,
    restitution: config.bumperRestitution,
    plugin: { kind: 'bumper', id: data.id, points: data.points },
  });
}

/**
 * Slingshot: triangolo fisso. Ci serve anche la "normale" del lato attivo (a → c):
 * la direzione, perpendicolare al lato, in cui viene spinta la pallina.
 */
function createSlingshot(data, config) {
  const a = { x: data.a[0], y: data.a[1] };
  const b = { x: data.b[0], y: data.b[1] };
  const c = { x: data.c[0], y: data.c[1] };
  const center = Vertices.centre([a, b, c]);

  let normal = Vector.normalise(Vector.perp(Vector.sub(c, a)));
  // La normale deve puntare FUORI dal triangolo, cioè lontano dal suo centro
  if (Vector.dot(normal, Vector.sub(center, a)) > 0) normal = Vector.neg(normal);

  // Attenzione: fromVertices riordina e sposta i vertici che riceve,
  // quindi gli passiamo delle copie e teniamo a, c e la normale calcolati prima
  const body = Bodies.fromVertices(center.x, center.y, [[{ ...a }, { ...b }, { ...c }]], {
    isStatic: true,
    restitution: config.slingshotRestitution,
    plugin: { kind: 'slingshot', id: data.id, points: data.points },
  });

  return { body, a, c, normal };
}

/** Vero se la pallina tocca il lato attivo dello slingshot (e non gli altri due lati). */
function isOnActiveEdge(slingshot, ballPosition, ballRadius) {
  const distanceFromEdge = Vector.dot(Vector.sub(ballPosition, slingshot.a), slingshot.normal);
  return distanceFromEdge > ballRadius * 0.5;
}

/** Bersaglio abbattibile: rettangolo che, colpito, smette di urtare la pallina. */
function createTarget(data, config) {
  return Bodies.rectangle(data.x, data.y, data.width, data.height, {
    isStatic: true,
    restitution: config.targetRestitution,
    plugin: { kind: 'target', id: data.id, points: data.points, isDown: false },
  });
}

/** Sensore: la pallina lo attraversa senza urtarlo, ma noi sappiamo che è passata. */
function createSensor(data, kind) {
  return Bodies.rectangle(data.x, data.y, data.width, data.height, {
    isStatic: true,
    isSensor: true,
    plugin: { kind, id: data.id, points: data.points },
  });
}

/** Il pistone: il "pavimento" della corsia di lancio su cui appoggia la pallina. */
function createPlunger(shooter, config) {
  const width = shooter.laneRight - shooter.laneLeft;
  const height = 60;
  return Bodies.rectangle(shooter.laneX, shooter.plungerTopY + height / 2, width, height, {
    isStatic: true,
    restitution: 0,
    friction: 0,
    plugin: { kind: 'plunger' },
  });
}

/** Il cancello che chiude la corsia di lancio dopo il lancio (all'inizio non urta nulla). */
function createShooterGate(shooter) {
  return Bodies.rectangle(shooter.laneX - 4, shooter.gateY, shooter.laneRight - shooter.laneLeft + 24, 10, {
    isStatic: true,
    restitution: 0.3,
    plugin: { kind: 'gate' },
    collisionFilter: { category: CATEGORY_DEFAULT, mask: COLLIDE_WITH_NOTHING },
  });
}

/* ========================================================================
   Alette
   ======================================================================== */

/**
 * L'aletta è un corpo statico che ruotiamo noi a ogni passo attorno al perno.
 * Forma: un "goccia" allungata, più larga al perno e più stretta in punta.
 */
function createFlipper(data, config) {
  const localShape = flipperShape(data.length, data.baseRadius, data.tipRadius);
  // Matter posiziona i corpi sul loro baricentro: ci serve la sua distanza dal perno
  const centerOffset = Vertices.centre(localShape);
  const [px, py] = data.pivot;

  const body = Bodies.fromVertices(px + centerOffset.x, py + centerOffset.y, [localShape], {
    isStatic: true,
    restitution: config.flipperRestitution,
    friction: 0,
    plugin: { kind: 'flipper', id: data.id },
  });

  const flipper = {
    id: data.id,
    body,
    pivot: { x: px, y: py },
    centerOffset,
    angle: data.restAngle,
    restAngle: data.restAngle,
    upAngle: data.upAngle,
  };

  placeFlipper(flipper, data.restAngle, false);
  return flipper;
}

/** Vertici dell'aletta con il perno nell'origine e la punta verso destra (+x). */
function flipperShape(length, baseRadius, tipRadius) {
  const points = [];
  const steps = 8;
  // Metà sinistra del cerchio al perno: da sotto, passando per sinistra, fino a sopra
  for (let i = 0; i <= steps; i++) {
    const angle = Math.PI / 2 + (Math.PI * i) / steps;
    points.push({ x: baseRadius * Math.cos(angle), y: baseRadius * Math.sin(angle) });
  }
  // Metà destra del cerchio in punta: da sopra, passando per destra, fino a sotto
  for (let i = 0; i <= steps; i++) {
    const angle = -Math.PI / 2 + (Math.PI * i) / steps;
    points.push({ x: length + tipRadius * Math.cos(angle), y: tipRadius * Math.sin(angle) });
  }
  return points;
}

/** Ruota l'aletta di un passo verso "alzata" o "riposo", con velocità controllata. */
function moveFlipper(flipper, pressed, config) {
  const target = pressed ? flipper.upAngle : flipper.restAngle;
  const maxStep = pressed ? config.flipperUpSpeed : config.flipperDownSpeed;
  const difference = target - flipper.angle;
  const stepAngle = Math.sign(difference) * Math.min(Math.abs(difference), maxStep);

  // Anche quando è ferma la riposizioniamo: così Matter sa che la sua velocità è zero
  placeFlipper(flipper, flipper.angle + stepAngle, true);
}

/**
 * Mette l'aletta all'angolo indicato, ruotando attorno al perno.
 * Con `updateVelocity` Matter registra lo spostamento come velocità:
 * è ciò che permette all'aletta in movimento di "colpire" la pallina.
 */
function placeFlipper(flipper, angle, updateVelocity) {
  flipper.angle = angle;
  const offset = Vector.rotate(flipper.centerOffset, angle);
  Body.setPosition(flipper.body, Vector.add(flipper.pivot, offset), updateVelocity);
  Body.setAngle(flipper.body, angle, updateVelocity);
}

/** Se la coppia di corpi in collisione contiene la pallina, restituisce l'altro corpo. */
function otherBody(pair, ball) {
  if (!ball) return null;
  if (pair.bodyA === ball) return pair.bodyB.parent;
  if (pair.bodyB === ball) return pair.bodyA.parent;
  return null;
}
