const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const clockEl = document.getElementById('clock');
const periodEl = document.getElementById('period');
const roomTargetEl = document.getElementById('roomTarget');
const floorStatusEl = document.getElementById('floorStatus');
const troubleEl = document.getElementById('trouble');
const energyEl = document.getElementById('energy');
const bladderEl = document.getElementById('bladder');
const autoStatusEl = document.getElementById('autoStatus');
const missionEl = document.getElementById('mission');
const eventsEl = document.getElementById('events');
const todoEl = document.getElementById('todo');

const helpDialog = document.getElementById('helpDialog');
const helpBtn = document.getElementById('helpBtn');
const pauseBtn = document.getElementById('pauseBtn');
document.getElementById('closeHelp').onclick = () => helpDialog.close();
helpBtn.onclick = () => helpDialog.showModal();

// -----------------------------------------------------------------------------
// World model
// -----------------------------------------------------------------------------
// Large campus coordinate space. We now render through a camera window so
// players can scroll through multiple levels and corridors.
const WORLD = { w: 170, h: 112 };

// Camera view keeps the same aspect ratio as the canvas while following Eric.
const CAMERA = { w: 72, h: 40, x: 0, y: 0 };

// Full retro-inspired palette so every room/entity can have richer color identity.
const PALETTE = {
  ink: '#0f1426',
  deepBlue: '#1d2f6f',
  skyBlue: '#4f86f7',
  teal: '#2a9d8f',
  mint: '#a8dadc',
  brick: '#b23a48',
  salmon: '#ff7f6a',
  amber: '#ffb703',
  cream: '#fff1d0',
  violet: '#7b2cbf',
  plum: '#5a189a',
  grass: '#4caf50',
  moss: '#2e7d32',
  concrete: '#9aa0a6',
  steel: '#5f6b7a',
  chalk: '#f8f9fa',
  line: '#1f2937',
};

const rooms = [
  // Upper level classrooms + corridor.
  { name: 'Upper Corridor', x: 4, y: 15, w: 160, h: 4, floor: 'upper', type: 'corridor' },
  { name: 'Science Lab', x: 8, y: 4, w: 24, h: 11, floor: 'upper', type: 'classroom' },
  { name: 'Upper Common', x: 38, y: 4, w: 24, h: 11, floor: 'upper', type: 'classroom' },
  { name: 'Physics Lab', x: 68, y: 4, w: 24, h: 11, floor: 'upper', type: 'classroom' },
  { name: 'Chem Prep', x: 98, y: 4, w: 20, h: 11, floor: 'upper', type: 'classroom' },
  { name: 'Computer Room', x: 124, y: 4, w: 36, h: 11, floor: 'upper', type: 'classroom' },

  // Middle level corridors and rooms.
  { name: 'Middle Corridor', x: 4, y: 50, w: 160, h: 4, floor: 'middle', type: 'corridor' },
  { name: 'Maths', x: 8, y: 38, w: 30, h: 12, floor: 'middle', type: 'classroom' },
  { name: 'English', x: 44, y: 38, w: 24, h: 12, floor: 'middle', type: 'classroom' },
  { name: 'Staff Room', x: 74, y: 38, w: 24, h: 12, floor: 'middle', type: 'classroom' },
  { name: 'Music Room', x: 104, y: 38, w: 24, h: 12, floor: 'middle', type: 'classroom' },
  { name: 'Gym', x: 134, y: 38, w: 26, h: 12, floor: 'middle', type: 'hall' },

  // Ground level circulation and outside area.
  { name: 'Ground Corridor', x: 4, y: 76, w: 160, h: 4, floor: 'ground', type: 'corridor' },
  { name: 'Geography', x: 8, y: 80, w: 24, h: 14, floor: 'ground', type: 'classroom' },
  { name: 'Art Room', x: 34, y: 80, w: 24, h: 14, floor: 'ground', type: 'classroom' },
  { name: 'History', x: 60, y: 80, w: 24, h: 14, floor: 'ground', type: 'classroom' },
  { name: 'Toilets', x: 8, y: 94, w: 20, h: 14, floor: 'ground', type: 'hall' },
  { name: 'Assembly Hall', x: 44, y: 94, w: 40, h: 14, floor: 'ground', type: 'hall' },
  { name: 'P.E. Field', x: 90, y: 80, w: 70, h: 28, floor: 'ground', type: 'outdoor' },
  { name: 'Bike Sheds', x: 92, y: 94, w: 22, h: 12, floor: 'ground', type: 'outdoor' },
  { name: 'School Gates', x: 148, y: 80, w: 18, h: 28, floor: 'ground', type: 'outdoor' },
];

const stairs = [
  { x: 24, y: 17, toY: 52, label: 'West Stairs' },
  { x: 64, y: 17, toY: 52, label: 'Central Stairs' },
  { x: 104, y: 17, toY: 52, label: 'East Stairs' },
  { x: 146, y: 17, toY: 52, label: 'Annex Stairs' },
  { x: 24, y: 52, toY: 78, label: 'West Stairs' },
  { x: 64, y: 52, toY: 78, label: 'Central Stairs' },
  { x: 104, y: 52, toY: 78, label: 'East Stairs' },
  { x: 146, y: 52, toY: 78, label: 'Annex Stairs' },
];

const blackboards = [
  { room: 'Science Lab', x: 21, y: 6, text: '' },
  { room: 'Maths', x: 23, y: 40, text: '' },
  { room: 'English', x: 56, y: 40, text: '' },
  { room: 'Computer Room', x: 144, y: 6, text: '' },
  { room: 'Geography', x: 18, y: 83, text: '' },
  { room: 'Art Room', x: 46, y: 83, text: '' },
  { room: 'History', x: 74, y: 83, text: '' },
  { room: 'Assembly Hall', x: 65, y: 97, text: '' },
];

const shields = [
  { x: 13, y: 6, letter: 'D', found: false },
  { x: 52, y: 6, letter: 'A', found: false },
  { x: 85, y: 6, letter: 'Z', found: false },
  { x: 140, y: 6, letter: 'E', found: false },
  { x: 18, y: 42, letter: 'S', found: false },
  { x: 154, y: 88, letter: 'K', found: false },
];

// Bell schedule approximating school-day flow.
const schedule = [
  { period: 'Arrival', room: 'School Gates', mins: 10, mode: 'transition' },
  { period: 'Tutorial', room: 'Science Lab', mins: 30, mode: 'lesson' },
  { period: 'Lesson 1', room: 'Maths', mins: 60, mode: 'lesson' },
  { period: 'Lesson 2', room: 'English', mins: 60, mode: 'lesson' },
  { period: 'Break', room: 'P.E. Field', mins: 20, mode: 'break' },
  { period: 'Lesson 3', room: 'Geography', mins: 60, mode: 'lesson' },
  { period: 'Lesson 4', room: 'History', mins: 60, mode: 'lesson' },
  { period: 'Lunch', room: 'P.E. Field', mins: 60, mode: 'break' },
  { period: 'Lesson 5', room: 'Art Room', mins: 120, mode: 'lesson' },
  { period: 'Lesson 6', room: 'Computer Room', mins: 120, mode: 'lesson' },
  { period: 'Home Time', room: 'School Gates', mins: 30, mode: 'home' },
];

const floorMeta = {
  upper: { label: 'Upper', color: 'Purple' },
  middle: { label: 'Middle', color: 'Blue' },
  ground: { label: 'Ground', color: 'Green' },
};

const schoolExit = { x: 159.2, yMin: 84, yMax: 107 };
const floorOrder = { upper: 2, middle: 1, ground: 0 };

const lessonTasks = [
  'Write 10x: I must not fire catapults.',
  'Solve: 6 * 7 = ?',
  'Spell: DISCIPLINE',
  'Copy: The bell waits for no one.',
  'Name one planet in our solar system.',
  'Write 5x: Silence in class.',
];

const personalities = {
  bully: { speed: 0.66, aggression: 0.72, diligence: 0.2, focus: 0.5 },
  swot: { speed: 0.54, aggression: 0.04, diligence: 0.96, focus: 0.9 },
  hero: { speed: 0.6, aggression: 0.2, diligence: 0.75, focus: 0.7 },
  weird: { speed: 0.7, aggression: 0.35, diligence: 0.45, focus: 0.4 },
  teacher: { speed: 0.56, aggression: 0.55, diligence: 1.0, focus: 1.0 },
  player: { speed: 1.26, aggression: 0, diligence: 0, focus: 0 },
};

const game = {
  timeMinutes: 8 * 60 + 20,
  // Minutes advanced per real-time second to slow bell pacing.
  timeScale: 0.08,
  periodIndex: 0,
  periodElapsed: 0,
  paused: false,
  lines: 0,
  energy: 100,
  missionComplete: false,
  safeCombo: '',
  entities: [],
  pellets: [],
  keys: {},
  announcements: [],
  rng: Math.random,
  quizActive: null,
  lastLateTick: 0,
  autoMode: false,
  idleMs: 0,
  bladder: 0,
  dailyToiletVisits: 0,
  drinksToday: 0,
  warnedNeedToilet: false,
  registrationTaken: false,
};

let seatCounter = 0;

function mkEntity(name, role, x, y, color, traits = {}) {
  return {
    name,
    role,
    x,
    y,
    color,
    vx: 0,
    vy: 0,
    hp: 100,
    knockedUntil: 0,
    personality: personalities[role] || personalities.hero,
    facing: 1,
    target: null,
    attention: 100,
    profile: traits,
    mood: 'calm',
    animPhase: Math.random() * Math.PI * 2,
    seatIndex: seatCounter++,
  };
}

const player = mkEntity('Eric', 'player', 48, 64, '#ffe04d', {
  title: 'Troublemaker with potential',
  prefers: ['P.E. Field'],
  quotes: ['Not me, sir!', 'I was only looking!'],
});

game.entities.push(
  player,
  mkEntity('Mr Wacker', 'teacher', 22, 42, '#8eb2ff', { title: 'Headmaster', strict: 0.9 }),
  mkEntity('Ms Take', 'teacher', 75, 42, '#82a4ff', { title: 'Science Teacher', strict: 0.8 }),
  mkEntity('Mr Creak', 'teacher', 56, 84, '#7e9aff', { title: 'History Teacher', strict: 0.7 }),
  mkEntity('Angelface', 'hero', 102, 88, '#ffd58e', { title: 'Handsome kid' }),
  mkEntity('Einstein', 'swot', 108, 87, '#8effd3', { title: 'Teacher pet', tattles: true }),
  mkEntity('Bully Boy', 'bully', 114, 89, '#ff5f88', { title: 'Playground terror' }),
  mkEntity('Boy Wander', 'weird', 121, 88, '#c58eff', { title: 'Chaotic drifter' }),
  mkEntity('Slugger', 'bully', 128, 89, '#ff7ca0', { title: 'Fighter' }),
  mkEntity('Precious', 'hero', 136, 88, '#ffe6ae', { title: 'Narcissist' }),
  mkEntity('Nerdy Ned', 'swot', 144, 89, '#78ffcf', { title: 'Homework machine', tattles: true }),
);

function formatTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function roomByName(name) {
  return rooms.find((r) => r.name === name);
}

function roomCenter(name) {
  const r = roomByName(name);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

function entityRoom(entity) {
  return rooms.find((r) => entity.x > r.x && entity.x < r.x + r.w && entity.y > r.y && entity.y < r.y + r.h)?.name || 'Corridor';
}

function entityFloor(entity) {
  const room = rooms.find((r) => entity.x > r.x && entity.x < r.x + r.w && entity.y > r.y && entity.y < r.y + r.h);
  return room?.floor || 'ground';
}

function updateFloorStatus() {
  const meta = floorMeta[entityFloor(player)] || floorMeta.ground;
  floorStatusEl.textContent = `🧭 Floor: ${meta.label} (${meta.color})`;
}

function updateAutoStatus() {
  autoStatusEl.textContent = `🤖 Auto: ${game.autoMode ? 'ON' : 'OFF'}`;
}

function updateBladderHud() {
  bladderEl.textContent = `🚻 Bladder: ${Math.round(game.bladder)}%`;
}

function getStairLink(fromFloor, toFloor) {
  // Stairs directly connect upper<->middle and middle<->ground using shared x positions.
  if (fromFloor === toFloor) return null;
  if (fromFloor === 'upper' && toFloor === 'middle') return stairs.filter((stair) => stair.y < stair.toY);
  if (fromFloor === 'middle' && toFloor === 'upper') return stairs.filter((stair) => stair.y < stair.toY);
  if (fromFloor === 'middle' && toFloor === 'ground') return stairs.filter((stair) => stair.y > 40);
  if (fromFloor === 'ground' && toFloor === 'middle') return stairs.filter((stair) => stair.y > 40);
  return stairs;
}

function nearestStairTarget(fromFloor, targetFloor) {
  const relevant = getStairLink(fromFloor, targetFloor);
  if (!relevant || !relevant.length) return null;

  let best = null;
  let bestDist = Infinity;
  for (const stair of relevant) {
    const onStepY = fromFloor === 'upper' ? stair.y : fromFloor === 'ground' ? stair.toY :
      (targetFloor === 'upper' ? stair.toY : stair.y);
    const candidate = { x: stair.x, y: onStepY };
    const dist = distance(player, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return best;
}

function chooseAutoDestination() {
  // Toilets become top priority when bladder is urgent.
  if (game.bladder >= 75) return roomCenter('Toilets');
  const current = schedule[game.periodIndex];
  if (current.mode === 'home') return roomCenter('School Gates');
  return roomCenter(current.room);
}

function getSeatPosition(roomName, seatIndex) {
  const room = roomByName(roomName);
  if (!room) return null;
  // Simple desk grid so pupils remain seated during tutorial/lesson periods.
  const cols = 4;
  const rows = 3;
  const slot = seatIndex % (cols * rows);
  const col = slot % cols;
  const row = Math.floor(slot / cols);
  return {
    x: room.x + 4 + col * Math.max(3, (room.w - 8) / cols),
    y: room.y + 4 + row * Math.max(2.6, (room.h - 8) / rows),
  };
}

function resetToSchoolMorning() {
  // New morning: everyone starts outside school gates before being led inside.
  game.timeMinutes = 8 * 60 + 20;
  game.periodElapsed = 0;
  game.registrationTaken = false;
  game.drinksToday = 0;
  game.dailyToiletVisits = 0;
  game.warnedNeedToilet = false;
  game.bladder = 0;

  const gate = roomByName('School Gates');
  for (const entity of game.entities) {
    const lane = entity.seatIndex % 6;
    entity.x = gate.x + 2 + lane * 2.3;
    entity.y = gate.y + 3 + Math.floor(entity.seatIndex / 6) * 2.4;
    entity.target = null;
    entity.vx = 0;
    entity.vy = 0;
  }

  setPeriod(0);
  updateBladderHud();
  announce('🌅 New school day: students gather at the gates ready for tutorial.');
}

function updateAutoPilot(dt) {
  const speed = (player.personality.speed * game.energy) / 100;
  const destination = chooseAutoDestination();
  const destinationFloor = roomByName(entityRoom({ x: destination.x, y: destination.y }))?.floor || 'ground';
  const currentFloor = entityFloor(player);

  let waypoint = destination;
  if (destinationFloor !== currentFloor) {
    const floorDelta = floorOrder[destinationFloor] - floorOrder[currentFloor];
    const nextFloor = floorDelta > 0 ? (currentFloor === 'ground' ? 'middle' : 'upper') : (currentFloor === 'upper' ? 'middle' : 'ground');
    waypoint = nearestStairTarget(currentFloor, nextFloor) || destination;
  }

  const dx = waypoint.x - player.x;
  const dy = waypoint.y - player.y;
  const len = Math.hypot(dx, dy) || 1;
  player.vx = (dx / len) * speed;
  player.vy = (dy / len) * speed;

  // Auto mode uses stairs when Eric reaches them and occasionally reads boards.
  if (len < 1.1) interact();
  spendEnergy(0.35 * (dt / 1000));
}

function updateBladder(dt) {
  const deltaMins = (dt / 1000) * game.timeScale;
  const baseRate = 0.55; // ~once per school day if Eric does not over-drink.
  const drinkBonus = game.drinksToday * 0.35;
  game.bladder = Math.min(100, game.bladder + (baseRate + drinkBonus) * deltaMins);

  if (game.bladder >= 75 && !game.warnedNeedToilet) {
    game.warnedNeedToilet = true;
    announce('🚻 Eric needs the toilet soon. Head to TOILETS quickly.');
  }

  if (entityRoom(player) === 'Toilets' && game.bladder >= 20) {
    game.bladder = 0;
    game.dailyToiletVisits += 1;
    game.warnedNeedToilet = false;
    announce('✅ Eric used the toilet in time.');
  }

  if (game.bladder >= 100) {
    game.bladder = 20;
    game.warnedNeedToilet = false;
    addLines(60, 'wetting himself in school');
    announce('😳 Eric wet himself! Other students laugh loudly.');
    announce('🧑‍🏫 Mr Wacker lectures Eric: "Use the toilet before it is urgent!"');
  }

  updateBladderHud();
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function announce(message) {
  game.announcements.unshift(`[${formatTime(game.timeMinutes)}] ${message}`);
  game.announcements = game.announcements.slice(0, 12);
  eventsEl.innerHTML = game.announcements.map((line) => `<div>${line}</div>`).join('');
}

function updateTodo() {
  const current = schedule[game.periodIndex];
  const found = shields.filter((s) => s.found).length;
  const todoItems = [
    `Be in: ${current.room}`,
    `Period: ${current.period}`,
    `Shields: ${found}/${shields.length}`,
    `Bladder: ${Math.round(game.bladder)}%`,
    `Auto mode: ${game.autoMode ? 'ON' : 'OFF'}`,
    `Energy should stay above 25`,
    `Avoid teachers while bunking`,
  ];
  todoEl.innerHTML = todoItems.map((t) => `<li>${t}</li>`).join('');
}

function addLines(amount, reason) {
  game.lines += amount;
  troubleEl.textContent = `📝 Lines: ${game.lines}`;
  announce(`📝 ${amount} lines for ${reason}`);
}

function spendEnergy(amount) {
  game.energy = Math.max(5, game.energy - amount);
  energyEl.textContent = `⚡ Energy: ${Math.round(game.energy)}`;
}

function recoverEnergy(dtSeconds) {
  game.energy = Math.min(100, game.energy + dtSeconds * 2.2);
  energyEl.textContent = `⚡ Energy: ${Math.round(game.energy)}`;
}

function constrain(entity) {
  entity.x = Math.max(1, Math.min(WORLD.w - 1, entity.x));
  entity.y = Math.max(1, Math.min(WORLD.h - 1, entity.y));
  if (entity.vx < 0) entity.facing = -1;
  if (entity.vx > 0) entity.facing = 1;
}

function setPeriod(index) {
  game.periodIndex = index % schedule.length;
  game.periodElapsed = 0;
  const current = schedule[game.periodIndex];
  if (current.period === 'Tutorial') game.registrationTaken = false;

  // Board content changes each bell to emulate lesson instructions.
  blackboards.forEach((board) => {
    if (board.room === current.room) {
      board.text = lessonTasks[Math.floor(game.rng() * lessonTasks.length)];
    } else if (game.rng() < 0.3) {
      board.text = 'NO RUNNING IN CORRIDORS';
    } else {
      board.text = '';
    }
  });

  if (current.period === 'Arrival') {
    announce('👨‍🏫 Teachers line the students up at the gates and lead them inside.');
  }

  announce(`🔔 Bell! ${current.period} in ${current.room}`);
  if (current.period === 'Home Time') {
    announce('🏠 Home time! Students may leave through the school gates.');
  }
  periodEl.textContent = `🔔 Period: ${current.period}`;
  roomTargetEl.textContent = `📍 Target: ${current.room}`;
  updateFloorStatus();
  updateTodo();
}
resetToSchoolMorning();

// -----------------------------------------------------------------------------
// Player input and actions
// -----------------------------------------------------------------------------
function handleInput(dt) {
  const speed = (player.personality.speed * game.energy) / 100;
  player.vx = 0;
  player.vy = 0;

  const manualMovement = game.keys.ArrowLeft || game.keys.a || game.keys.ArrowRight || game.keys.d || game.keys.ArrowUp || game.keys.w || game.keys.ArrowDown || game.keys.s;
  if (manualMovement || game.keys.z || game.keys.x || game.keys.e || game.keys.c) {
    // Manual control immediately overrides autopilot for responsiveness.
    if (game.autoMode) {
      game.autoMode = false;
      updateAutoStatus();
      announce('🤖 Auto mode disabled by player input.');
    }
    game.idleMs = 0;
  }

  if (game.autoMode) {
    updateAutoPilot(dt);
    return;
  }

  if (game.keys.ArrowLeft || game.keys.a) player.vx = -speed;
  if (game.keys.ArrowRight || game.keys.d) player.vx = speed;
  if (game.keys.ArrowUp || game.keys.w) player.vy = -speed;
  if (game.keys.ArrowDown || game.keys.s) player.vy = speed;

  // Use a little stamina while moving to create pacing and tactical choices.
  if (Math.abs(player.vx) + Math.abs(player.vy) > 0.1) spendEnergy(0.6 * (dt / 1000));

  if (game.keys.z) {
    meleeAttack(player);
    game.keys.z = false;
  }
  if (game.keys.x) {
    fireCatapult(player);
    game.keys.x = false;
  }
  if (game.keys.e) {
    interact();
    game.keys.e = false;
  }
  if (game.keys.c) {
    // Drinking gives quick energy but increases bladder pressure.
    game.drinksToday += 1;
    game.energy = Math.min(100, game.energy + 10);
    energyEl.textContent = `⚡ Energy: ${Math.round(game.energy)}`;
    game.bladder = Math.min(100, game.bladder + 18);
    updateBladderHud();
    announce('🥤 Eric had a drink. Energy up, bladder filling faster.');
    game.keys.c = false;
  }
}

function meleeAttack(attacker) {
  for (const target of game.entities) {
    if (target === attacker || target.knockedUntil > performance.now()) continue;
    if (distance(attacker, target) < 1.45) {
      target.hp -= 45;
      target.mood = 'angry';
      announce(`👊 ${attacker.name} punched ${target.name}`);
      if (target.hp <= 0) knockout(target, attacker);
      if (attacker === player && target.role === 'teacher') addLines(120, 'striking a teacher');
      spendEnergy(7);
      return;
    }
  }
}

function fireCatapult(attacker) {
  game.pellets.push({
    x: attacker.x,
    y: attacker.y - 0.45,
    vx: attacker.facing * 0.24,
    vy: -0.025,
    owner: attacker,
  });
  announce(`🏹 ${attacker.name} fired a catapult`);
  if (attacker === player) addLines(20, 'catapult use');
  spendEnergy(5);
}

function knockout(entity, by) {
  entity.hp = 100;
  entity.knockedUntil = performance.now() + 6200;
  entity.mood = 'dazed';
  announce(`💫 ${entity.name} knocked out by ${by.name}`);
}

function interact() {
  // Stairs are intentionally activated with interact for predictable movement.
  const nearbyStair = stairs.find((stair) => {
    const nearStepA = distance(player, { x: stair.x, y: stair.y }) < 1.6;
    const nearStepB = distance(player, { x: stair.x, y: stair.toY }) < 1.6;
    return nearStepA || nearStepB;
  });
  if (nearbyStair) {
    const nearStepA = distance(player, { x: nearbyStair.x, y: nearbyStair.y }) < 1.6;
    const destinationY = nearStepA ? nearbyStair.toY : nearbyStair.y;
    const movingUp = destinationY < player.y;
    player.y = movingUp ? destinationY + 0.4 : destinationY - 0.4;
    player.x = nearbyStair.x;
    announce(`🪜 Used ${nearbyStair.label} to ${movingUp ? 'go up' : 'go down'} a floor.`);
    updateFloorStatus();
    return;
  }

  // Read blackboard instructions.
  const board = blackboards.find((b) => distance(player, b) < 2.2);
  if (board && board.text) {
    announce(`📋 Board: "${board.text}"`);
  }

  // Grab shield letters. High shields can require a knocked-out pupil nearby.
  for (const shield of shields) {
    if (shield.found) continue;

    const closeEnough = distance(player, shield) < 1.35;
    const standingOnBody = game.entities.some(
      (e) => e !== player && e.knockedUntil > performance.now() && distance(player, e) < 1.1,
    );
    const tallEnough = player.y < shield.y + 0.7 || standingOnBody;

    if (closeEnough && tallEnough) {
      shield.found = true;
      announce(`🛡️ Found shield letter: ${shield.letter}`);
      updateMission();
      updateTodo();
      break;
    }
  }

  // Interactive teacher quiz in class for extra detail.
  const teacherNearby = game.entities.find((e) => e.role === 'teacher' && distance(e, player) < 1.7);
  const current = schedule[game.periodIndex];
  if (teacherNearby && entityRoom(player) === current.room && !game.quizActive) {
    const quiz = { q: 'What is 6 x 7?', answer: '42' };
    game.quizActive = quiz;
    const response = prompt(`${teacherNearby.name} asks: ${quiz.q}`);
    if ((response || '').trim() === quiz.answer) {
      announce(`✅ Correct answer. ${teacherNearby.name} nods approvingly.`);
    } else {
      addLines(30, 'wrong answer in lesson');
      announce(`❌ Wrong answer. ${teacherNearby.name}: "Concentrate!"`);
    }
    game.quizActive = null;
  }
}

function updateMission() {
  const letters = shields.filter((s) => s.found).map((s) => s.letter);
  game.safeCombo = letters.join('');
  if (letters.length === shields.length) {
    game.missionComplete = true;
    missionEl.textContent = `🛡️ Mission: Complete! Safe combo ${game.safeCombo}`;
    announce(`🏆 You collected all shield letters: ${game.safeCombo}`);
  } else {
    missionEl.textContent = `🛡️ Mission: Letters ${letters.join('')} (${letters.length}/${shields.length})`;
  }
}

// -----------------------------------------------------------------------------
// AI systems
// -----------------------------------------------------------------------------
function chooseTarget(entity, currentPeriod) {
  const p = entity.personality;
  const shouldAttend = game.rng() < p.diligence;

  if (currentPeriod.period === 'Arrival') {
    return roomCenter('School Gates');
  }

  if (currentPeriod.mode === 'lesson') {
    return getSeatPosition(currentPeriod.room, entity.seatIndex) || roomCenter(currentPeriod.room);
  }

  if (currentPeriod.mode === 'home') {
    return roomCenter('School Gates');
  }

  if (entity.role === 'teacher') {
    return roomCenter(currentPeriod.room);
  }

  if (entity.role === 'swot' && game.rng() < 0.8) {
    return roomCenter(currentPeriod.room);
  }

  if (entity.role === 'bully' && game.rng() < 0.45) {
    return roomCenter('P.E. Field');
  }

  if (entity.role === 'weird' && game.rng() < 0.45) {
    return roomCenter(game.rng() < 0.5 ? 'Staff Room' : 'English');
  }

  return shouldAttend ? roomCenter(currentPeriod.room) : roomCenter('P.E. Field');
}

function updateAI(dt) {
  const current = schedule[game.periodIndex];

  for (const entity of game.entities) {
    if (entity === player) continue;
    if (entity.knockedUntil > performance.now()) continue;

    if (!entity.target || game.rng() < 0.01) {
      entity.target = chooseTarget(entity, current);
    }

    // Teacher discipline: if they catch player in wrong room, assign lines.
    const supervised = current.mode === 'lesson' || current.period === 'Tutorial';
    if (entity.role === 'teacher' && distance(entity, player) < 1.8 && entityRoom(player) !== current.room && supervised) {
      addLines(40, `${entity.name} caught you bunking ${current.period}`);
    }

    // Swot tattles if player is misbehaving nearby.
    if (entity.profile.tattles && distance(entity, player) < 2 && game.rng() < 0.0025 && game.lines > 0) {
      addLines(10, `${entity.name} tattled`);
      announce(`📣 ${entity.name}: "Sir! Eric is being bad!"`);
    }

    // Bully may assault nearby pupils.
    if (entity.role === 'bully' && game.rng() < 0.006) {
      meleeAttack(entity);
    }

    const dx = entity.target.x - entity.x;
    const dy = entity.target.y - entity.y;
    const len = Math.hypot(dx, dy) || 1;
    entity.vx = (dx / len) * entity.personality.speed * 2.15;
    entity.vy = (dy / len) * entity.personality.speed * 2.15;

    entity.x += entity.vx * (dt / 1000);
    entity.y += entity.vy * (dt / 1000);

    // Pupils stay seated once in class/tutorial to match a structured school day.
    if ((current.mode === 'lesson' || current.period === 'Tutorial') && entity.role !== 'teacher' && len < 0.5) {
      entity.vx = 0;
      entity.vy = 0;
    }

    constrain(entity);

    if (len < 0.9) entity.target = null;

    // Teachers occasionally issue live board tasks.
    if (entity.role === 'teacher' && game.rng() < 0.002) {
      const board = blackboards.find((b) => b.room === current.room);
      if (board) {
        board.text = lessonTasks[Math.floor(game.rng() * lessonTasks.length)];
        announce(`🧑‍🏫 ${entity.name}: "Quiet! Copy the board."`);
      }
    }
  }
}

function updatePellets(dt) {
  for (const pellet of game.pellets) {
    pellet.x += pellet.vx * dt * 0.09;
    pellet.y += pellet.vy * dt * 0.09;
    pellet.vy += 0.0008 * dt;

    for (const entity of game.entities) {
      if (entity === pellet.owner || entity.knockedUntil > performance.now()) continue;
      if (distance(pellet, entity) < 0.75) {
        entity.hp -= 60;
        entity.mood = 'furious';
        if (entity.hp <= 0) knockout(entity, pellet.owner);
        pellet.dead = true;
      }
    }

    if (pellet.x < 0 || pellet.x > WORLD.w || pellet.y > WORLD.h) pellet.dead = true;
  }

  game.pellets = game.pellets.filter((p) => !p.dead);
}

function updateSchedule(dt) {
  const current = schedule[game.periodIndex];
  const deltaMins = (dt / 1000) * game.timeScale;
  game.periodElapsed += deltaMins;
  game.timeMinutes += deltaMins;

  if (current.period === 'Tutorial' && !game.registrationTaken && game.periodElapsed > 8) {
    game.registrationTaken = true;
    announce('📘 Tutorial registration complete: all students marked present by tutors.');
  }

  if (game.periodElapsed >= current.mins) {
    if (game.periodIndex === schedule.length - 1) {
      // Keep home-time active until player exits via gates.
      game.periodElapsed = current.mins;
    } else {
      setPeriod(game.periodIndex + 1);
    }
  }

  // Late checks are throttled to avoid line spam and keep simulation smooth.
  game.lastLateTick += dt;
  if (game.lastLateTick > 2000) {
    const monitored = current.mode === 'lesson' || current.period === 'Tutorial';
    if (entityRoom(player) !== current.room && monitored) addLines(10, `late for ${current.period}`);
    game.lastLateTick = 0;
  }

  clockEl.textContent = `🕘 Time: ${formatTime(game.timeMinutes)}`;
  periodEl.textContent = `🔔 Period: ${current.period}`;
  roomTargetEl.textContent = `📍 Target: ${current.room}`;
  updateFloorStatus();
}

function checkSchoolExit() {
  // Leaving via the gate triggers immediate discipline and a forced return.
  const current = schedule[game.periodIndex];
  if (player.x >= schoolExit.x && player.y >= schoolExit.yMin && player.y <= schoolExit.yMax) {
    if (current.mode === 'home') {
      announce('✅ Eric leaves at home time. School day complete.');
      resetToSchoolMorning();
      return;
    }

    const nearestTeacher = game.entities.find((entity) => entity.role === 'teacher');
    addLines(35, 'trying to leave school grounds');
    player.x = 148;
    player.y = 90;
    announce(`🚫 ${nearestTeacher?.name || 'A teacher'} caught you at the school exit and dragged you back in.`);
  }
}

// -----------------------------------------------------------------------------
// Rendering
// -----------------------------------------------------------------------------
function updateCamera() {
  // Keep player near center while clamping camera edges to world bounds.
  CAMERA.x = Math.max(0, Math.min(WORLD.w - CAMERA.w, player.x - CAMERA.w / 2));
  CAMERA.y = Math.max(0, Math.min(WORLD.h - CAMERA.h, player.y - CAMERA.h / 2));
}

function worldToScreen(x, y) {
  return {
    sx: ((x - CAMERA.x) / CAMERA.w) * canvas.width,
    sy: ((y - CAMERA.y) / CAMERA.h) * canvas.height,
  };
}

// Draw a subtle checker dither so large surfaces feel textured, not flat.
function fillDitherRect(x, y, w, h, colorA, colorB, step = 4) {
  ctx.fillStyle = colorA;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = colorB;
  for (let py = y; py < y + h; py += step) {
    for (let px = x + ((py / step) % 2) * step; px < x + w; px += step * 2) {
      ctx.fillRect(px, py, step, step);
    }
  }
}

// Render inner textures for floors/walls so the school reads as built spaces.
function drawRoomTexture(drawX, drawY, drawW, drawH, room) {
  const floorTint = room.floor === 'upper'
    ? { a: '#7a62c7', b: '#674fb4' }
    : room.floor === 'middle'
      ? { a: '#6f95c7', b: '#5b80b1' }
      : { a: '#67aa71', b: '#4f905a' };

  if (room.type === 'corridor') {
    // Corridor tile stripes to suggest worn linoleum with floor-level color coding.
    fillDitherRect(drawX, drawY, drawW, drawH, floorTint.a, floorTint.b, 3);
    ctx.strokeStyle = '#7ea5d8';
    for (let x = drawX + 8; x < drawX + drawW; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, drawY + 2);
      ctx.lineTo(x, drawY + drawH - 2);
      ctx.stroke();
    }
  } else if (room.type === 'outdoor') {
    // Grass stipple with slightly brighter specks.
    fillDitherRect(drawX, drawY, drawW, drawH, PALETTE.grass, PALETTE.moss, 3);
    ctx.fillStyle = '#75c96b';
    for (let y = drawY + 2; y < drawY + drawH; y += 10) {
      for (let x = drawX + 2; x < drawX + drawW; x += 14) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  } else {
    // Classroom/hall checker flooring with per-floor tint for orientation.
    const baseA = room.floor === 'upper' ? '#c8b7f4' : room.floor === 'middle' ? '#bcd2f1' : '#cbe9ce';
    const baseB = room.floor === 'upper' ? '#b59ee9' : room.floor === 'middle' ? '#a9c1e4' : '#b6dcb9';
    fillDitherRect(drawX, drawY, drawW, drawH, baseA, baseB, 4);
    ctx.strokeStyle = '#c9b38e';
    for (let y = drawY + 8; y < drawY + drawH; y += 16) {
      ctx.beginPath();
      ctx.moveTo(drawX + 2, y);
      ctx.lineTo(drawX + drawW - 2, y);
      ctx.stroke();
    }
  }
}

  // Draw thick walls around each room; these give the campus stronger structure.
function drawRoomWalls(drawX, drawY, drawW, drawH, room) {
  const wallColor = room.type === 'outdoor' ? '#2c5b2f' : '#6e4f3a';
  ctx.fillStyle = wallColor;
  ctx.fillRect(drawX - 2, drawY - 2, drawW + 4, 2);
  ctx.fillRect(drawX - 2, drawY + drawH, drawW + 4, 2);
  ctx.fillRect(drawX - 2, drawY, 2, drawH);
  ctx.fillRect(drawX + drawW, drawY, 2, drawH);

  // 8-bit style pixel windows add visual depth to the larger school façades.
  if (room.type !== 'outdoor' && room.type !== 'corridor') {
    ctx.fillStyle = '#9ad8ff';
    for (let wx = drawX + 4; wx < drawX + drawW - 6; wx += 14) {
      ctx.fillRect(wx, drawY + 2, 6, 4);
      ctx.fillStyle = '#72b6df';
      ctx.fillRect(wx + 1, drawY + 3, 2, 2);
      ctx.fillStyle = '#9ad8ff';
    }
  }
}

function drawBrickTexture(drawX, drawY, drawW, drawH) {
  ctx.fillStyle = '#7b5a43';
  for (let by = drawY; by < drawY + drawH; by += 5) {
    const offset = ((by / 5) % 2) * 4;
    for (let bx = drawX + offset; bx < drawX + drawW; bx += 8) {
      ctx.fillRect(bx, by, 6, 1);
    }
  }
}

function drawWorld() {
  const sx = canvas.width / CAMERA.w;
  const sy = canvas.height / CAMERA.h;

  // Layered sky gradient keeps the scene colorful while remaining lightweight.
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, PALETTE.deepBlue);
  sky.addColorStop(0.45, PALETTE.skyBlue);
  sky.addColorStop(1, '#95c8ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle scanlines maintain retro feel without reducing readability.
  ctx.fillStyle = 'rgba(15, 20, 38, 0.12)';
  for (let y = 0; y < canvas.height; y += 5) ctx.fillRect(0, y, canvas.width, 1);

  for (const room of rooms) {
    const drawX = Math.floor((room.x - CAMERA.x) * sx);
    const drawY = Math.floor((room.y - CAMERA.y) * sy);
    const drawW = Math.ceil(room.w * sx);
    const drawH = Math.ceil(room.h * sy);

    drawRoomTexture(drawX, drawY, drawW, drawH, room);
    if (room.type !== 'outdoor') drawBrickTexture(drawX, drawY - 3, drawW, 3);
    drawRoomWalls(drawX, drawY, drawW, drawH, room);

    // Doorway markers communicate where corridors connect rooms.
    if (room.type !== 'outdoor') {
      ctx.fillStyle = '#3e7e9c';
      ctx.fillRect(drawX + drawW / 2 - 7, drawY + drawH - 2, 14, 4);
    }

    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX, drawY, drawW, drawH);

    ctx.fillStyle = room.type === 'outdoor' ? PALETTE.cream : PALETTE.plum;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(room.name.toUpperCase(), drawX + 6, drawY + 12);
  }

  // Exit gate warning so players clearly see where escaping gets blocked.
  const gateTop = worldToScreen(schoolExit.x, schoolExit.yMin);
  const gateBottom = worldToScreen(schoolExit.x, schoolExit.yMax);
  ctx.fillStyle = '#ff4d4d';
  ctx.fillRect(gateTop.sx - 2, gateTop.sy, 4, gateBottom.sy - gateTop.sy);
  ctx.fillStyle = '#fff1d0';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('EXIT', gateTop.sx - 10, gateTop.sy - 4);

  // Stair markers are larger with textured treads for readability.
  for (const stair of stairs) {
    const points = [stair.y, stair.toY];
    for (const y of points) {
      const pos = worldToScreen(stair.x, y);
      fillDitherRect(pos.sx - 14, pos.sy - 10, 28, 20, '#f4d06f', '#ffbf3c', 4);
      ctx.fillStyle = '#8f5a00';
      for (let i = 0; i < 4; i += 1) ctx.fillRect(pos.sx - 12 + i * 6, pos.sy - 8, 2, 16);
      ctx.fillStyle = PALETTE.ink;
      ctx.font = 'bold 8px monospace';
      ctx.fillText('STAIR', pos.sx - 13, pos.sy - 12);
      ctx.font = 'bold 7px monospace';
      ctx.fillText('E', pos.sx - 2, pos.sy + 15);
    }
  }

  // Floor orientation strip in a modern full-color treatment.
  ctx.fillStyle = 'rgba(15,20,38,0.82)';
  ctx.fillRect(6, 6, 190, 52);
  ctx.strokeStyle = PALETTE.mint;
  ctx.strokeRect(6, 6, 190, 52);
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#d8cbff';
  ctx.fillText('UPPER FLOOR', 12, 20);
  ctx.fillStyle = '#b9ddff';
  ctx.fillText('MIDDLE FLOOR', 12, 36);
  ctx.fillStyle = '#bdf6c4';
  ctx.fillText('GROUND FLOOR', 12, 52);

  for (const board of blackboards) {
    const p = worldToScreen(board.x, board.y);
    fillDitherRect(p.sx - 23, p.sy - 11, 46, 16, '#194b31', '#23633f', 3);
    ctx.strokeStyle = '#93d5a9';
    ctx.strokeRect(p.sx - 23, p.sy - 11, 46, 16);
    if (board.text) {
      ctx.fillStyle = PALETTE.chalk;
      ctx.font = '8px monospace';
      ctx.fillText(board.text.slice(0, 28).toUpperCase(), p.sx - 21, p.sy - 1);
    }
  }

  // Shield pickups now use a richer gem-like sprite with highlight.
  for (const shield of shields) {
    if (shield.found) continue;
    const p = worldToScreen(shield.x, shield.y);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(p.sx - 4, p.sy - 7, 8, 14);
    ctx.fillRect(p.sx - 7, p.sy - 4, 14, 8);
    ctx.fillStyle = '#fff4c2';
    ctx.fillRect(p.sx - 2, p.sy - 5, 3, 3);
    ctx.fillStyle = '#5a3b00';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('?', p.sx - 3, p.sy + 3);
  }
}

function drawEntities() {
  const sx = canvas.width / CAMERA.w;
  const sy = canvas.height / CAMERA.h;

  for (const entity of game.entities) {
    const knocked = entity.knockedUntil > performance.now();
    const px = Math.floor((entity.x - CAMERA.x) * sx);
    const py = Math.floor((entity.y - CAMERA.y) * sy);

    // Larger sprites for readability at scroll scale.
    const body =
      entity.role === 'player' ? '#ffca3a'
      : entity.role === 'teacher' ? '#4cc9f0'
      : entity.role === 'bully' ? '#f94144'
      : entity.role === 'swot' ? '#43aa8b'
      : entity.role === 'weird' ? '#9d4edd'
      : '#f9844a';

    if (knocked) {
      ctx.fillStyle = '#b0b6c2';
      ctx.fillRect(px - 11, py - 4, 22, 7);
    } else {
      const moving = Math.abs(entity.vx) + Math.abs(entity.vy) > 0.05;
      const bob = moving ? Math.sin(entity.animPhase) * 2 : 0;
      const legKick = moving ? Math.sin(entity.animPhase) * 2.5 : 0;
      const armKick = moving ? Math.sin(entity.animPhase + Math.PI / 2) * 2 : 0;

      // Head
      ctx.fillStyle = '#ffd7b5';
      ctx.fillRect(px - 5, py - 24 + bob, 10, 6);
      // Hair cap
      ctx.fillStyle = '#513b2f';
      ctx.fillRect(px - 5, py - 24 + bob, 10, 2);
      // Body jacket
      ctx.fillStyle = body;
      ctx.fillRect(px - 7, py - 18 + bob, 14, 12);
      // Arms
      ctx.fillStyle = '#ffd7b5';
      ctx.fillRect(px - 10, py - 17 + armKick, 3, 8);
      ctx.fillRect(px + 7, py - 17 - armKick, 3, 8);
      // Legs
      ctx.fillStyle = '#1f2a44';
      ctx.fillRect(px - 6, py - 6 + legKick, 5, 8);
      ctx.fillRect(px + 1, py - 6 - legKick, 5, 8);
      // Shoe details
      ctx.fillStyle = '#13151a';
      ctx.fillRect(px - 6, py + 2 + legKick, 5, 2);
      ctx.fillRect(px + 1, py + 2 - legKick, 5, 2);
    }

    // Mood marker remains concise and readable.
    if (!knocked) {
      ctx.fillStyle = PALETTE.chalk;
      ctx.font = '10px monospace';
      const moodGlyph = entity.mood === 'angry' ? '!' : entity.mood === 'furious' ? '*' : '.';
      ctx.fillText(moodGlyph, px - 2, py - 26);
    }

    ctx.fillStyle = PALETTE.chalk;
    ctx.font = 'bold 9px monospace';
    ctx.fillText(entity.name.toUpperCase(), px - 22, py - 29);
  }

  for (const pellet of game.pellets) {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect((pellet.x - CAMERA.x - 0.08) * sx, (pellet.y - CAMERA.y - 0.08) * sy, 3, 3);
  }
}

function drawStatusOverlay() {
  if (!game.paused) return;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '30px sans-serif';
  ctx.fillText('PAUSED', canvas.width / 2 - 65, canvas.height / 2);
}

// -----------------------------------------------------------------------------
// Main loop
// -----------------------------------------------------------------------------
let last = performance.now();
function loop(now) {
  const dt = Math.min(32, now - last);
  last = now;

  if (!game.paused) {
    handleInput(dt);

    if (!game.autoMode) game.idleMs += dt;
    if (!game.autoMode && game.idleMs > 8000) {
      game.autoMode = true;
      updateAutoStatus();
      announce('🤖 Auto mode enabled (idle detected).');
      updateTodo();
    }

    player.x += player.vx * dt * 0.011;
    player.y += player.vy * dt * 0.011;
    constrain(player);

    // Update animation time for all entities so movement reads like retro sprites.
    for (const entity of game.entities) {
      const moveMagnitude = Math.abs(entity.vx) + Math.abs(entity.vy);
      entity.animPhase += dt * (0.006 + moveMagnitude * 0.01);
    }

    updateAI(dt);
    updatePellets(dt);
    updateSchedule(dt);
    checkSchoolExit();
    updateBladder(dt);
    recoverEnergy(dt / 1000);
    updateTodo();
  }

  updateCamera();

  drawWorld();
  drawEntities();
  drawStatusOverlay();

  requestAnimationFrame(loop);
}

function togglePause() {
  game.paused = !game.paused;
  pauseBtn.textContent = game.paused ? '▶️' : '⏸️';
}

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'p') togglePause();
  if (event.key.toLowerCase() === 'u') {
    game.autoMode = !game.autoMode;
    game.idleMs = 0;
    updateAutoStatus();
    announce(`🤖 Auto mode ${game.autoMode ? 'enabled' : 'disabled'} by key.`);
    updateTodo();
  }
  game.keys[event.key] = true;
  game.keys[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  game.keys[event.key] = false;
  game.keys[event.key.toLowerCase()] = false;
});

pauseBtn.onclick = togglePause;

announce('Welcome! Follow bells, survive staff, and uncover every shield letter.');
updateMission();
updateAutoStatus();
updateBladderHud();
updateTodo();
requestAnimationFrame(loop);
