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
const toggleNamesBtn = document.getElementById('toggleNamesBtn');
const entityTooltipEl = document.getElementById('entityTooltip');
document.getElementById('closeHelp').onclick = () => helpDialog.close();
helpBtn.onclick = () => helpDialog.showModal();

// -----------------------------------------------------------------------------
// World model
// -----------------------------------------------------------------------------
// Large campus coordinate space. We now render through a camera window so
// players can scroll through multiple levels and corridors.
const WORLD = { w: 170, h: 140 };

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
  { name: 'Headmaster Office', x: 161, y: 38, w: 7, h: 12, floor: 'middle', type: 'classroom' },

  // Ground level circulation and outside area.
  { name: 'Ground Corridor', x: 4, y: 76, w: 160, h: 4, floor: 'ground', type: 'corridor' },
  { name: 'Reception', x: 8, y: 66, w: 24, h: 10, floor: 'ground', type: 'hall' },
  { name: 'Geography', x: 8, y: 80, w: 24, h: 14, floor: 'ground', type: 'classroom' },
  { name: 'Art Room', x: 34, y: 80, w: 24, h: 14, floor: 'ground', type: 'classroom' },
  { name: 'History', x: 60, y: 80, w: 24, h: 14, floor: 'ground', type: 'classroom' },
  { name: 'Toilets', x: 8, y: 94, w: 20, h: 14, floor: 'ground', type: 'hall' },
  { name: 'Assembly Hall', x: 44, y: 94, w: 40, h: 14, floor: 'ground', type: 'hall' },
  { name: 'P.E. Field', x: 90, y: 80, w: 70, h: 28, floor: 'ground', type: 'outdoor' },
  { name: 'Bike Sheds', x: 92, y: 94, w: 22, h: 12, floor: 'ground', type: 'outdoor' },
  { name: 'School Gates', x: 148, y: 80, w: 18, h: 28, floor: 'ground', type: 'outdoor' },

  // Lower floor (bottom floor) with reception-adjacent spaces.
  { name: 'Lower Corridor', x: 4, y: 110, w: 160, h: 4, floor: 'lower', type: 'corridor' },
  { name: 'Boiler Room', x: 8, y: 114, w: 24, h: 14, floor: 'lower', type: 'hall' },
  { name: 'Storage', x: 38, y: 114, w: 24, h: 14, floor: 'lower', type: 'hall' },
  { name: 'Maintenance', x: 68, y: 114, w: 24, h: 14, floor: 'lower', type: 'hall' },
];

const stairs = [
  { x: 24, fromFloor: 'upper', toFloor: 'middle', fromY: 17, toY: 52, label: 'West Stairs' },
  { x: 64, fromFloor: 'upper', toFloor: 'middle', fromY: 17, toY: 52, label: 'Central Stairs' },
  { x: 104, fromFloor: 'upper', toFloor: 'middle', fromY: 17, toY: 52, label: 'East Stairs' },
  { x: 146, fromFloor: 'upper', toFloor: 'middle', fromY: 17, toY: 52, label: 'Annex Stairs' },
  { x: 24, fromFloor: 'middle', toFloor: 'ground', fromY: 52, toY: 78, label: 'West Stairs' },
  { x: 64, fromFloor: 'middle', toFloor: 'ground', fromY: 52, toY: 78, label: 'Central Stairs' },
  { x: 104, fromFloor: 'middle', toFloor: 'ground', fromY: 52, toY: 78, label: 'East Stairs' },
  { x: 146, fromFloor: 'middle', toFloor: 'ground', fromY: 52, toY: 78, label: 'Annex Stairs' },
  { x: 24, fromFloor: 'ground', toFloor: 'lower', fromY: 78, toY: 112, label: 'West Lower Stairs' },
  { x: 64, fromFloor: 'ground', toFloor: 'lower', fromY: 78, toY: 112, label: 'Central Lower Stairs' },
  { x: 104, fromFloor: 'ground', toFloor: 'lower', fromY: 78, toY: 112, label: 'East Lower Stairs' },
  { x: 146, fromFloor: 'ground', toFloor: 'lower', fromY: 78, toY: 112, label: 'Annex Lower Stairs' },
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
  { room: 'Headmaster Office', x: 164, y: 40, text: 'DISCIPLINE' },
];

const shields = [
  { x: 13, y: 6, letter: 'D', found: false },
  { x: 52, y: 6, letter: 'A', found: false },
  { x: 85, y: 6, letter: 'Z', found: false },
  { x: 140, y: 6, letter: 'E', found: false },
  { x: 18, y: 42, letter: 'S', found: false },
  { x: 154, y: 88, letter: 'K', found: false },
];

// Vending + waste system for school-life flavour and discipline interactions.
const vendingMachines = [
  { x: 18, y: 78, label: 'Corridor VM' },
  { x: 80, y: 52, label: 'Middle VM' },
  { x: 132, y: 17, label: 'Upper VM' },
  { x: 116, y: 91, label: 'Field VM' },
];

const trashCans = [
  { x: 15, y: 76, label: 'North Bin' },
  { x: 62, y: 52, label: 'Middle Bin' },
  { x: 126, y: 17, label: 'Upper Bin' },
  { x: 98, y: 90, label: 'Field Bin' },
  { x: 45, y: 97, label: 'Hall Bin' },
];

// Outdoor drinking fountains let pupils hydrate without buying from vending machines.
const waterFountains = [
  { x: 109, y: 86, label: 'Field Fountain' },
  { x: 151, y: 86, label: 'Gate Fountain' },
];

// Themed props provide flavour in rooms and can be used as throwables.
const classroomProps = [
  { room: 'Art Room', x: 38, y: 87, icon: 'A', color: '#ffd6a5', kind: 'artwork', throwable: true, hiddenUntil: 0 },
  { room: 'Art Room', x: 42, y: 89, icon: 'P', color: '#ff9f1c', kind: 'paint set', throwable: true, hiddenUntil: 0 },
  { room: 'Art Room', x: 50, y: 90, icon: 'B', color: '#2ec4b6', kind: 'paint brush', throwable: true, hiddenUntil: 0 },
  { room: 'Science Lab', x: 14, y: 10, icon: 'S', color: '#80ed99', kind: 'beaker', throwable: true, hiddenUntil: 0 },
  { room: 'Maths', x: 15, y: 46, icon: 'M', color: '#9bf6ff', kind: 'set square', throwable: true, hiddenUntil: 0 },
  { room: 'English', x: 50, y: 46, icon: 'E', color: '#b8c0ff', kind: 'book', throwable: true, hiddenUntil: 0 },
  { room: 'History', x: 66, y: 91, icon: 'H', color: '#caffbf', kind: 'globe', throwable: true, hiddenUntil: 0 },
  { room: 'Computer Room', x: 134, y: 10, icon: 'C', color: '#bde0fe', kind: 'keyboard', throwable: true, hiddenUntil: 0 },
  { room: 'Music Room', x: 112, y: 46, icon: 'D', color: '#f4978e', kind: 'drum stick', throwable: true, hiddenUntil: 0 },
  { room: 'Headmaster Office', x: 164, y: 46, icon: 'R', color: '#e5989b', kind: 'rule book', throwable: true, hiddenUntil: 0 },
];

// Bell schedule approximating school-day flow.
// Arrival is intentionally short in real-time so pupils quickly move from the
// gate lineup into tutorial without getting stuck outside.
const ARRIVAL_REAL_SECONDS = 10;
const ARRIVAL_GAME_MINUTES = (ARRIVAL_REAL_SECONDS / 60);
const schedule = [
  { period: 'Arrival', room: 'School Gates', mins: ARRIVAL_GAME_MINUTES, mode: 'transition' },
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
  lower: { label: 'Lower', color: 'Amber' },
};

const schoolExit = { x: 159.2, yMin: 84, yMax: 107 };
const floorOrder = { upper: 3, middle: 2, ground: 1, lower: 0 };
const floorSequence = ['lower', 'ground', 'middle', 'upper'];

// Preferred supervising teacher per lesson room keeps class starts orderly.
const roomTeacherMap = {
  'Science Lab': 'Dr Beaker',
  Maths: 'Mr Flash',
  English: 'Ms Take',
  Geography: 'Mr Creak',
  History: 'Mr Creak',
  'Art Room': 'Ms Take',
  'Computer Room': 'Mr Wacker',
  'Headmaster Office': 'Mr Wacker',
};

// Every teacher also has a personal classroom so staff do not clump at one doorway.
const teacherHomeRoomMap = {
  'Mr Wacker': 'Headmaster Office',
  'Mr Flash': 'Maths',
  'Ms Take': 'English',
  'Dr Beaker': 'Science Lab',
  'Mr Creak': 'History',
};

const lessonTasks = [
  'Write 10x: I must not fire catapults.',
  'Solve: 6 * 7 = ?',
  'Spell: DISCIPLINE',
  'Copy: The bell waits for no one.',
  'Name one planet in our solar system.',
  'Write 5x: Silence in class.',
];

const personalities = {
  // Keep player movement aligned with student pace so Eric no longer outruns class flow.
  bully: { speed: 1.21, aggression: 0.72, diligence: 0.2, focus: 0.5 },
  swot: { speed: 1.19, aggression: 0.04, diligence: 0.96, focus: 0.9 },
  hero: { speed: 1.2, aggression: 0.2, diligence: 0.75, focus: 0.7 },
  weird: { speed: 1.18, aggression: 0.35, diligence: 0.45, focus: 0.4 },
  teacher: { speed: 1.22, aggression: 0.55, diligence: 1.0, focus: 1.0 },
  player: { speed: 1.19, aggression: 0, diligence: 0, focus: 0 },
};

const game = {
  timeMinutes: 8 * 60 + 20,
  // Minutes advanced per real-time second; tuned so lesson travel windows are fair.
  timeScale: 0.06,
  periodIndex: 0,
  periodElapsed: 0,
  periodHoldMinutes: 0,
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
  litter: [],
  playerCarryingTrash: false,
  playerHeldItem: null,
  showNpcNames: true,
  hoveredEntity: null,
};

let seatCounter = 0;
const roomSeatCache = new Map();

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
    carryingTrash: false,
    litterWarnUntil: 0,
    assignedWaste: null,
    // Every NPC now mirrors Eric's stamina + bladder simulation.
    energy: 100,
    bladder: Math.random() * 8,
    running: false,
    isSeated: false,
    seatedRoom: null,
    writingUntil: 0,
    lastQuizAt: -Infinity,
    // Combat animation timers keep punch/fall visuals readable and lightweight.
    punchUntil: 0,
    fallStartedAt: 0,
    fallDuration: 520,
    // Arrival staging: students appear over the first 10 seconds, teachers are ready immediately.
    arrivedForDay: true,
    arrivalJoinMins: 0,
  };
}

const player = mkEntity('Eric', 'player', 48, 64, '#ffe04d', {
  title: 'Troublemaker with potential',
  prefers: ['P.E. Field'],
  quotes: ['Not me, sir!', 'I was only looking!'],
});

game.entities.push(
  player,
  mkEntity('Mr Wacker', 'teacher', 22, 42, '#8eb2ff', {
    title: 'Headmaster', strict: 0.95, attire: 'headmaster', beard: true,
  }),
  mkEntity('Mr Flash', 'teacher', 70, 40, '#f4d35e', {
    title: 'Maths Teacher', strict: 0.75, attire: 'flash', chin: 'big',
  }),
  mkEntity('Ms Take', 'teacher', 75, 42, '#82a4ff', {
    title: 'English Teacher', strict: 0.65, attire: 'plainBlueDress',
  }),
  mkEntity('Dr Beaker', 'teacher', 88, 41, '#e9ecef', {
    title: 'Science Teacher', strict: 0.8, attire: 'scienceCoat', bald: true, build: 'fat',
  }),
  mkEntity('Mr Creak', 'teacher', 56, 84, '#7e9aff', {
    title: 'History Teacher', strict: 0.85, attire: 'oldBrown', cane: true,
  }),
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

function gateQueuePosition(entity) {
  const gates = roomByName('School Gates');
  // Spread pupils into lanes near the gate so they do not pile on one pixel.
  const lane = entity.seatIndex % 7;
  const row = Math.floor(entity.seatIndex / 7) % 3;
  return {
    x: gates.x + 2 + lane * 2.05,
    y: gates.y + 3 + row * 1.9,
  };
}

function teacherGateLinePosition(teacherIndex) {
  const gates = roomByName('School Gates');
  // Teachers stand ready on the front line during arrival.
  return {
    x: gates.x + 3 + teacherIndex * 2.8,
    y: gates.y + 2,
  };
}

function hasArrivedForCurrentPeriod(entity, currentPeriod = schedule[game.periodIndex]) {
  if (entity === player) return true;
  if (currentPeriod.period !== 'Arrival') return true;
  return entity.arrivedForDay;
}

function bullyFightChance(currentPeriod) {
  // Keep mornings civil: fights are very unlikely until break starts.
  if (currentPeriod.period === 'Arrival' || currentPeriod.period === 'Tutorial') return 0.0001;
  if (currentPeriod.mode !== 'break') return 0.00035;
  return 0.006;
}

function findWitnessingTeacher(actor, range = 5.4) {
  // Keep witness logic cheap: same room + distance approximates line-of-sight.
  return game.entities.find((entity) => (
    entity.role === 'teacher'
    && entityRoom(entity) === entityRoom(actor)
    && distance(entity, actor) < range
  ));
}

function nearestPoint(origin, points) {
  let best = points[0];
  let bestDist = Infinity;
  for (const point of points) {
    const d = distance(origin, point);
    if (d < bestDist) {
      bestDist = d;
      best = point;
    }
  }
  return best;
}


function sendPlayerToHeadmaster(reason, extraLines = 45) {
  const office = roomByName('Headmaster Office');
  if (extraLines > 0) addLines(extraLines, reason);
  if (office) {
    player.x = office.x + office.w / 2;
    player.y = office.y + office.h - 2;
  }
  announce(`🏫 Mr Wacker marched Eric to the Headmaster Office for ${reason}.`);
}

function nearestThrowableProp(entity) {
  return classroomProps.find((prop) => (
    prop.throwable
    && performance.now() >= prop.hiddenUntil
    && entityRoom(entity) === prop.room
    && distance(entity, prop) < 1.8
  ));
}

function entityRoom(entity) {
  return rooms.find((r) => entity.x > r.x && entity.x < r.x + r.w && entity.y > r.y && entity.y < r.y + r.h)?.name || 'Corridor';
}

function entityFloor(entity) {
  const room = rooms.find((r) => entity.x > r.x && entity.x < r.x + r.w && entity.y > r.y && entity.y < r.y + r.h);
  return room?.floor || 'lower';
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
  // Stairs directly connect adjacent floors through explicit floor links.
  if (fromFloor === toFloor) return null;
  return stairs.filter((stair) => (
    (stair.fromFloor === fromFloor && stair.toFloor === toFloor)
    || (stair.fromFloor === toFloor && stair.toFloor === fromFloor)
  ));
}

function stairPointForFloor(stair, floor) {
  if (stair.fromFloor === floor) return { x: stair.x, y: stair.fromY };
  if (stair.toFloor === floor) return { x: stair.x, y: stair.toY };
  return null;
}

function nextFloorToward(fromFloor, destinationFloor) {
  const fromIndex = floorSequence.indexOf(fromFloor);
  const destIndex = floorSequence.indexOf(destinationFloor);
  if (fromIndex === -1 || destIndex === -1 || fromIndex === destIndex) return fromFloor;
  return floorSequence[fromIndex + (destIndex > fromIndex ? 1 : -1)];
}

function nearestStairTarget(entity, fromFloor, targetFloor) {
  const relevant = getStairLink(fromFloor, targetFloor);
  if (!relevant || !relevant.length) return null;

  let best = null;
  let bestDist = Infinity;
  for (const stair of relevant) {
    const candidate = stairPointForFloor(stair, fromFloor);
    if (!candidate) continue;
    const dist = distance(entity, candidate);
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
  if (current.mode === 'lesson') {
    // Auto Eric uses the same assigned seat mapping as the other students.
    return getSeatPosition(current.room, player.seatIndex) || roomCenter(current.room);
  }
  // Keep Eric in the same gate lineup pattern as everyone else on arrival,
  // instead of dragging him to the middle of the School Gates room.
  if (current.period === 'Arrival') return gateQueuePosition(player);
  if (current.mode === 'home') return roomCenter('School Gates');
  return roomCenter(current.room);
}

function roomAtPosition(pos) {
  return rooms.find((r) => pos.x > r.x && pos.x < r.x + r.w && pos.y > r.y && pos.y < r.y + r.h) || null;
}

function roomDoorway(room) {
  if (!room || room.type === 'corridor' || room.type === 'outdoor') return null;
  const floorCorridorY = room.floor === 'upper' ? 17 : room.floor === 'middle' ? 52 : room.floor === 'ground' ? 78 : 112;
  const topDist = Math.abs(room.y - floorCorridorY);
  const bottomDist = Math.abs((room.y + room.h) - floorCorridorY);
  const useTop = topDist <= bottomDist;
  return {
    x: room.x + room.w / 2,
    y: useTop ? room.y + 0.45 : room.y + room.h - 0.45,
  };
}

function doorwayStagingPoint(entity, doorway, room) {
  if (!doorway || !room) return doorway;
  // Spread traffic across each doorway so late students do not stack on one tile.
  const laneSeed = (entity.seatIndex % 7) - 3;
  const laneOffsetX = laneSeed * 0.52;
  const minX = room.x + 1.1;
  const maxX = room.x + room.w - 1.1;
  return {
    x: Math.max(minX, Math.min(maxX, doorway.x + laneOffsetX)),
    y: doorway.y,
  };
}

function routeWaypoint(entity, destination) {
  const currentRoom = roomAtPosition(entity);
  const destinationRoom = roomAtPosition(destination);
  // If already inside the destination room, go directly to the desk/spot.
  if (currentRoom && destinationRoom && currentRoom.name === destinationRoom.name) return destination;
  const currentFloor = entityFloor(entity);
  const destinationFloor = destinationRoom?.floor || 'ground';

  if (currentFloor !== destinationFloor) {
    const nextFloor = nextFloorToward(currentFloor, destinationFloor);
    return nearestStairTarget(entity, currentFloor, nextFloor) || destination;
  }

  if (currentRoom && currentRoom.type !== 'corridor' && currentRoom.type !== 'outdoor') {
    const exitDoor = roomDoorway(currentRoom);
    if (exitDoor && distance(entity, exitDoor) > 0.95) return exitDoor;
  }

  if (destinationRoom && destinationRoom.type !== 'corridor' && destinationRoom.type !== 'outdoor') {
    const entryDoor = roomDoorway(destinationRoom);
    const stagedDoor = doorwayStagingPoint(entity, entryDoor, destinationRoom);
    if (stagedDoor && distance(entity, stagedDoor) > 1.1) return stagedDoor;
  }

  return destination;
}

function tryUseStairs(entity, desiredFloor = null) {
  const currentFloor = entityFloor(entity);
  const intendedNextFloor = desiredFloor ? nextFloorToward(currentFloor, desiredFloor) : null;
  if (desiredFloor && desiredFloor === currentFloor) return false;
  for (const stair of stairs) {
    const currentStep = stairPointForFloor(stair, currentFloor);
    // Slightly wider trigger prevents hover loops beside stair tiles.
    if (!currentStep || distance(entity, currentStep) > 1.05) continue;
    const destinationFloor = stair.fromFloor === currentFloor ? stair.toFloor : stair.fromFloor;
    if (intendedNextFloor && destinationFloor !== intendedNextFloor) continue;
    const destinationStep = stairPointForFloor(stair, destinationFloor);
    if (!destinationStep) continue;
    entity.x = destinationStep.x;
    entity.y = destinationStep.y + (destinationFloor === 'upper' || destinationFloor === 'middle' ? 0.35 : -0.35);
    return true;
  }
  return false;
}

function getRoomSeatLayout(roomName) {
  const room = roomByName(roomName);
  if (!room || room.type !== 'classroom') return null;
  if (roomSeatCache.has(roomName)) return roomSeatCache.get(roomName);

  // Build enough seats for everyone so each classroom can seat the full student body.
  const studentCount = game.entities.filter((entity) => entity.role !== 'teacher').length;
  const usableW = Math.max(8, room.w - 8);
  const usableH = Math.max(5, room.h - 7);
  const cols = Math.max(3, Math.floor(usableW / 3));
  const rows = Math.max(2, Math.ceil(studentCount / cols));

  const seats = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = room.x + 4 + ((col + 0.5) / cols) * usableW;
      const y = room.y + 5 + ((row + 0.5) / rows) * usableH;
      seats.push({ x, y, row, col });
    }
  }

  const layout = {
    room: roomName,
    cols,
    rows,
    seats,
    boardX: room.x + room.w / 2,
    boardY: room.y + 2.2,
  };
  roomSeatCache.set(roomName, layout);
  return layout;
}

function getSeatPosition(roomName, seatIndex) {
  const layout = getRoomSeatLayout(roomName);
  if (!layout || !layout.seats.length) return null;
  const slot = seatIndex % layout.seats.length;
  return layout.seats[slot];
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
  game.litter = [];
  game.playerCarryingTrash = false;
  game.playerHeldItem = null;

  const gate = roomByName('School Gates');
  let teacherIndex = 0;
  for (const entity of game.entities) {
    if (entity === player) {
      entity.x = gate.x + gate.w / 2;
      entity.y = gate.y + gate.h - 4;
      entity.arrivedForDay = true;
      entity.arrivalJoinMins = 0;
    } else if (entity.role === 'teacher') {
      const pos = teacherGateLinePosition(teacherIndex++);
      entity.x = pos.x;
      entity.y = pos.y;
      entity.arrivedForDay = true;
      entity.arrivalJoinMins = 0;
      entity.target = { ...pos };
    } else {
      // Students appear at random moments during the 10-second arrival phase.
      entity.x = schoolExit.x + 2.2 + game.rng() * 2.2;
      entity.y = gate.y + 4 + game.rng() * (gate.h - 6);
      entity.arrivedForDay = false;
      entity.arrivalJoinMins = game.rng() * Math.max(0.01, ARRIVAL_GAME_MINUTES * 0.92);
      entity.target = null;
    }
    entity.vx = 0;
    entity.vy = 0;
    entity.carryingTrash = false;
    entity.litterWarnUntil = 0;
    entity.assignedWaste = null;
  }

  setPeriod(0);
  updateBladderHud();
  announce('🌅 New school day: students gather at the gates ready for tutorial.');
}

function updateAutoPilot(dt) {
  const current = schedule[game.periodIndex];
  const destination = chooseAutoDestination();
  const waypoint = routeWaypoint(player, destination);
  const lateForClass = (current.mode === 'lesson' || current.period === 'Tutorial')
    && entityRoom(player) !== current.room;
  // Auto mode should feel readable and controlled, not faster than manual play.
  const hallwayBoost = 1.05;
  const lateRunBoost = lateForClass ? 1.15 : 1;
  const autoSlowdown = 0.5; // Explicitly halve Eric's auto movement speed.
  const speed = ((player.personality.speed * game.energy) / 100) * hallwayBoost * lateRunBoost * autoSlowdown;

  const dx = waypoint.x - player.x;
  const dy = waypoint.y - player.y;
  const len = Math.hypot(dx, dy) || 1;

  // In lessons, lock Eric to his seat once he reaches it so he does not hover.
  const inLesson = current.mode === 'lesson';
  const atSeat = inLesson && distance(player, destination) < 0.48;
  if (atSeat) {
    player.x = destination.x;
    player.y = destination.y;
    player.vx = 0;
    player.vy = 0;
    player.isSeated = true;
    player.seatedRoom = current.room;
    return;
  }

  if (player.isSeated) {
    // Leaving a lesson seat is explicit so seated state stays visually stable.
    player.isSeated = false;
    player.seatedRoom = null;
  }

  player.vx = (dx / len) * speed;
  player.vy = (dy / len) * speed;

  // Auto mode uses doors/stairs when Eric reaches them.
  if (len < 1.1) {
    const desiredFloor = roomAtPosition(destination)?.floor || entityFloor(player);
    if (!tryUseStairs(player, desiredFloor)) interact();
  }
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
    `Use vending machines for snacks/drinks, then bin packaging`,
    `Use outside fountains (H2O) to lower bladder pressure`,
    `Throwing rubbish (V) can KO pupils but teachers punish witnesses`,
    `Avoid teachers while bunking`,
  ];
  todoEl.innerHTML = todoItems.map((t) => `<li>${t}</li>`).join('');
}

function addLines(amount, reason) {
  game.lines += amount;
  troubleEl.textContent = `📝 Lines: ${game.lines}`;
  announce(`📝 ${amount} lines for ${reason}`);
}

function spendEntityEnergy(entity, amount) {
  if (entity === player) {
    spendEnergy(amount);
    return;
  }
  // NPCs also burn stamina for combat bursts so fights have visible fatigue impact.
  entity.energy = Math.max(10, entity.energy - amount);
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
  game.periodHoldMinutes = 0;
  const current = schedule[game.periodIndex];
  // Bell changes stand everyone up and clears stale routes between periods.
  player.isSeated = false;
  player.seatedRoom = null;
  for (const entity of game.entities) {
    if (entity === player) continue;
    entity.target = null;
    entity.isSeated = false;
    entity.seatedRoom = null;
  }
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
  // Slower default walk pace; hold Shift to run and spend extra stamina.
  const baseSpeed = (player.personality.speed * game.energy) / 100;
  const running = Boolean(game.keys.Shift || game.keys.shift || game.keys.r);
  const speed = baseSpeed * (running ? 1.65 : 0.76);
  player.vx = 0;
  player.vy = 0;

  const manualMovement = game.keys.ArrowLeft || game.keys.a || game.keys.ArrowRight || game.keys.d || game.keys.ArrowUp || game.keys.w || game.keys.ArrowDown || game.keys.s;
  if (manualMovement || game.keys.z || game.keys.x || game.keys.e || game.keys.c || game.keys.q) {
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

  if (player.isSeated) {
    if (game.keys.q) {
      toggleSeat();
      game.keys.q = false;
    }
    player.vx = 0;
    player.vy = 0;
    return;
  }

  if (game.keys.ArrowLeft || game.keys.a) player.vx = -speed;
  if (game.keys.ArrowRight || game.keys.d) player.vx = speed;
  if (game.keys.ArrowUp || game.keys.w) player.vy = -speed;
  if (game.keys.ArrowDown || game.keys.s) player.vy = speed;

  // Running drains stamina faster than walking.
  if (Math.abs(player.vx) + Math.abs(player.vy) > 0.1) {
    spendEnergy((running ? 1.45 : 0.45) * (dt / 1000));
  }

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
  if (game.keys.q) {
    toggleSeat();
    game.keys.q = false;
  }
  if (game.keys.c) {
    // Vending requires proximity and leaves packaging that should be binned.
    const machine = nearestPoint(player, vendingMachines);
    if (machine && distance(player, machine) < 2.1) {
      if (!game.playerCarryingTrash) {
        if (game.rng() < 0.5) {
          game.drinksToday += 1;
          game.energy = Math.min(100, game.energy + 9);
          game.bladder = Math.min(100, game.bladder + 16);
          announce('🥤 Eric bought a drink. Energy up, bladder rising.');
        } else {
          game.energy = Math.min(100, game.energy + 14);
          announce('🍫 Eric bought a snack. Energy boosted.');
        }
        energyEl.textContent = `⚡ Energy: ${Math.round(game.energy)}`;
        updateBladderHud();
        game.playerCarryingTrash = true;
      } else {
        announce('🧻 Eric is already carrying rubbish. Use a bin first.');
      }
    } else {
      announce('🥤 Find a vending machine first (marked VM).');
    }
    game.keys.c = false;
  }

  if (game.keys.v) {
    if (game.playerHeldItem) {
      throwRoomItem(player, game.playerHeldItem);
    } else if (game.playerCarryingTrash) {
      throwRubbish(player);
    } else {
      const prop = nearestThrowableProp(player);
      if (prop) {
        game.playerHeldItem = prop;
        announce(`🧰 Eric picked up a ${prop.kind}. Press V again to throw it.`);
      } else {
        announce('🧰 No throwable classroom item nearby.');
      }
    }
    game.keys.v = false;
  }
}

function meleeAttack(attacker) {
  attacker.punchUntil = performance.now() + 220;
  const strikeRange = attacker.profile.cane ? 1.95 : 1.45;
  for (const target of game.entities) {
    if (target === attacker || target.knockedUntil > performance.now()) continue;
    if (distance(attacker, target) < strikeRange) {
      target.hp -= attacker.profile.cane ? 55 : 45;
      target.mood = 'angry';
      if (attacker.profile.cane) {
        announce(`🪵 ${attacker.name} thwacked ${target.name} with a walking stick`);
      } else {
        announce(`👊 ${attacker.name} punched ${target.name}`);
      }
      if (target.hp <= 0) knockout(target, attacker);
      if (attacker === player && target.role === 'teacher') addLines(120, 'striking a teacher');
      spendEntityEnergy(attacker, 7);
      if (target !== player) target.energy = Math.max(10, target.energy - 3.5);
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
  spendEntityEnergy(attacker, 5);
}

function throwRubbish(attacker) {
  const isPlayer = attacker === player;
  if (!attacker.carryingTrash && !(isPlayer && game.playerCarryingTrash)) {
    if (isPlayer) announce('🧻 Eric has no rubbish to throw. Buy from VM or pick up litter first.');
    return;
  }

  game.pellets.push({
    x: attacker.x,
    y: attacker.y - 0.4,
    vx: attacker.facing * 0.2,
    vy: -0.02,
    owner: attacker,
    kind: 'rubbish',
  });

  if (isPlayer) {
    game.playerCarryingTrash = false;
    announce('🧻 Eric threw rubbish. If a teacher sees it, detention lines are coming.');
    const teacherWitness = findWitnessingTeacher(attacker);
    if (teacherWitness) {
      addLines(35, 'throwing rubbish at pupils');
      announce(`🧑‍🏫 ${teacherWitness.name}: "Eric! Stop throwing rubbish right now!"`);
    }
  } else {
    attacker.carryingTrash = false;
    attacker.assignedWaste = null;
    announce(`🧻 ${attacker.name} hurled rubbish across the yard.`);
  }
}


function throwRoomItem(attacker, prop) {
  prop.hiddenUntil = performance.now() + 20000;
  game.pellets.push({
    x: attacker.x,
    y: attacker.y - 0.6,
    vx: attacker.facing * 0.22,
    vy: -0.03,
    owner: attacker,
    kind: 'item',
    itemName: prop.kind,
    itemColor: prop.color,
  });

  if (attacker === player) {
    game.playerHeldItem = null;
    sendPlayerToHeadmaster(`throwing a ${prop.kind}`);
  }
}

function knockout(entity, by) {
  const now = performance.now();
  entity.hp = 100;
  entity.knockedUntil = now + 6200;
  entity.fallStartedAt = now;
  entity.punchUntil = 0;
  entity.mood = 'dazed';
  announce(`💫 ${entity.name} knocked out by ${by.name}`);
}

function isSeatOccupied(roomName, seat, ignoreEntity = null) {
  return game.entities.some((entity) => (
    entity !== ignoreEntity
    && entity.isSeated
    && entity.seatedRoom === roomName
    && distance(entity, seat) < 0.65
  ));
}

function nearestFreeSeatInRoom(roomName, actor) {
  const layout = getRoomSeatLayout(roomName);
  if (!layout) return null;

  let best = null;
  let bestDist = Infinity;
  for (const seat of layout.seats) {
    if (isSeatOccupied(roomName, seat, actor)) continue;
    const d = distance(actor, seat);
    if (d < bestDist) {
      best = seat;
      bestDist = d;
    }
  }
  return best;
}

function toggleSeat() {
  const currentRoom = entityRoom(player);
  const room = roomByName(currentRoom);
  if (!room || room.type !== 'classroom') {
    announce('🪑 Eric can only sit in a classroom seat.');
    return;
  }

  if (player.isSeated) {
    player.isSeated = false;
    player.seatedRoom = null;
    announce('🧍 Eric stands up.');
    return;
  }

  const seat = nearestFreeSeatInRoom(currentRoom, player);
  if (!seat || distance(player, seat) > 2.2) {
    announce('🪑 Move closer to an empty chair and press Q to sit.');
    return;
  }

  player.x = seat.x;
  player.y = seat.y;
  player.vx = 0;
  player.vy = 0;
  player.isSeated = true;
  player.seatedRoom = currentRoom;
  announce(`🪑 Eric sits down in ${currentRoom}. Press Q again to stand.`);
}

function interact() {
  // Stairs are intentionally activated with interact for predictable movement.
  const currentFloor = entityFloor(player);
  const nearbyStair = stairs.find((stair) => {
    const fromStep = { x: stair.x, y: stair.fromY };
    const toStep = { x: stair.x, y: stair.toY };
    const nearStepA = distance(player, fromStep) < 1.6;
    const nearStepB = distance(player, toStep) < 1.6;
    return nearStepA || nearStepB;
  });
  if (nearbyStair) {
    const fromPoint = stairPointForFloor(nearbyStair, nearbyStair.fromFloor);
    const toPoint = stairPointForFloor(nearbyStair, nearbyStair.toFloor);
    const standingOnFrom = currentFloor === nearbyStair.fromFloor && distance(player, fromPoint) < 1.6;
    const destination = standingOnFrom ? toPoint : fromPoint;
    const destinationFloor = standingOnFrom ? nearbyStair.toFloor : nearbyStair.fromFloor;
    const movingUp = floorOrder[destinationFloor] > floorOrder[currentFloor];
    player.x = destination.x;
    player.y = destination.y + (movingUp ? 0.4 : -0.4);
    announce(`🪜 Used ${nearbyStair.label} to ${movingUp ? 'go up' : 'go down'} a floor.`);
    updateFloorStatus();
    return;
  }

  // Use nearby bins to dispose of packaging.
  const nearbyBin = trashCans.find((bin) => distance(player, bin) < 2.1);
  if (nearbyBin && game.playerCarryingTrash) {
    game.playerCarryingTrash = false;
    announce(`🗑️ Eric used ${nearbyBin.label} and binned his rubbish.`);
    return;
  }

  // Outdoor fountains lower bladder pressure and provide a tiny stamina top-up.
  const nearbyFountain = waterFountains.find((fountain) => distance(player, fountain) < 2.1);
  if (nearbyFountain) {
    game.bladder = Math.max(0, game.bladder - 30);
    game.energy = Math.min(100, game.energy + 4);
    updateBladderHud();
    energyEl.textContent = `⚡ Energy: ${Math.round(game.energy)}`;
    announce(`🚰 Eric drinks from ${nearbyFountain.label}. Refreshed and ready.`);
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
  const now = performance.now();
  if (
    teacherNearby
    && entityRoom(player) === current.room
    && !game.quizActive
    // Slower questioning cadence so lessons feel less spammy.
    && now - teacherNearby.lastQuizAt > 45000
    && game.rng() < 0.45
  ) {
    const quiz = { q: 'What is 6 x 7?', answer: '42' };
    game.quizActive = quiz;
    teacherNearby.lastQuizAt = now;
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
function teacherBoardSpot(periodRoom) {
  const board = blackboards.find((candidate) => candidate.room === periodRoom);
  if (board) {
    return { x: board.x - 1.1, y: board.y + 0.2, room: periodRoom };
  }
  const fallback = roomCenter(periodRoom);
  return { ...fallback, room: periodRoom };
}

function assignedTeacherForRoom(roomName) {
  return roomTeacherMap[roomName] || null;
}

function teacherHomeRoom(teacherName) {
  return teacherHomeRoomMap[teacherName] || 'Staff Room';
}

function chooseTarget(entity, currentPeriod) {
  // High bladder urgency overrides normal timetable targets.
  if (entity.bladder >= 80) {
    return roomCenter('Toilets');
  }

  // Teachers occasionally step out to the toilet and then return to class.
  if (entity.role === 'teacher' && entity.bladder >= 72) {
    return roomCenter('Toilets');
  }

  const p = entity.personality;
  const shouldAttend = game.rng() < p.diligence;

  if (currentPeriod.period === 'Arrival') {
    return gateQueuePosition(entity);
  }

  if (currentPeriod.mode === 'lesson') {
    if (entity.role === 'teacher') return teacherBoardSpot(currentPeriod.room);
    // Students always aim for seats during lessons so classes look orderly.
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

function isTeacherPresentForPeriod(currentPeriod) {
  if (currentPeriod.mode !== 'lesson' && currentPeriod.period !== 'Tutorial') return true;
  // Count attendance by room presence so lessons don't stall when teachers pace near the board.
  return game.entities.some((entity) => (
    entity.role === 'teacher'
    && entityRoom(entity) === currentPeriod.room
    && entity.knockedUntil < performance.now()
  ));
}

function updateNpcVitals(entity, dt, isRunning) {
  // `dt` is provided in milliseconds, so convert once to keep stamina math in
  // real-world seconds. Without this conversion NPCs lose almost all energy in
  // moments and appear to crawl for the rest of the day.
  const dtSeconds = dt / 1000;
  const deltaMins = (dt / 1000) * game.timeScale;
  // NPC bladder rises over time, slightly quicker while running.
  entity.bladder = Math.min(100, entity.bladder + deltaMins * (0.34 + (isRunning ? 0.2 : 0)));

  if (entityRoom(entity) === 'Toilets' && entity.bladder >= 15) {
    entity.bladder = 0;
  }

  // School-day tuned stamina: normal walking causes light drain so pupils tire by lunch.
  const baseDrainPerSecond = 0.19;
  const runningExtraDrainPerSecond = 0.58;
  const recoverPerSecond = 0.16;
  const period = schedule[game.periodIndex];
  const isLunch = period.period === 'Lunch';
  const inFoodZone = entityRoom(entity) === 'P.E. Field' || entityRoom(entity) === 'Reception';
  const canRecoverFromMeal = period.mode === 'break' && isLunch && inFoodZone;

  if (canRecoverFromMeal) {
    entity.energy = Math.min(100, entity.energy + dtSeconds * recoverPerSecond);
    return;
  }

  const drainRate = baseDrainPerSecond + (isRunning ? runningExtraDrainPerSecond : 0);
  entity.energy = Math.max(16, entity.energy - dtSeconds * drainRate);
}

function pushStudentAsideForTeacher(teacher, student, dtSeconds) {
  // Teachers have right-of-way in corridors: nearby students are nudged aside
  // so staff can reach lessons on time instead of getting body-blocked.
  const offsetX = student.x - teacher.x;
  const offsetY = student.y - teacher.y;
  const gap = Math.hypot(offsetX, offsetY) || 0.001;
  if (gap > 1.08) return;

  const shove = ((1.08 - gap) / 1.08) * (3.6 * dtSeconds);
  student.x += (offsetX / gap) * shove;
  student.y += (offsetY / gap) * shove;
  constrain(student);
}

function updateAI(dt) {
  const current = schedule[game.periodIndex];
  const supervised = current.mode === 'lesson' || current.period === 'Tutorial';
  const teacherPresent = isTeacherPresentForPeriod(current);
  const assignedTeacherName = assignedTeacherForRoom(current.room);

  for (const entity of game.entities) {
    if (entity === player) continue;
    if (!hasArrivedForCurrentPeriod(entity, current)) {
      if (game.periodElapsed >= entity.arrivalJoinMins) {
        entity.arrivedForDay = true;
      } else {
        continue;
      }
    }
    if (entity.knockedUntil > performance.now()) continue;

    const inLesson = current.mode === 'lesson' || current.period === 'Tutorial';
    const studentInCurrentClass = entity.role !== 'teacher' && entityRoom(entity) === current.room;

    // Keep students focused in class: continuously pull them to their classroom seat.
    if (inLesson && entity.role !== 'teacher') {
      entity.target = getSeatPosition(current.room, entity.seatIndex)
        || nearestFreeSeatInRoom(current.room, entity)
        || roomCenter(current.room);
    } else if (inLesson && entity.role === 'teacher') {
      // Dedicated teacher handles the active lesson; others return to their own classrooms.
      const isAssignedTeacher = !assignedTeacherName || entity.name === assignedTeacherName;
      const destinationRoom = isAssignedTeacher ? current.room : teacherHomeRoom(entity.name);
      entity.target = teacherBoardSpot(destinationRoom);
    } else if (!entity.target || game.rng() < 0.01) {
      entity.target = chooseTarget(entity, current);
    }

    // General student misbehaviour: keep rare and mostly outside lessons.
    if (entity.role !== 'teacher' && !inLesson && supervised && game.rng() < 0.0016) {
      entity.mood = 'angry';
      entity.target = roomCenter(game.rng() < 0.5 ? 'P.E. Field' : 'Ground Corridor');
      announce(`😈 ${entity.name} started misbehaving in ${current.period}.`);
    }

    // Angelface can slip out through the gates unnoticed and re-enter later.
    if (entity.name === 'Angelface' && entityRoom(entity) === 'School Gates' && game.rng() < 0.003) {
      entity.target = { x: schoolExit.x + 2.6, y: 92 };
      if (entity.x > schoolExit.x + 1.8) {
        entity.x = 92;
        entity.y = 88;
        entity.target = roomCenter('P.E. Field');
        announce('😎 Angelface sneaked out and later strolled back in unnoticed.');
      }
    }

    // Teacher discipline: if they catch player in wrong room, assign lines.
    if (entity.role === 'teacher' && distance(entity, player) < 1.8 && entityRoom(player) !== current.room && supervised && teacherPresent) {
      addLines(40, `${entity.name} caught you bunking ${current.period}`);
    }

    // Swot tattles if player is misbehaving nearby.
    if (entity.profile.tattles && distance(entity, player) < 2 && game.rng() < 0.0025 && game.lines > 0) {
      addLines(10, `${entity.name} tattled`);
      announce(`📣 ${entity.name}: "Sir! Eric is being bad!"`);
    }

    // Bully behaviour is period-aware so mornings stay mostly calm.
    if (entity.role === 'bully' && game.rng() < bullyFightChance(current)) {
      meleeAttack(entity);
    }

    const teacherWatchingBully = findWitnessingTeacher(entity, 6.2);
    // Bullies are bolder with rubbish when staff are out of sight.
    if (entity.role === 'bully' && !teacherWatchingBully) {
      const victim = game.entities.find((candidate) => (
        candidate !== entity
        && candidate.role !== 'teacher'
        && candidate.knockedUntil < performance.now()
        && distance(entity, candidate) < 4.4
      ));
      if (victim && entity.carryingTrash && game.rng() < 0.0045) {
        entity.facing = victim.x >= entity.x ? 1 : -1;
        throwRubbish(entity);
      }
    }

    // Students can buy food/drink at vending machines and then carry packaging.
    if (entity.role !== 'teacher' && !entity.carryingTrash && current.mode === 'break' && game.rng() < 0.0018) {
      entity.carryingTrash = true;
      entity.target = nearestPoint(entity, vendingMachines);
    }

    // Most students bin litter; some occasionally drop it and get told off.
    if (entity.role !== 'teacher' && entity.carryingTrash && !inLesson) {
      const nearestBin = nearestPoint(entity, trashCans);
      const littering = game.rng() < 0.001;
      if (littering) {
        entity.carryingTrash = false;
        entity.assignedWaste = { x: entity.x, y: entity.y, offender: entity, warned: false };
        game.litter.push(entity.assignedWaste);
      } else if (nearestBin && distance(entity, nearestBin) < 1.5) {
        entity.carryingTrash = false;
        entity.assignedWaste = null;
      } else {
        entity.target = nearestBin;
      }
    }

    if (entity.role === 'teacher') {
      const seenLitter = game.litter.find((item) => !item.warned && distance(entity, item) < 2.1 && item.offender);
      if (seenLitter) {
        seenLitter.warned = true;
        seenLitter.offender.carryingTrash = true;
        seenLitter.offender.target = nearestPoint(seenLitter.offender, trashCans);
        seenLitter.offender.litterWarnUntil = performance.now() + 4000;
        // Teacher makes pupil pick it up immediately, then walk it to a bin.
        game.litter = game.litter.filter((item) => item !== seenLitter);
        announce(`🧑‍🏫 ${entity.name}: "Pick that litter up and use the bin!"`);
      }
    }

    const desiredFloor = roomAtPosition(entity.target)?.floor || entityFloor(entity);
    if (tryUseStairs(entity, desiredFloor)) {
      entity.vx = 0;
      entity.vy = 0;
      updateNpcVitals(entity, dt, false);
      continue;
    }

    const routedTarget = routeWaypoint(entity, entity.target);
    let dx = routedTarget.x - entity.x;
    let dy = routedTarget.y - entity.y;

    // Lightweight separation avoids visual clumping, but we skip it for seated pupils
    // so classroom rows stay stable and students don't drift toward the blackboard.
    if (!(inLesson && studentInCurrentClass)) {
      for (const other of game.entities) {
        if (other === entity || other.knockedUntil > performance.now()) continue;
        const gapX = entity.x - other.x;
        const gapY = entity.y - other.y;
        const gap = Math.hypot(gapX, gapY) || 0.001;
        if (gap < 1.45) {
          // Teachers keep priority: students yield more, teachers yield less.
          let push = ((1.45 - gap) / 1.45) * 0.46;
          if (entity.role !== 'teacher' && other.role === 'teacher') push *= 2.35;
          if (entity.role === 'teacher' && other.role !== 'teacher') push *= 0.28;
          dx += (gapX / gap) * push;
          dy += (gapY / gap) * push;
        }

        // Teachers can physically clear students blocking their path.
        if (entity.role === 'teacher' && other.role !== 'teacher') {
          pushStudentAsideForTeacher(entity, other, dt / 1000);
        }
      }
    }

    const len = Math.hypot(dx, dy) || 1;

    // During gate lineup, lock pupils/teachers still once they reach their slot.
    if (current.period === 'Arrival' && len < 0.52) {
      entity.vx = 0;
      entity.vy = 0;
      entity.running = false;
      constrain(entity);
      updateNpcVitals(entity, dt, false);
      continue;
    }

    const seatedTarget = inLesson && entity.role !== 'teacher' && entityRoom(entity) === current.room;
    entity.isSeated = seatedTarget && len < 0.55;
    entity.seatedRoom = entity.isSeated ? current.room : null;

    const expectedRoom = entity.role === 'teacher'
      ? (assignedTeacherName && entity.name === assignedTeacherName ? current.room : teacherHomeRoom(entity.name))
      : current.room;
    const lateForClass = supervised && teacherPresent && entityRoom(entity) !== expectedRoom;
    const canRun = entity.energy > 20;
    entity.running = lateForClass && canRun;
    const runBoost = entity.running ? 1.72 : 1;
    // Teachers are intentionally quicker than students to keep lessons moving.
    const hallwayBoost = entity.role === 'teacher' ? 3.95 : 3.3;
    // Staff get an extra catch-up boost so lessons do not appear to start without a teacher.
    const staffCatchupBoost = entity.role === 'teacher' && lateForClass ? 1.75 : 1;
    const speed = entity.personality.speed * (entity.energy / 100) * hallwayBoost * runBoost * staffCatchupBoost;

    entity.vx = entity.isSeated ? 0 : (dx / len) * speed;
    entity.vy = entity.isSeated ? 0 : (dy / len) * speed;

    entity.x += entity.vx * (dt / 1000);
    entity.y += entity.vy * (dt / 1000);

    constrain(entity);
    updateNpcVitals(entity, dt, entity.running);

    if (distance(entity, entity.target) < 0.9) entity.target = null;

    // Teachers occasionally issue live board tasks.
    if (entity.role === 'teacher' && game.rng() < 0.002) {
      const board = blackboards.find((b) => b.room === current.room);
      if (board) {
        board.text = lessonTasks[Math.floor(game.rng() * lessonTasks.length)];
        announce(`🧑‍🏫 ${entity.name}: "Quiet! Copy the board."`);
      }
    }

    // Teachers near boards animate as writing during lessons.
    const boardHere = blackboards.find((b) => b.room === entityRoom(entity));
    if (entity.role === 'teacher' && boardHere && distance(entity, boardHere) < 2.2 && supervised) {
      entity.writingUntil = performance.now() + 450;
      entity.facing = boardHere.x >= entity.x ? 1 : -1;
    }
  }
}

function updatePellets(dt) {
  for (const pellet of game.pellets) {
    pellet.x += pellet.vx * dt * 0.09;
    pellet.y += pellet.vy * dt * 0.09;
    pellet.vy += 0.0008 * dt;

    for (const entity of game.entities) {
      if (!hasArrivedForCurrentPeriod(entity)) continue;
      if (entity === pellet.owner || entity.knockedUntil > performance.now()) continue;
      if (distance(pellet, entity) < 0.75) {
        if (pellet.kind === 'rubbish') {
          // Rubbish throws are prank weapons: they instantly topple students.
          if (entity.role !== 'teacher') {
            knockout(entity, pellet.owner);
            entity.mood = 'furious';
          }
          game.litter.push({ x: entity.x, y: entity.y, offender: pellet.owner, warned: false });
          if (pellet.owner === player) {
            const witness = findWitnessingTeacher(player, 6.2);
            if (witness) {
              addLines(20, 'throwing rubbish where staff could see');
              announce(`🧑‍🏫 ${witness.name} saw the flying rubbish and gave Eric lines.`);
            }
          }
        } else {
          entity.hp -= pellet.kind === 'item' ? 85 : 60;
          entity.mood = 'furious';
          if (pellet.kind === 'item' && pellet.owner === player) {
            sendPlayerToHeadmaster(`throwing ${pellet.itemName || 'classroom items'}`, 20);
          }
          if (entity.hp <= 0) knockout(entity, pellet.owner);
        }
        pellet.dead = true;
      }
    }

    if (pellet.x < 0 || pellet.x > WORLD.w || pellet.y > WORLD.h) {
      if (pellet.kind === 'rubbish') {
        game.litter.push({ x: Math.max(0, Math.min(WORLD.w, pellet.x)), y: Math.max(0, Math.min(WORLD.h, pellet.y)), offender: pellet.owner, warned: false });
      }
      pellet.dead = true;
    }
  }

  game.pellets = game.pellets.filter((p) => !p.dead);
}

function updateSchedule(dt) {
  const current = schedule[game.periodIndex];
  const deltaMins = (dt / 1000) * game.timeScale;
  const teacherPresent = isTeacherPresentForPeriod(current);
  const periodWaiting = (current.mode === 'lesson' || current.period === 'Tutorial') && !teacherPresent;

  // Lessons wait briefly for the teacher, then continue so the school day never soft-locks.
  if (periodWaiting) {
    game.periodHoldMinutes += deltaMins;
  } else {
    game.periodHoldMinutes = 0;
  }

  const maxTeacherWaitMins = 6;
  const forceContinue = periodWaiting && game.periodHoldMinutes >= maxTeacherWaitMins;
  if (!periodWaiting || forceContinue) {
    game.periodElapsed += deltaMins;
  }
  if (forceContinue && game.periodHoldMinutes - deltaMins < maxTeacherWaitMins) {
    announce(`⏱️ ${current.period} resumed after waiting for staff to arrive.`);
  }
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
    const graceWindow = game.periodElapsed < 2.5;
    if (entityRoom(player) !== current.room && monitored && teacherPresent && !graceWindow) addLines(10, `late for ${current.period}`);
    game.lastLateTick = 0;
  }

  // Teachers discipline Eric if he litters and is spotted before he bins it.
  if (game.playerCarryingTrash) {
    const nearbyTeacher = game.entities.find((e) => e.role === 'teacher' && distance(e, player) < 1.9);
    if (nearbyTeacher && game.rng() < 0.003) {
      addLines(15, 'dropping or carrying litter carelessly');
      announce(`🧑‍🏫 ${nearbyTeacher.name}: "Use a bin, Eric. No littering!"`);
    }
  }

  clockEl.textContent = `🕘 Time: ${formatTime(game.timeMinutes)}`;
  periodEl.textContent = `🔔 Period: ${current.period}${periodWaiting ? ' (waiting for teacher)' : ''}`;
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

    if (room.type === 'classroom') {
      const layout = getRoomSeatLayout(room.name);
      // Every classroom renders a full desk/chair layout to match available student seating.
      if (layout) {
        for (const seat of layout.seats) {
          const seatPos = worldToScreen(seat.x, seat.y);
          // Desk top.
          ctx.fillStyle = '#8b5e3c';
          ctx.fillRect(seatPos.sx - 5, seatPos.sy - 5, 10, 4);
          // Desk legs.
          ctx.fillStyle = '#5f3d2a';
          ctx.fillRect(seatPos.sx - 5, seatPos.sy - 1, 2, 3);
          ctx.fillRect(seatPos.sx + 3, seatPos.sy - 1, 2, 3);
          // Chair and backrest behind desk.
          ctx.fillStyle = '#435b7a';
          ctx.fillRect(seatPos.sx - 3, seatPos.sy + 2, 6, 2);
          ctx.fillRect(seatPos.sx - 3, seatPos.sy, 2, 2);
          ctx.fillRect(seatPos.sx + 1, seatPos.sy, 2, 2);
        }
      }
    }

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
    const points = [stair.fromY, stair.toY];
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
  ctx.fillStyle = '#ffd67a';
  ctx.fillText('LOWER FLOOR', 110, 52);

  // Vending machines and bins are rendered as interactable landmarks.
  for (const vm of vendingMachines) {
    const p = worldToScreen(vm.x, vm.y);
    fillDitherRect(p.sx - 10, p.sy - 14, 20, 28, '#2b4e7c', '#3f6aa0', 3);
    ctx.fillStyle = '#9ff3ff';
    ctx.fillRect(p.sx - 6, p.sy - 10, 12, 7);
    ctx.fillStyle = '#f6d365';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('VM', p.sx - 5, p.sy + 10);
  }

  for (const bin of trashCans) {
    const p = worldToScreen(bin.x, bin.y);
    fillDitherRect(p.sx - 7, p.sy - 9, 14, 16, '#4b5a66', '#6a7a88', 2);
    ctx.fillStyle = '#d3dee8';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('BIN', p.sx - 7, p.sy - 12);
  }

  for (const fountain of waterFountains) {
    const p = worldToScreen(fountain.x, fountain.y);
    fillDitherRect(p.sx - 8, p.sy - 11, 16, 20, '#4ea8de', '#72c6f5', 3);
    ctx.fillStyle = '#dff6ff';
    ctx.fillRect(p.sx - 2, p.sy - 8, 4, 9);
    ctx.fillStyle = '#95d5ff';
    ctx.fillRect(p.sx - 5, p.sy - 1, 10, 3);
    ctx.fillStyle = '#f1fbff';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('H2O', p.sx - 7, p.sy - 13);
  }

  for (const waste of game.litter) {
    const p = worldToScreen(waste.x, waste.y);
    ctx.fillStyle = '#f4a261';
    ctx.fillRect(p.sx - 3, p.sy - 2, 6, 4);
  }

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

  // Themed classroom props visually communicate each room's speciality.
  for (const prop of classroomProps) {
    if (performance.now() < prop.hiddenUntil) continue;
    const p = worldToScreen(prop.x, prop.y);
    ctx.fillStyle = prop.color;
    ctx.fillRect(p.sx - 5, p.sy - 4, 10, 8);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 7px monospace';
    ctx.fillText(prop.icon, p.sx - 3, p.sy + 2);
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

  const current = schedule[game.periodIndex];
  for (const entity of game.entities) {
    if (!hasArrivedForCurrentPeriod(entity, current)) continue;
    const now = performance.now();
    const knocked = entity.knockedUntil > now;
    const isPunching = entity.punchUntil > now;
    const isWriting = entity.writingUntil > now;
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
      // Falling animation: a quick 3-step rotation before the flattened dazed frame.
      const fallProgress = entity.fallStartedAt ? (now - entity.fallStartedAt) / entity.fallDuration : 1;
      const clampedFall = Math.max(0, Math.min(1, fallProgress));
      const fallFrame = Math.min(2, Math.floor(clampedFall * 3));

      if (clampedFall < 1) {
        ctx.save();
        const tilt = (Math.PI / 2.6) * (fallFrame + 1) / 3;
        ctx.translate(px, py - 9);
        ctx.rotate(entity.facing >= 0 ? tilt : -tilt);
        ctx.fillStyle = body;
        ctx.fillRect(-6, -8, 12, 15);
        ctx.fillStyle = '#ffd7b5';
        ctx.fillRect(-5, -14, 10, 6);
        ctx.fillStyle = '#1f2a44';
        ctx.fillRect(-5, 7, 4, 5);
        ctx.fillRect(1, 7, 4, 5);
        ctx.restore();
      } else {
        ctx.fillStyle = '#b0b6c2';
        ctx.fillRect(px - 11, py - 4, 22, 7);
      }
    } else {
      const moving = Math.abs(entity.vx) + Math.abs(entity.vy) > 0.05;
      const seated = Boolean(entity.isSeated);
      // 5-frame walk cycle to replace the previous 2-pose sine swing.
      const walkFrame = moving && !seated ? Math.floor(entity.animPhase) % 5 : 2;
      const walkBobOffsets = [-1.5, -0.5, 0.75, -0.5, -1.5];
      const legSwingOffsets = [-3, -1.5, 0, 1.5, 3];
      const armSwingOffsets = [3, 1.5, 0, -1.5, -3];
      const bob = seated ? 1.6 : walkBobOffsets[walkFrame];
      const legKick = seated ? 0 : legSwingOffsets[walkFrame];
      const armKick = seated ? 0.6 : armSwingOffsets[walkFrame];

      // Punching uses a short forward-thrust frame and a recoil frame.
      const punchElapsed = Math.max(0, 220 - (entity.punchUntil - now));
      const punchFrame = isPunching ? (punchElapsed > 110 ? 1 : 0) : -1;
      const punchReach = punchFrame === 0 ? 5 : punchFrame === 1 ? 2 : isWriting ? 4 : 0;
      const punchLift = punchFrame === 0 ? -2 : 0;
      const writingFrame = isWriting ? Math.floor((now / 90) % 4) : 0;

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
      const strikeDir = entity.facing >= 0 ? 1 : -1;
      const rightArmX = strikeDir > 0 ? px + 7 + punchReach : px + 7;
      const leftArmX = strikeDir < 0 ? px - 10 - punchReach : px - 10;
      ctx.fillRect(leftArmX, py - 17 + armKick + (strikeDir < 0 ? punchLift : 0) - (isWriting ? writingFrame : 0), 3, 8);
      ctx.fillRect(rightArmX, py - 17 - armKick + (strikeDir > 0 ? punchLift : 0) + (isWriting ? writingFrame : 0), 3, 8);
      if (isWriting && entity.role === 'teacher') {
        ctx.fillStyle = '#f8f9fa';
        const chalkX = strikeDir > 0 ? px + 14 : px - 14;
        ctx.fillRect(chalkX, py - 15, 3, 2);
      }
      // Legs use a bent seated frame when pupils sit in chairs.
      ctx.fillStyle = '#1f2a44';
      if (seated) {
        ctx.fillRect(px - 7, py - 8, 6, 3);
        ctx.fillRect(px + 1, py - 8, 6, 3);
        ctx.fillRect(px - 8, py - 5, 4, 6);
        ctx.fillRect(px + 4, py - 5, 4, 6);
        ctx.fillStyle = '#13151a';
        ctx.fillRect(px - 8, py + 1, 4, 2);
        ctx.fillRect(px + 4, py + 1, 4, 2);
      } else {
        ctx.fillRect(px - 6, py - 6 + legKick, 5, 8);
        ctx.fillRect(px + 1, py - 6 - legKick, 5, 8);
        // Shoe details
        ctx.fillStyle = '#13151a';
        ctx.fillRect(px - 6, py + 2 + legKick, 5, 2);
        ctx.fillRect(px + 1, py + 2 - legKick, 5, 2);
      }

      // Teachers are rendered larger and more formal than students.
      if (entity.role === 'teacher') {
        const attire = entity.profile.attire || 'staff';

        // Broad shoulders + taller coat silhouette to read clearly at distance.
        ctx.fillStyle = attire === 'scienceCoat' ? '#f8f9fa' : attire === 'flash' ? '#f4d35e' : attire === 'plainBlueDress' ? '#4f86f7' : attire === 'oldBrown' ? '#8d6e63' : '#1e2438';
        ctx.fillRect(px - 9, py - 21 + bob, 18, 15);

        // Formal tie/collar motif helps identify staff quickly.
        ctx.fillStyle = '#fefefe';
        ctx.fillRect(px - 2, py - 19 + bob, 4, 4);
        ctx.fillStyle = '#c1121f';
        ctx.fillRect(px - 1, py - 15 + bob, 2, 4);

        if (entity.name === 'Mr Wacker' || entity.profile.beard) {
          // Headmaster: black suit with beard.
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px - 10, py - 22 + bob, 20, 3);
          ctx.fillStyle = '#5a3b2e';
          ctx.fillRect(px - 4, py - 16 + bob, 8, 4);
        }

        if (entity.name === 'Mr Flash' || entity.profile.chin === 'big') {
          // Mr Flash: bright yellow style + pronounced chin.
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(px - 6, py - 25 + bob, 12, 3);
          ctx.fillStyle = '#d9a066';
          ctx.fillRect(px - 4, py - 18 + bob, 8, 3);
        }

        if (entity.name === 'Ms Take') {
          // Ms Take: plain, dull blue dress silhouette.
          ctx.fillStyle = '#3a5fa0';
          ctx.fillRect(px - 8, py - 10 + bob, 16, 6);
        }

        if (entity.name === 'Dr Beaker' || attire === 'scienceCoat') {
          // Science teacher: bald, heavier build, white overcoat.
          ctx.fillStyle = '#ffe0bd';
          ctx.fillRect(px - 5, py - 24 + bob, 10, 2);
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(px - 10, py - 20 + bob, 20, 14);
        }

        if (entity.name === 'Mr Creak' || entity.profile.cane) {
          // History teacher: older brown look with walking stick/cane.
          ctx.fillStyle = '#7f5539';
          ctx.fillRect(px - 9, py - 22 + bob, 18, 15);
          ctx.fillStyle = '#5b3a29';
          const caneReach = isPunching ? 6 : 0;
          const stickX = entity.facing >= 0 ? px + 11 + caneReach : px - 13 - caneReach;
          ctx.fillRect(stickX, py - 16 + bob, 2, 14);
        }
      }
    }

    // Mood marker remains concise and readable.
    if (!knocked) {
      ctx.fillStyle = PALETTE.chalk;
      ctx.font = '10px monospace';
      const moodGlyph = entity.mood === 'angry' ? '!' : entity.mood === 'furious' ? '*' : '.';
      ctx.fillText(moodGlyph, px - 2, py - 26);
    }

    if (entity.carryingTrash) {
      ctx.fillStyle = '#f4a261';
      ctx.fillRect(px + 8, py - 14, 4, 4);
    }

    // Each person gets mini vitals bars (energy + bladder) like Eric.
    const barW = 18;
    const barX = px - barW / 2;
    ctx.fillStyle = '#1c2439';
    ctx.fillRect(barX, py - 37, barW, 2);
    ctx.fillRect(barX, py - 33, barW, 2);
    ctx.fillStyle = '#f6bd60';
    ctx.fillRect(barX, py - 37, (barW * entity.energy) / 100, 2);
    ctx.fillStyle = '#4cc9f0';
    ctx.fillRect(barX, py - 33, (barW * entity.bladder) / 100, 2);

    const shouldDrawName = entity.role === 'player' || game.showNpcNames;
    if (shouldDrawName) {
      ctx.fillStyle = PALETTE.chalk;
      ctx.font = 'bold 9px monospace';
      ctx.fillText(entity.name.toUpperCase(), px - 22, py - 29);
    }
  }

  for (const pellet of game.pellets) {
    ctx.fillStyle = pellet.kind === 'item' ? (pellet.itemColor || '#f28482') : '#f8f9fa';
    ctx.fillRect((pellet.x - CAMERA.x - 0.08) * sx, (pellet.y - CAMERA.y - 0.08) * sy, 3, 3);
  }
}

function drawMiniMap() {
  // Compact mini-map with objective locators for fast orientation.
  const mapW = 220;
  const mapH = 132;
  const mapX = canvas.width - mapW - 10;
  const mapY = 10;

  const scaleX = mapW / WORLD.w;
  const scaleY = mapH / WORLD.h;

  ctx.fillStyle = 'rgba(8,12,20,0.86)';
  ctx.fillRect(mapX, mapY, mapW, mapH);
  ctx.strokeStyle = '#89b2d9';
  ctx.strokeRect(mapX, mapY, mapW, mapH);

  // Render room blocks lightly so floors and spaces remain distinguishable.
  for (const room of rooms) {
    const rx = mapX + room.x * scaleX;
    const ry = mapY + room.y * scaleY;
    const rw = Math.max(1, room.w * scaleX);
    const rh = Math.max(1, room.h * scaleY);
    ctx.fillStyle = room.type === 'outdoor' ? 'rgba(88,173,102,0.65)' : room.type === 'corridor' ? 'rgba(116,151,210,0.65)' : 'rgba(219,200,168,0.65)';
    ctx.fillRect(rx, ry, rw, rh);
  }

  const current = schedule[game.periodIndex];
  const objectiveRoom = roomByName(current.room);

  // Objective locator: class target for the current period.
  if (objectiveRoom) {
    const ox = mapX + (objectiveRoom.x + objectiveRoom.w / 2) * scaleX;
    const oy = mapY + (objectiveRoom.y + objectiveRoom.h / 2) * scaleY;
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Objective locator: nearest uncollected shield.
  const missingShields = shields.filter((shield) => !shield.found);
  if (missingShields.length) {
    let nearestShield = missingShields[0];
    let nearestDist = distance(player, nearestShield);
    for (const shield of missingShields) {
      const d = distance(player, shield);
      if (d < nearestDist) {
        nearestDist = d;
        nearestShield = shield;
      }
    }
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(mapX + nearestShield.x * scaleX - 3, mapY + nearestShield.y * scaleY - 3, 6, 6);
  }

  // Urgent objective locator: toilets when bladder is high.
  if (game.bladder >= 70) {
    const toilets = roomByName('Toilets');
    if (toilets) {
      const tx = mapX + (toilets.x + toilets.w / 2) * scaleX;
      const ty = mapY + (toilets.y + toilets.h / 2) * scaleY;
      ctx.fillStyle = '#5eead4';
      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Player marker.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(mapX + player.x * scaleX, mapY + player.y * scaleY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d9ecff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('MINI MAP', mapX + 6, mapY + 12);
  ctx.font = '8px monospace';
  ctx.fillText('● Class  ■ Shield  ● Toilet  ○ You', mapX + 6, mapY + mapH - 6);
}

function drawStatusOverlay() {
  if (!game.paused) return;
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '30px sans-serif';
  ctx.fillText('PAUSED', canvas.width / 2 - 65, canvas.height / 2);
}


function updateNameToggleButton() {
  // Button label mirrors the current render mode so players can switch quickly.
  const showing = game.showNpcNames;
  toggleNamesBtn.textContent = `🏷️ Names: ${showing ? 'ON' : 'OFF'}`;
  toggleNamesBtn.title = showing
    ? 'Hide NPC name labels to make energy bars easier to read'
    : 'Show NPC name labels above students and teachers';
}

function getEntityScreenPosition(entity) {
  const sx = canvas.width / CAMERA.w;
  const sy = canvas.height / CAMERA.h;
  return {
    x: Math.floor((entity.x - CAMERA.x) * sx),
    y: Math.floor((entity.y - CAMERA.y) * sy),
  };
}

function findHoveredEntityAtScreen(mouseX, mouseY) {
  const current = schedule[game.periodIndex];
  // Reverse order makes overlapping hover match what is visually on top.
  for (let i = game.entities.length - 1; i >= 0; i -= 1) {
    const entity = game.entities[i];
    if (!hasArrivedForCurrentPeriod(entity, current)) continue;
    const pos = getEntityScreenPosition(entity);
    const halfW = 10;
    const height = 28;
    const withinX = mouseX >= pos.x - halfW && mouseX <= pos.x + halfW;
    const withinY = mouseY >= pos.y - height && mouseY <= pos.y + 6;
    if (withinX && withinY) return entity;
  }
  return null;
}

function hideEntityTooltip() {
  game.hoveredEntity = null;
  entityTooltipEl.hidden = true;
}

function updateEntityTooltip(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  const hovered = findHoveredEntityAtScreen(mouseX, mouseY);

  if (!hovered) {
    hideEntityTooltip();
    return;
  }

  game.hoveredEntity = hovered;
  const role = hovered.role === 'player' ? 'You' : hovered.role;
  const room = entityRoom(hovered);
  entityTooltipEl.innerHTML = `${hovered.name} (${role})<br>❤️ HP: ${Math.round(hovered.hp)} | ⚡ EN: ${Math.round(hovered.energy)}<br>🚻 Bladder: ${Math.round(hovered.bladder)}% | 📍 ${room}`;

  // Keep tooltip inside the canvas-wrap bounds for legibility.
  const wrap = canvas.parentElement.getBoundingClientRect();
  const left = Math.min(mouseX + 16, wrap.width - 190);
  const top = Math.max(8, mouseY - 56);
  entityTooltipEl.style.left = `${left}px`;
  entityTooltipEl.style.top = `${top}px`;
  entityTooltipEl.hidden = false;
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
      if (!hasArrivedForCurrentPeriod(entity)) continue;
      const moveMagnitude = Math.abs(entity.vx) + Math.abs(entity.vy);
      // Keep walk cycle readable: slightly slower leg animation while movement speed is higher.
      entity.animPhase += dt * (0.004 + moveMagnitude * 0.0065);
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
  drawMiniMap();
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

toggleNamesBtn.onclick = () => {
  game.showNpcNames = !game.showNpcNames;
  updateNameToggleButton();
};

canvas.addEventListener('mousemove', updateEntityTooltip);
canvas.addEventListener('mouseleave', hideEntityTooltip);

announce('Welcome! Follow bells, survive staff, and uncover every shield letter.');
updateMission();
updateAutoStatus();
updateBladderHud();
updateTodo();
updateNameToggleButton();
requestAnimationFrame(loop);

// Lightweight debug hooks help automated validation without changing gameplay UI.
window.__skoolDazeDebug = {
  getState: () => ({
    time: game.timeMinutes,
    period: schedule[game.periodIndex].period,
    targetRoom: schedule[game.periodIndex].room,
    playerRoom: entityRoom(player),
    playerSeated: player.isSeated,
    lines: game.lines,
  }),
  setTimeScale: (value) => {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      game.timeScale = value;
    }
  },
  setAutoMode: (enabled) => {
    game.autoMode = Boolean(enabled);
    game.idleMs = 0;
    updateAutoStatus();
  },
};
