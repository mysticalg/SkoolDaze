const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const clockEl = document.getElementById('clock');
const periodEl = document.getElementById('period');
const roomTargetEl = document.getElementById('roomTarget');
const troubleEl = document.getElementById('trouble');
const energyEl = document.getElementById('energy');
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
const WORLD = { w: 120, h: 78 };

// Camera view keeps the same aspect ratio as the canvas while following Eric.
const CAMERA = { w: 64, h: 35, x: 0, y: 0 };

const rooms = [
  // Upper level classrooms + corridor.
  { name: 'Upper Corridor', x: 5, y: 12, w: 110, h: 4, floor: 'upper', type: 'corridor' },
  { name: 'Upper Left', x: 8, y: 4, w: 23, h: 8, floor: 'upper', type: 'classroom' },
  { name: 'Upper Middle', x: 37, y: 4, w: 23, h: 8, floor: 'upper', type: 'classroom' },
  { name: 'Upper Right Lab', x: 66, y: 4, w: 23, h: 8, floor: 'upper', type: 'classroom' },
  { name: 'Art Room', x: 95, y: 4, w: 18, h: 8, floor: 'upper', type: 'classroom' },

  // Middle level corridors and rooms.
  { name: 'Middle Corridor', x: 5, y: 35, w: 110, h: 4, floor: 'middle', type: 'corridor' },
  { name: 'Lower Hall', x: 8, y: 26, w: 28, h: 9, floor: 'middle', type: 'hall' },
  { name: 'Library', x: 41, y: 26, w: 22, h: 9, floor: 'middle', type: 'classroom' },
  { name: 'Staff Room', x: 68, y: 26, w: 22, h: 9, floor: 'middle', type: 'classroom' },
  { name: 'Music Room', x: 95, y: 26, w: 18, h: 9, floor: 'middle', type: 'classroom' },

  // Ground level circulation and outside area.
  { name: 'Ground Corridor', x: 5, y: 56, w: 110, h: 4, floor: 'ground', type: 'corridor' },
  { name: 'Canteen', x: 8, y: 60, w: 28, h: 8, floor: 'ground', type: 'hall' },
  { name: 'Assembly Hall', x: 41, y: 60, w: 32, h: 8, floor: 'ground', type: 'hall' },
  { name: 'Playground', x: 78, y: 60, w: 35, h: 14, floor: 'ground', type: 'outdoor' },
];

const stairs = [
  { x: 20, y: 14, toY: 37, label: 'West Stairs' },
  { x: 57, y: 14, toY: 37, label: 'Central Stairs' },
  { x: 95, y: 14, toY: 37, label: 'East Stairs' },
  { x: 20, y: 37, toY: 58, label: 'West Stairs' },
  { x: 57, y: 37, toY: 58, label: 'Central Stairs' },
  { x: 95, y: 37, toY: 58, label: 'East Stairs' },
];

const blackboards = [
  { room: 'Upper Left', x: 20, y: 5, text: '' },
  { room: 'Upper Middle', x: 49, y: 5, text: '' },
  { room: 'Upper Right Lab', x: 78, y: 5, text: '' },
  { room: 'Lower Hall', x: 22, y: 27, text: '' },
  { room: 'Library', x: 52, y: 27, text: '' },
  { room: 'Assembly Hall', x: 57, y: 61, text: '' },
];

const shields = [
  { x: 13, y: 6, letter: 'D', found: false },
  { x: 49, y: 6, letter: 'A', found: false },
  { x: 84, y: 6, letter: 'Z', found: false },
  { x: 18, y: 28, letter: 'E', found: false },
  { x: 57, y: 28, letter: 'S', found: false },
  { x: 103, y: 63, letter: 'K', found: false },
];

// Bell schedule approximating school-day flow.
const schedule = [
  { period: 'Registration', room: 'Assembly Hall', mins: 10 },
  { period: 'Math', room: 'Upper Left', mins: 18 },
  { period: 'English', room: 'Upper Middle', mins: 18 },
  { period: 'Science', room: 'Upper Right Lab', mins: 18 },
  { period: 'Break', room: 'Playground', mins: 10 },
  { period: 'History', room: 'Upper Left', mins: 15 },
  { period: 'Library Study', room: 'Library', mins: 14 },
  { period: 'Assembly', room: 'Assembly Hall', mins: 12 },
];

const lessonTasks = [
  'Write 10x: I must not fire catapults.',
  'Solve: 6 * 7 = ?',
  'Spell: DISCIPLINE',
  'Copy: The bell waits for no one.',
  'Name one planet in our solar system.',
  'Write 5x: Silence in class.',
];

const personalities = {
  bully: { speed: 1.05, aggression: 0.72, diligence: 0.2, focus: 0.5 },
  swot: { speed: 0.92, aggression: 0.04, diligence: 0.96, focus: 0.9 },
  hero: { speed: 1.0, aggression: 0.2, diligence: 0.75, focus: 0.7 },
  weird: { speed: 1.08, aggression: 0.35, diligence: 0.45, focus: 0.4 },
  teacher: { speed: 0.88, aggression: 0.55, diligence: 1.0, focus: 1.0 },
  player: { speed: 0.82, aggression: 0, diligence: 0, focus: 0 },
};

const game = {
  timeMinutes: 8 * 60,
  // Minutes advanced per real-time second to slow bell pacing.
  timeScale: 0.16,
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
};

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
  };
}

const player = mkEntity('Eric', 'player', 48, 64, '#ffe04d', {
  title: 'Troublemaker with potential',
  prefers: ['Playground'],
  quotes: ['Not me, sir!', 'I was only looking!'],
});

game.entities.push(
  player,
  mkEntity('Mr Wacker', 'teacher', 22, 29, '#8eb2ff', { title: 'Headmaster', strict: 0.9 }),
  mkEntity('Ms Take', 'teacher', 75, 29, '#82a4ff', { title: 'Science Teacher', strict: 0.8 }),
  mkEntity('Mr Creak', 'teacher', 56, 63, '#7e9aff', { title: 'History Teacher', strict: 0.7 }),
  mkEntity('Angelface', 'hero', 82, 65, '#ffd58e', { title: 'Handsome kid' }),
  mkEntity('Einstein', 'swot', 86, 64, '#8effd3', { title: 'Teacher pet', tattles: true }),
  mkEntity('Bully Boy', 'bully', 90, 66, '#ff5f88', { title: 'Playground terror' }),
  mkEntity('Boy Wander', 'weird', 94, 65, '#c58eff', { title: 'Chaotic drifter' }),
  mkEntity('Slugger', 'bully', 98, 66, '#ff7ca0', { title: 'Fighter' }),
  mkEntity('Precious', 'hero', 102, 66, '#ffe6ae', { title: 'Narcissist' }),
  mkEntity('Nerdy Ned', 'swot', 106, 66, '#78ffcf', { title: 'Homework machine', tattles: true }),
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

  announce(`🔔 Bell! ${current.period} in ${current.room}`);
  periodEl.textContent = `🔔 Period: ${current.period}`;
  roomTargetEl.textContent = `📍 Target: ${current.room}`;
  updateTodo();
}
setPeriod(0);

// -----------------------------------------------------------------------------
// Player input and actions
// -----------------------------------------------------------------------------
function handleInput(dt) {
  const speed = (player.personality.speed * game.energy) / 100;
  player.vx = 0;
  player.vy = 0;

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

  if (entity.role === 'teacher') {
    return roomCenter(currentPeriod.room);
  }

  if (entity.role === 'swot' && game.rng() < 0.8) {
    return roomCenter(currentPeriod.room);
  }

  if (entity.role === 'bully' && game.rng() < 0.45) {
    return roomCenter('Playground');
  }

  if (entity.role === 'weird' && game.rng() < 0.45) {
    return roomCenter(game.rng() < 0.5 ? 'Staff Room' : 'Library');
  }

  return shouldAttend ? roomCenter(currentPeriod.room) : roomCenter('Playground');
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
    if (entity.role === 'teacher' && distance(entity, player) < 1.8 && entityRoom(player) !== current.room && current.period !== 'Break') {
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
    entity.vx = (dx / len) * entity.personality.speed * 3.2;
    entity.vy = (dy / len) * entity.personality.speed * 3.2;

    entity.x += entity.vx * (dt / 1000);
    entity.y += entity.vy * (dt / 1000);
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

  if (game.periodElapsed >= current.mins) setPeriod(game.periodIndex + 1);

  // Late checks are throttled to avoid line spam and keep simulation smooth.
  game.lastLateTick += dt;
  if (game.lastLateTick > 2000) {
    if (entityRoom(player) !== current.room && current.period !== 'Break') addLines(10, `late for ${current.period}`);
    game.lastLateTick = 0;
  }

  clockEl.textContent = `🕘 Time: ${formatTime(game.timeMinutes)}`;
  periodEl.textContent = `🔔 Period: ${current.period}`;
  roomTargetEl.textContent = `📍 Target: ${current.room}`;
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

function drawWorld() {
  ctx.fillStyle = '#1f2b44';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sx = canvas.width / CAMERA.w;
  const sy = canvas.height / CAMERA.h;

  // Room blocks and labels.
  for (const room of rooms) {
    const drawX = (room.x - CAMERA.x) * sx;
    const drawY = (room.y - CAMERA.y) * sy;
    ctx.fillStyle = room.type === 'outdoor' ? '#385130' : room.type === 'corridor' ? '#2a4463' : '#27354f';
    ctx.fillRect(drawX, drawY, room.w * sx, room.h * sy);
    ctx.strokeStyle = '#8898ba';
    ctx.strokeRect(drawX, drawY, room.w * sx, room.h * sy);

    ctx.fillStyle = '#e3efff';
    ctx.font = '12px monospace';
    ctx.fillText(room.name, drawX + 8, drawY + 12);
  }

  // Stair markers for school structure detail.
  for (const stair of stairs) {
    const pos = worldToScreen(stair.x, stair.y);
    ctx.fillStyle = '#7aa4d1';
    ctx.fillRect(pos.sx - 10, pos.sy - 7, 20, 14);
    ctx.fillStyle = '#f4fbff';
    ctx.font = '9px monospace';
    ctx.fillText('STAIR', pos.sx - 13, pos.sy - 9);
  }

  // Simple floor labels help users orient vertically while scrolling.
  ctx.fillStyle = '#cde3ff';
  ctx.font = '11px monospace';
  ctx.fillText('UPPER FLOOR', 10, 18);
  ctx.fillText('MIDDLE FLOOR', 10, 34);
  ctx.fillText('GROUND FLOOR', 10, 50);

  // Blackboard visuals and text snippets.
  for (const board of blackboards) {
    const p = worldToScreen(board.x, board.y);
    ctx.fillStyle = '#0f301f';
    ctx.fillRect(p.sx - 20, p.sy - 10, 40, 13);
    ctx.strokeStyle = '#4e735f';
    ctx.strokeRect(p.sx - 20, p.sy - 10, 40, 13);
    if (board.text) {
      ctx.fillStyle = '#ccffe6';
      ctx.font = '8px monospace';
      ctx.fillText(board.text.slice(0, 30), p.sx - 18, p.sy - 1);
    }
  }

  // Shield pickups.
  for (const shield of shields) {
    if (shield.found) continue;
    const p = worldToScreen(shield.x, shield.y);
    ctx.fillStyle = '#ffd75e';
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '10px monospace';
    ctx.fillText('?', p.sx - 3, p.sy + 3);
  }
}

function drawEntities() {
  const sx = canvas.width / CAMERA.w;
  const sy = canvas.height / CAMERA.h;

  for (const entity of game.entities) {
    const knocked = entity.knockedUntil > performance.now();
    ctx.fillStyle = knocked ? '#666' : entity.role === 'player' ? '#ffe04d' : entity.color;

    const h = knocked ? 0.35 : 1.2;
    ctx.fillRect((entity.x - CAMERA.x - 0.35) * sx, (entity.y - CAMERA.y - h) * sy, 0.7 * sx, h * sy);

    // Mood marker for AI readability.
    if (!knocked) {
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      const moodGlyph = entity.mood === 'angry' ? '😠' : entity.mood === 'furious' ? '💢' : '🙂';
      ctx.fillText(moodGlyph, (entity.x - CAMERA.x - 0.2) * sx, (entity.y - CAMERA.y - 1.3) * sy);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '9px monospace';
    ctx.fillText(entity.name, (entity.x - CAMERA.x - 1) * sx, (entity.y - CAMERA.y - 1.55) * sy);
  }

  // Catapult pellets.
  ctx.fillStyle = '#f0f0f0';
  for (const pellet of game.pellets) {
    ctx.fillRect((pellet.x - CAMERA.x - 0.08) * sx, (pellet.y - CAMERA.y - 0.08) * sy, 0.16 * sx, 0.16 * sy);
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

    player.x += player.vx * dt * 0.008;
    player.y += player.vy * dt * 0.008;
    constrain(player);

    updateAI(dt);
    updatePellets(dt);
    updateSchedule(dt);
    recoverEnergy(dt / 1000);
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
updateTodo();
requestAnimationFrame(loop);
