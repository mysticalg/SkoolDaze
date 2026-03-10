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
// 64x35 tile-like coordinate space. We render everything in this local unit
// space so simulation and drawing can scale cleanly with canvas size.
const WORLD = { w: 64, h: 35 };

const rooms = [
  { name: 'Upper Left', x: 2, y: 2, w: 18, h: 8, floor: 'upper' },
  { name: 'Upper Middle', x: 23, y: 2, w: 18, h: 8, floor: 'upper' },
  { name: 'Upper Right Lab', x: 44, y: 2, w: 18, h: 8, floor: 'upper' },
  { name: 'Lower Hall', x: 2, y: 12, w: 22, h: 9, floor: 'lower' },
  { name: 'Library', x: 27, y: 12, w: 14, h: 9, floor: 'lower' },
  { name: 'Staff Room', x: 44, y: 12, w: 18, h: 9, floor: 'lower' },
  { name: 'Playground', x: 1, y: 24, w: 62, h: 10, floor: 'ground' },
];

const stairs = [
  { x: 20, y: 10, toY: 12, label: 'West Stairs' },
  { x: 43, y: 10, toY: 12, label: 'East Stairs' },
];

const blackboards = [
  { room: 'Upper Left', x: 10, y: 3, text: '' },
  { room: 'Upper Middle', x: 32, y: 3, text: '' },
  { room: 'Upper Right Lab', x: 53, y: 3, text: '' },
  { room: 'Lower Hall', x: 12, y: 13, text: '' },
  { room: 'Library', x: 34, y: 13, text: '' },
];

const shields = [
  { x: 7, y: 4, letter: 'D', found: false },
  { x: 31, y: 4, letter: 'A', found: false },
  { x: 55, y: 4, letter: 'Z', found: false },
  { x: 17, y: 14, letter: 'E', found: false },
  { x: 34, y: 14, letter: 'S', found: false },
  { x: 58, y: 14, letter: 'K', found: false },
];

// Bell schedule approximating school-day flow.
const schedule = [
  { period: 'Registration', room: 'Lower Hall', mins: 10 },
  { period: 'Math', room: 'Upper Left', mins: 18 },
  { period: 'English', room: 'Upper Middle', mins: 18 },
  { period: 'Science', room: 'Upper Right Lab', mins: 18 },
  { period: 'Break', room: 'Playground', mins: 10 },
  { period: 'History', room: 'Upper Left', mins: 15 },
  { period: 'Library Study', room: 'Library', mins: 14 },
  { period: 'Assembly', room: 'Lower Hall', mins: 12 },
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
  player: { speed: 1.22, aggression: 0, diligence: 0, focus: 0 },
};

const game = {
  timeMinutes: 8 * 60,
  timeScale: 0.085,
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

const player = mkEntity('Eric', 'player', 3, 26, '#ffe04d', {
  title: 'Troublemaker with potential',
  prefers: ['Playground'],
  quotes: ['Not me, sir!', 'I was only looking!'],
});

game.entities.push(
  player,
  mkEntity('Mr Wacker', 'teacher', 10, 14, '#8eb2ff', { title: 'Headmaster', strict: 0.9 }),
  mkEntity('Ms Take', 'teacher', 50, 14, '#82a4ff', { title: 'Science Teacher', strict: 0.8 }),
  mkEntity('Mr Creak', 'teacher', 30, 14, '#7e9aff', { title: 'History Teacher', strict: 0.7 }),
  mkEntity('Angelface', 'hero', 5, 26, '#ffd58e', { title: 'Handsome kid' }),
  mkEntity('Einstein', 'swot', 9, 26, '#8effd3', { title: 'Teacher pet', tattles: true }),
  mkEntity('Bully Boy', 'bully', 13, 26, '#ff5f88', { title: 'Playground terror' }),
  mkEntity('Boy Wander', 'weird', 16, 26, '#c58eff', { title: 'Chaotic drifter' }),
  mkEntity('Slugger', 'bully', 20, 27, '#ff7ca0', { title: 'Fighter' }),
  mkEntity('Precious', 'hero', 24, 27, '#ffe6ae', { title: 'Narcissist' }),
  mkEntity('Nerdy Ned', 'swot', 28, 27, '#78ffcf', { title: 'Homework machine', tattles: true }),
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

function recoverEnergy(dt) {
  game.energy = Math.min(100, game.energy + dt * 0.0025);
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
  if (Math.abs(player.vx) + Math.abs(player.vy) > 0.1) spendEnergy(0.012 * dt);

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
    entity.vx = (dx / len) * entity.personality.speed * 0.42;
    entity.vy = (dy / len) * entity.personality.speed * 0.42;

    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;
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
    pellet.x += pellet.vx * dt * 3;
    pellet.y += pellet.vy * dt * 3;
    pellet.vy += 0.003 * dt;

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
  game.periodElapsed += dt * game.timeScale;
  game.timeMinutes += dt * game.timeScale;

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
function worldToScreen(x, y) {
  return { sx: (x / WORLD.w) * canvas.width, sy: (y / WORLD.h) * canvas.height };
}

function drawWorld() {
  ctx.fillStyle = '#1f2b44';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sx = canvas.width / WORLD.w;
  const sy = canvas.height / WORLD.h;

  // Room blocks and labels.
  for (const room of rooms) {
    ctx.fillStyle = room.name === 'Playground' ? '#385130' : '#27354f';
    ctx.fillRect(room.x * sx, room.y * sy, room.w * sx, room.h * sy);
    ctx.strokeStyle = '#8898ba';
    ctx.strokeRect(room.x * sx, room.y * sy, room.w * sx, room.h * sy);

    ctx.fillStyle = '#e3efff';
    ctx.font = '12px monospace';
    ctx.fillText(room.name, (room.x + 0.6) * sx, (room.y + 1) * sy);
  }

  // Stair markers for school structure detail.
  for (const stair of stairs) {
    const pos = worldToScreen(stair.x, stair.y);
    ctx.fillStyle = '#7aa4d1';
    ctx.fillRect(pos.sx - 8, pos.sy - 6, 16, 12);
    ctx.fillStyle = '#f4fbff';
    ctx.font = '9px monospace';
    ctx.fillText('STAIR', pos.sx - 12, pos.sy - 8);
  }

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
  const sx = canvas.width / WORLD.w;
  const sy = canvas.height / WORLD.h;

  for (const entity of game.entities) {
    const knocked = entity.knockedUntil > performance.now();
    ctx.fillStyle = knocked ? '#666' : entity.role === 'player' ? '#ffe04d' : entity.color;

    const h = knocked ? 0.35 : 1.2;
    ctx.fillRect((entity.x - 0.35) * sx, (entity.y - h) * sy, 0.7 * sx, h * sy);

    // Mood marker for AI readability.
    if (!knocked) {
      ctx.fillStyle = '#fff';
      ctx.font = '9px monospace';
      const moodGlyph = entity.mood === 'angry' ? '😠' : entity.mood === 'furious' ? '💢' : '🙂';
      ctx.fillText(moodGlyph, (entity.x - 0.2) * sx, (entity.y - 1.3) * sy);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '9px monospace';
    ctx.fillText(entity.name, (entity.x - 1) * sx, (entity.y - 1.55) * sy);
  }

  // Catapult pellets.
  ctx.fillStyle = '#f0f0f0';
  for (const pellet of game.pellets) {
    ctx.fillRect((pellet.x - 0.08) * sx, (pellet.y - 0.08) * sy, 0.16 * sx, 0.16 * sy);
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

    player.x += player.vx * dt * 0.02;
    player.y += player.vy * dt * 0.02;
    constrain(player);

    updateAI(dt);
    updatePellets(dt);
    updateSchedule(dt);
    recoverEnergy(dt);
  }

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
