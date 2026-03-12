const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const clockEl = document.getElementById('clock');
const periodEl = document.getElementById('period');
const roomTargetEl = document.getElementById('roomTarget');
const dayLabelEl = document.getElementById('dayLabel');
const floorStatusEl = document.getElementById('floorStatus');
const clockHandHourEl = document.getElementById('clockHandHour');
const clockHandMinuteEl = document.getElementById('clockHandMinute');
const troubleEl = document.getElementById('trouble');
const energyEl = document.getElementById('energy');
const charismaEl = document.getElementById('charisma');
const bladderEl = document.getElementById('bladder');
const hygieneEl = document.getElementById('hygiene');
const autoStatusEl = document.getElementById('autoStatus');
const weatherEl = document.getElementById('weather');
const attendanceEl = document.getElementById('attendance');
const missionEl = document.getElementById('mission');
const eventsEl = document.getElementById('events');
const llmDebugLogEl = document.getElementById('llmDebugLog');
const llmDebugClearBtn = document.getElementById('llmDebugClearBtn');
const todoEl = document.getElementById('todo');
const todoCarouselBtn = document.getElementById('todoCarousel');
const todoCarouselTextEl = document.getElementById('todoCarouselText');
const todoDialog = document.getElementById('todoDialog');
const closeTodoDialogBtn = document.getElementById('closeTodoDialog');

const helpDialog = document.getElementById('helpDialog');
const helpBtn = document.getElementById('helpBtn');
const pauseBtn = document.getElementById('pauseBtn');
const toggleNamesBtn = document.getElementById('toggleNamesBtn');
const entityTooltipEl = document.getElementById('entityTooltip');
const interactionPanelEl = document.getElementById('interactionPanel');
const interactionTitleEl = document.getElementById('interactionTitle');
const interactionMetaEl = document.getElementById('interactionMeta');
const interactionOptionsEl = document.getElementById('interactionOptions');
const closeInteractionPanelBtn = document.getElementById('closeInteractionPanel');
const classQuestionPanelEl = document.getElementById('classQuestionPanel');
const classQuestionTitleEl = document.getElementById('classQuestionTitle');
const classQuestionCountdownEl = document.getElementById('classQuestionCountdown');
const classQuestionPromptEl = document.getElementById('classQuestionPrompt');
const classQuestionChoicesEl = document.getElementById('classQuestionChoices');
const filterActionsEl = document.getElementById('filterActions');
const filterSpeechEl = document.getElementById('filterSpeech');
const filterThoughtsEl = document.getElementById('filterThoughts');
const filterWorldEl = document.getElementById('filterWorld');
const startOverlayEl = document.getElementById('startOverlay');
const startGameBtn = document.getElementById('startGameBtn');
const optStudentCountEl = document.getElementById('optStudentCount');
const optTeacherCountEl = document.getElementById('optTeacherCount');
const optRatioBullyEl = document.getElementById('optRatioBully');
const optRatioHeroEl = document.getElementById('optRatioHero');
const optRatioSwotEl = document.getElementById('optRatioSwot');
const optRatioWeirdEl = document.getElementById('optRatioWeird');
const optGameSpeedEl = document.getElementById('optGameSpeed');
const optWeatherEl = document.getElementById('optWeather');
const optLlmEnabledEl = document.getElementById('optLlmEnabled');
const optLlmNsfwEl = document.getElementById('optLlmNsfw');
const optLlmNoFallbackEl = document.getElementById('optLlmNoFallback');
const optLlmSourceEl = document.getElementById('optLlmSource');
const optLlmModelEl = document.getElementById('optLlmModel');
const optLlmLocalEndpointEl = document.getElementById('optLlmLocalEndpoint');
const optLlmManualModelEl = document.getElementById('optLlmManualModel');
const optLlmRemoteProviderEl = document.getElementById('optLlmRemoteProvider');
const optLlmRemoteModelEl = document.getElementById('optLlmRemoteModel');
const optLlmRemoteTokenEl = document.getElementById('optLlmRemoteToken');
const optLlmRefreshModelsEl = document.getElementById('optLlmRefreshModels');
const optLlmImportModelsEl = document.getElementById('optLlmImportModels');
const optLlmOpenAiAuthEl = document.getElementById('optLlmOpenAiAuth');
const optLlmClearTokenEl = document.getElementById('optLlmClearToken');
const optLlmTokenStatusEl = document.getElementById('optLlmTokenStatus');
const optLlmStatusEl = document.getElementById('optLlmStatus');
document.getElementById('closeHelp').onclick = () => helpDialog.close();
helpBtn.onclick = () => helpDialog.showModal();

// Daily objective carousel opens a full checklist dialog for detailed planning.
if (todoCarouselBtn && todoDialog) {
  todoCarouselBtn.onclick = () => todoDialog.showModal();
}
if (closeTodoDialogBtn && todoDialog) {
  closeTodoDialogBtn.onclick = () => todoDialog.close();
}

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
  // Reception-adjacent support spaces now sit in one contiguous block for easier wayfinding.
  { name: 'Toilets', x: 34, y: 66, w: 20, h: 10, floor: 'ground', type: 'hall' },
  { name: 'Janitor Room', x: 56, y: 66, w: 12, h: 10, floor: 'ground', type: 'hall' },
  // Taller + wider hall improves assembly spacing and row alignment readability.
  { name: 'Assembly Hall', x: 68, y: 58, w: 30, h: 18, floor: 'ground', type: 'hall' },
  // Dining hall sits beside assembly for fast lunchtime flow.
  { name: 'Dining Hall', x: 100, y: 62, w: 36, h: 14, floor: 'ground', type: 'hall' },
  { name: 'Geography', x: 8, y: 80, w: 24, h: 14, floor: 'ground', type: 'classroom' },
  { name: 'Art Room', x: 34, y: 80, w: 24, h: 14, floor: 'ground', type: 'classroom' },
  { name: 'History', x: 60, y: 80, w: 24, h: 14, floor: 'ground', type: 'classroom' },
  // Kitchen is attached to dining hall and still next to assembly for intuitive wayfinding.
  { name: 'Kitchen', x: 138, y: 62, w: 12, h: 14, floor: 'ground', type: 'hall' },
  { name: 'P.E. Field', x: 90, y: 80, w: 70, h: 28, floor: 'ground', type: 'outdoor' },
  { name: 'Bike Sheds', x: 92, y: 94, w: 22, h: 12, floor: 'ground', type: 'outdoor' },
  { name: 'School Gates', x: 148, y: 80, w: 18, h: 28, floor: 'ground', type: 'outdoor' },

  // Lower floor (bottom floor) with reception-adjacent spaces.
  { name: 'Lower Corridor', x: 4, y: 110, w: 160, h: 4, floor: 'lower', type: 'corridor' },
  { name: 'Boiler Room', x: 8, y: 114, w: 24, h: 14, floor: 'lower', type: 'hall' },
  { name: 'Storage', x: 38, y: 114, w: 24, h: 14, floor: 'lower', type: 'hall' },
  { name: 'Maintenance', x: 68, y: 114, w: 24, h: 14, floor: 'lower', type: 'hall' },
  { name: 'Medical Bay', x: 94, y: 114, w: 30, h: 14, floor: 'lower', type: 'hall' },
  { name: 'Debate Room', x: 126, y: 114, w: 18, h: 14, floor: 'lower', type: 'classroom' },
  { name: 'Design Studio', x: 146, y: 114, w: 18, h: 14, floor: 'lower', type: 'classroom' },
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
  // Extra route: directly links lower + middle floors to keep navigation flexible.
  { x: 84, fromFloor: 'middle', toFloor: 'lower', fromY: 52, toY: 112, label: 'Service Stairs' },
];

// Wider staircase lanes reduce jams so multiple pupils can stream through at once.
const STAIR_ENTRY_HALF_WIDTH = 1.95;
const STAIR_ENTRY_HALF_HEIGHT = 1.5;
const STAIR_INTERACT_RADIUS = 2.2;


// Dining hall service points + seating grid keep lunch flow deterministic and readable.
function diningHallLayout() {
  const hall = roomByName('Dining Hall');
  if (!hall) return null;

  const plateStand = { x: hall.x + 3.2, y: hall.y + 2.3 };
  const servingPoint = { x: hall.x + 8.6, y: hall.y + 2.4 };
  const queueStart = { x: hall.x + 13.3, y: hall.y + 2.5 };
  const queueSpacing = 1.55;
  const queueSlots = Array.from({ length: 8 }, (_, idx) => ({
    x: queueStart.x + (idx * queueSpacing),
    y: queueStart.y,
  }));

  const seats = [];
  const tableCols = [hall.x + 9.5, hall.x + 17.5, hall.x + 25.5, hall.x + 33.5];
  const tableRows = [hall.y + 6.1, hall.y + 10.0];
  for (const rowY of tableRows) {
    for (const colX of tableCols) {
      seats.push({ x: colX - 1.2, y: rowY, tableX: colX, tableY: rowY, side: 'left' });
      seats.push({ x: colX + 1.2, y: rowY, tableX: colX, tableY: rowY, side: 'right' });
    }
  }

  const patrolRoute = [
    { x: hall.x + 6, y: hall.y + hall.h - 2.3 },
    { x: hall.x + hall.w - 3, y: hall.y + hall.h - 2.2 },
    { x: hall.x + hall.w - 4.5, y: hall.y + 4.6 },
    { x: hall.x + 8.3, y: hall.y + 4.8 },
  ];

  return {
    hall,
    plateStand,
    servingPoint,
    queueSlots,
    serviceDurationMs: 2000,
    seats,
    patrolRoute,
  };
}

function resetLunchState(entity) {
  if (!entity) return;
  entity.lunchState = 'idle';
  entity.hasLunchPlate = false;
  entity.queuedForLunch = false;
  entity.lunchQueueIndex = -1;
  entity.lunchServedAt = 0;
  entity.lunchSeatIndex = -1;
  entity.lunchEatUntil = 0;
}

// Lightweight synth SFX keeps interactions responsive without external assets.
const sfxState = { ctx: null, enabled: true };

const doorTransitionDepth = 1.15;

// All enclosed rooms get explicit doors so both player and NPCs can traverse by interaction.
function corridorForFloor(floor) {
  return rooms.find((room) => room.type === 'corridor' && room.floor === floor) || null;
}

const roomDoors = rooms
  .filter((room) => room.type !== 'corridor' && room.type !== 'outdoor')
  .map((room) => {
    const corridorY = room.floor === 'upper' ? 17 : room.floor === 'middle' ? 52 : room.floor === 'ground' ? 78 : 112;
    const topDist = Math.abs(room.y - corridorY);
    const bottomDist = Math.abs((room.y + room.h) - corridorY);
    const corridorAtTop = topDist <= bottomDist;
    const floorCorridor = corridorForFloor(room.floor);
    const corridorMinX = floorCorridor ? floorCorridor.x + 0.75 : 1;
    const corridorMaxX = floorCorridor ? (floorCorridor.x + floorCorridor.w - 0.75) : (WORLD.w - 1);
    const doorwayX = Math.max(corridorMinX, Math.min(corridorMaxX, room.x + room.w / 2));
    return {
      room: room.name,
      floor: room.floor,
      // Door x is clamped to the corridor span to prevent NPCs being dropped in blue void areas.
      x: doorwayX,
      y: corridorAtTop ? room.y : room.y + room.h,
      interiorY: corridorAtTop ? room.y + doorTransitionDepth : room.y + room.h - doorTransitionDepth,
      exteriorY: corridorAtTop ? room.y - 0.55 : room.y + room.h + 0.55,
      icon: '🚪',
    };
  });

// Lockers are split to corridor ends so stair landings remain clear for traffic.
const lockerBanks = [
  { label: 'Upper West Lockers', floor: 'upper', room: 'Upper Corridor', x: 7, y: 17, capacity: 9, columns: 5 },
  { label: 'Upper East Lockers', floor: 'upper', room: 'Upper Corridor', x: 151, y: 17, capacity: 9, columns: 5 },
  { label: 'Middle West Lockers', floor: 'middle', room: 'Middle Corridor', x: 7, y: 52, capacity: 11, columns: 5 },
  { label: 'Middle East Lockers', floor: 'middle', room: 'Middle Corridor', x: 151, y: 52, capacity: 11, columns: 5 },
  { label: 'Ground West Lockers', floor: 'ground', room: 'Ground Corridor', x: 7, y: 78, capacity: 13, columns: 5 },
  { label: 'Ground East Lockers', floor: 'ground', room: 'Ground Corridor', x: 151, y: 78, capacity: 13, columns: 5 },
  { label: 'Lower West Lockers', floor: 'lower', room: 'Lower Corridor', x: 7, y: 112, capacity: 10, columns: 5 },
  { label: 'Lower East Lockers', floor: 'lower', room: 'Lower Corridor', x: 151, y: 112, capacity: 10, columns: 5 },
];

const lockers = [];

const blackboards = [
  { room: 'Science Lab', x: 21, y: 6, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'Upper Common', x: 50, y: 6, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'Physics Lab', x: 80, y: 6, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'Chem Prep', x: 108, y: 6, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'Maths', x: 23, y: 40, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'English', x: 56, y: 40, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'Music Room', x: 116, y: 40, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'Computer Room', x: 144, y: 6, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'Geography', x: 18, y: 83, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'Art Room', x: 46, y: 83, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'History', x: 74, y: 83, text: '', revealChars: 0, revealSpeed: 36, lastSfxAt: 0 },
  { room: 'Headmaster Office', x: 164, y: 40, text: 'DISCIPLINE', revealChars: 10, revealSpeed: 36, lastSfxAt: 0 },
];

// Blackboard card metrics are shared so text wrapping and board size stay in sync.
const BOARD_DRAW = {
  width: 88,
  height: 32,
  lineHeight: 8,
  maxLines: 4,
  maxCharsPerLine: 22,
};

// Rich subject question bank gives each lesson many possible prompts.
const SUBJECT_QUESTION_SEEDS = {
  Maths: [
    { prompt: 'What is {a} + {b}?', answer: ({ a, b }) => String(a + b), wrong: ({ a, b }) => [String(a + b + 1), String(a + b - 1), String(a + b + 2)] },
    { prompt: 'What is {a} × {b}?', answer: ({ a, b }) => String(a * b), wrong: ({ a, b }) => [String((a * b) + a), String((a * b) - b), String((a * b) + 2)] },
    { prompt: 'What is {a} - {b}?', answer: ({ a, b }) => String(a - b), wrong: ({ a, b }) => [String(a + b), String((a - b) + 2), String((a - b) - 2)] },
  ],
  English: [
    { prompt: 'Which word is a noun: {noun}, quickly, or beautifully?', answer: ({ a }) => a, wrong: () => ['quickly', 'beautifully', 'running'] },
    { prompt: 'Pick the adjective: red, sprint, or calmly?', answer: () => 'red', wrong: () => ['sprint', 'calmly', 'ignore'] },
    { prompt: 'Which punctuation ends a question?', answer: () => '?', wrong: () => ['.', ',', '!'] },
  ],
  Science: [
    { prompt: 'Water freezes at what °C?', answer: () => '0', wrong: () => ['10', '-10', '100'] },
    { prompt: 'Which gas do plants absorb?', answer: () => 'carbon dioxide', wrong: () => ['oxygen', 'helium', 'nitrogen'] },
    { prompt: 'Which planet is known as the red planet?', answer: () => 'mars', wrong: () => ['venus', 'jupiter', 'mercury'] },
  ],
  History: [
    { prompt: 'Which came first: Bronze Age or Iron Age?', answer: () => 'bronze age', wrong: () => ['iron age', 'stone age', 'roman age'] },
    { prompt: 'A decade is how many years?', answer: () => '10', wrong: () => ['5', '12', '20'] },
    { prompt: 'Who built Roman roads in Britain?', answer: () => 'romans', wrong: () => ['vikings', 'normans', 'tudors'] },
  ],
  Geography: [
    { prompt: 'What is the largest ocean?', answer: () => 'pacific', wrong: () => ['atlantic', 'indian', 'arctic'] },
    { prompt: 'A map uses which direction at the top?', answer: () => 'north', wrong: () => ['south', 'east', 'west'] },
    { prompt: 'Which is a continent: Sahara or Europe?', answer: () => 'europe', wrong: () => ['sahara', 'amazon', 'nile'] },
  ],
  Computing: [
    { prompt: 'Binary uses which two digits?', answer: () => '0 and 1', wrong: () => ['1 and 2', '2 and 3', '0 and 2'] },
    { prompt: 'CPU stands for?', answer: () => 'central processing unit', wrong: () => ['computer power utility', 'core program unit', 'central program utility'] },
    { prompt: 'Which is an input device: keyboard or monitor?', answer: () => 'keyboard', wrong: () => ['monitor', 'speaker', 'projector'] },
  ],
};

const SUBJECT_WORD_BANK = {
  nouns: ['book', 'school', 'planet', 'teacher', 'science', 'library', 'computer', 'volcano', 'history', 'river'],
};

function roomSubjectName(roomName = '') {
  if (roomName === 'Maths') return 'Maths';
  if (roomName === 'English') return 'English';
  if (roomName === 'Science Lab' || roomName === 'Physics Lab' || roomName === 'Chem Prep') return 'Science';
  if (roomName === 'History') return 'History';
  if (roomName === 'Geography') return 'Geography';
  if (roomName === 'Computer Room') return 'Computing';
  return 'General';
}

// Build hundreds of unique class questions from subject templates each day.
function buildSubjectQuestionBank() {
  const bank = {};
  const nounWords = SUBJECT_WORD_BANK.nouns;
  const allSubjects = ['Maths', 'English', 'Science', 'History', 'Geography', 'Computing', 'General'];
  for (const subject of allSubjects) {
    const templates = SUBJECT_QUESTION_SEEDS[subject] || SUBJECT_QUESTION_SEEDS.Maths;
    bank[subject] = [];
    for (let i = 0; i < 180; i += 1) {
      const a = 2 + (i % 11);
      const b = 1 + ((i * 3) % 10);
      const noun = nounWords[i % nounWords.length];
      const template = templates[i % templates.length];
      const vars = { a, b, noun };
      const correct = String(template.answer(vars)).toLowerCase();
      const distractors = Array.from(new Set((template.wrong(vars) || []).map((choice) => String(choice).toLowerCase()).filter((choice) => choice !== correct))).slice(0, 3);
      while (distractors.length < 3) distractors.push(`${correct} ${distractors.length + 1}`);
      const choices = [correct, ...distractors].sort(() => Math.random() - 0.5);
      bank[subject].push({
        q: template.prompt.replaceAll('{a}', String(a)).replaceAll('{b}', String(b)).replaceAll('{noun}', noun),
        answer: correct,
        choices,
      });
    }
  }
  return bank;
}

const SUBJECT_QUESTION_BANK = buildSubjectQuestionBank();

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
  { x: 82, y: 74, label: 'Hall Bin' },
];

// Outdoor drinking fountains let pupils hydrate without buying from vending machines.
const waterFountains = [
  { x: 109, y: 86, label: 'Field Fountain' },
  { x: 151, y: 86, label: 'Gate Fountain' },
];

// Urinals are separate, explicit interaction points in toilets.
const urinals = [
  { x: 39, y: 69, label: 'West Urinal' },
  { x: 43, y: 69, label: 'Middle Urinal' },
  { x: 47, y: 69, label: 'East Urinal' },
];

// Gym showers fully restore hygiene and provide a social confidence/charisma boost.
const showers = [
  { x: 140, y: 42, label: 'Gym Shower A' },
  { x: 146, y: 42, label: 'Gym Shower B' },
  { x: 152, y: 42, label: 'Gym Shower C' },
];

const collectableSpawnPoints = [
  { x: 14, y: 8 }, { x: 28, y: 10 }, { x: 48, y: 9 }, { x: 74, y: 10 }, { x: 108, y: 10 },
  { x: 140, y: 10 }, { x: 17, y: 43 }, { x: 53, y: 44 }, { x: 80, y: 44 }, { x: 112, y: 45 },
  { x: 150, y: 45 }, { x: 12, y: 82 }, { x: 40, y: 90 }, { x: 66, y: 90 }, { x: 100, y: 92 },
  { x: 132, y: 92 }, { x: 154, y: 92 }, { x: 16, y: 117 }, { x: 44, y: 117 }, { x: 100, y: 118 },
];

const weatherModes = {
  sunny: { icon: '☀️', label: 'Sunny' },
  rain: { icon: '🌧️', label: 'Rain' },
  snow: { icon: '❄️', label: 'Snow' },
  windy: { icon: '💨', label: 'Windy' },
};

// Trees ring the outdoor grounds; they visibly sway in wind.
const trees = [
  { x: 88, y: 78 }, { x: 96, y: 78 }, { x: 104, y: 78 }, { x: 112, y: 78 },
  { x: 120, y: 78 }, { x: 128, y: 78 }, { x: 136, y: 78 }, { x: 144, y: 78 },
  { x: 86, y: 86 }, { x: 86, y: 94 }, { x: 86, y: 102 },
  { x: 162, y: 86 }, { x: 162, y: 94 }, { x: 162, y: 102 },
  { x: 92, y: 108 }, { x: 100, y: 108 }, { x: 108, y: 108 }, { x: 116, y: 108 },
  { x: 124, y: 108 }, { x: 132, y: 108 }, { x: 140, y: 108 }, { x: 148, y: 108 },
];

// Themed props provide flavour in rooms and can be used as throwables.
const classroomProps = [
  { room: 'Art Room', x: 38, y: 87, icon: 'A', color: '#ffd6a5', kind: 'artwork', throwable: true, hiddenUntil: 0 },
  { room: 'Art Room', x: 42, y: 89, icon: 'P', color: '#ff9f1c', kind: 'paint set', throwable: true, hiddenUntil: 0 },
  { room: 'Art Room', x: 50, y: 90, icon: 'B', color: '#2ec4b6', kind: 'paint brush', throwable: true, hiddenUntil: 0 },
  { room: 'Kitchen', x: 116, y: 69, icon: '🍲', color: '#ffd6a5', kind: 'stock pot', throwable: false, hiddenUntil: 0 },
  { room: 'Kitchen', x: 121, y: 72, icon: '🥄', color: '#ffe5b4', kind: 'serving spoon', throwable: false, hiddenUntil: 0 },
  { room: 'Dining Hall', x: 105, y: 69, icon: '🍽️', color: '#ffe8a1', kind: 'serving counter', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Dining Hall', x: 112, y: 72, icon: '🪑', color: '#f7d6bf', kind: 'dining bench', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Science Lab', x: 14, y: 10, icon: 'S', color: '#80ed99', kind: 'beaker', throwable: true, hiddenUntil: 0 },
  { room: 'Science Lab', x: 11, y: 6, icon: '⚗', color: '#b7efc5', kind: 'chemical flask', throwable: true, hiddenUntil: 0 },
  { room: 'Science Lab', x: 17, y: 6, icon: '🧪', color: '#95d5b2', kind: 'lab vial', throwable: true, hiddenUntil: 0 },
  { room: 'Science Lab', x: 24, y: 6, icon: '🧫', color: '#74c69d', kind: 'specimen tray', throwable: true, hiddenUntil: 0 },
  { room: 'Science Lab', x: 28, y: 6, icon: '☣', color: '#52b788', kind: 'chemical display cabinet', throwable: false, hiddenUntil: 0 },
  { room: 'Science Lab', x: 26, y: 12, icon: '🫀', color: '#caf0f8', kind: 'anatomy poster', throwable: false, hiddenUntil: 0 },
  { room: 'Science Lab', x: 10, y: 12, icon: '🧠', color: '#ade8f4', kind: 'anatomy poster', throwable: false, hiddenUntil: 0 },
  { room: 'Maths', x: 15, y: 46, icon: 'M', color: '#9bf6ff', kind: 'set square', throwable: true, hiddenUntil: 0 },
  { room: 'Maths', x: 10, y: 40, icon: '📚', color: '#d9ed92', kind: 'book shelf', throwable: false, hiddenUntil: 0 },
  { room: 'Maths', x: 35, y: 40, icon: '🗄', color: '#ccd5ae', kind: 'filing cabinet', throwable: false, hiddenUntil: 0 },
  { room: 'Maths', x: 34, y: 47, icon: '📐', color: '#9bf6ff', kind: 'geometry ruler', throwable: true, hiddenUntil: 0 },
  { room: 'English', x: 50, y: 46, icon: 'E', color: '#b8c0ff', kind: 'book', throwable: true, hiddenUntil: 0 },
  { room: 'English', x: 46, y: 40, icon: '📚', color: '#e9edc9', kind: 'book shelf', throwable: false, hiddenUntil: 0 },
  { room: 'English', x: 66, y: 40, icon: '🗄', color: '#d4d4d4', kind: 'filing cabinet', throwable: false, hiddenUntil: 0 },
  { room: 'English', x: 60, y: 46, icon: '📖', color: '#cdb4db', kind: 'hardback novel', throwable: true, hiddenUntil: 0 },
  { room: 'History', x: 66, y: 91, icon: 'H', color: '#caffbf', kind: 'globe', throwable: true, hiddenUntil: 0 },
  { room: 'History', x: 62, y: 82, icon: '🗺', color: '#f4d35e', kind: 'atlas', throwable: true, hiddenUntil: 0 },
  { room: 'History', x: 82, y: 82, icon: '📚', color: '#f6bd60', kind: 'history book shelf', throwable: false, hiddenUntil: 0 },
  { room: 'History', x: 80, y: 90, icon: '📜', color: '#f7ede2', kind: 'archive scroll', throwable: true, hiddenUntil: 0 },
  { room: 'Computer Room', x: 134, y: 10, icon: 'C', color: '#bde0fe', kind: 'keyboard', throwable: true, hiddenUntil: 0 },
  { room: 'Music Room', x: 112, y: 46, icon: 'D', color: '#f4978e', kind: 'drum stick', throwable: true, hiddenUntil: 0 },
  { room: 'Headmaster Office', x: 164, y: 46, icon: 'R', color: '#e5989b', kind: 'rule book', throwable: true, hiddenUntil: 0, size: 1 },
  { room: 'Maths', x: 22, y: 40, icon: '∑', color: '#cde7ff', kind: 'sum chart', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Maths', x: 27, y: 40, icon: 'π', color: '#d1f5ff', kind: 'number wheel', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'English', x: 54, y: 40, icon: '📰', color: '#f7ede2', kind: 'newspaper rack', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'English', x: 58, y: 40, icon: '✒', color: '#e4c1f9', kind: 'ink set', throwable: true, hiddenUntil: 0, size: 1 },
  { room: 'Geography', x: 16, y: 82, icon: '🧭', color: '#bde0fe', kind: 'compass kit', throwable: true, hiddenUntil: 0, size: 1 },
  { room: 'Geography', x: 26, y: 82, icon: '🌍', color: '#caf0f8', kind: 'terrain model', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Art Room', x: 52, y: 86, icon: '🖼', color: '#ffc6ff', kind: 'canvas stand', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Art Room', x: 55, y: 90, icon: '🎨', color: '#ffd6a5', kind: 'paint palette', throwable: true, hiddenUntil: 0, size: 1 },
  { room: 'Computer Room', x: 148, y: 10, icon: '💾', color: '#d9ed92', kind: 'backup disks', throwable: true, hiddenUntil: 0, size: 1 },
  { room: 'Computer Room', x: 156, y: 10, icon: '🖥', color: '#a9def9', kind: 'monitor cart', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Music Room', x: 118, y: 46, icon: '🎹', color: '#ffcad4', kind: 'synth board', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Music Room', x: 124, y: 46, icon: '🥁', color: '#fec89a', kind: 'drum pad', throwable: true, hiddenUntil: 0, size: 1 },
  { room: 'Science Lab', x: 20, y: 12, icon: '🔬', color: '#b7e4c7', kind: 'microscope', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Medical Bay', x: 102, y: 118, icon: '🩺', color: '#ffb3c6', kind: 'stethoscope', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Medical Bay', x: 110, y: 118, icon: '💊', color: '#cddafd', kind: 'medical cabinet', throwable: false, hiddenUntil: 0, size: 2 },
  { room: 'Medical Bay', x: 118, y: 120, icon: '🛏', color: '#d8f3dc', kind: 'recovery bed', throwable: false, hiddenUntil: 0, size: 3 },
  // Extra prop variety keeps classrooms feeling less repetitive across periods.
  { room: 'Computer Room', x: 130, y: 10, icon: '🖱', color: '#c7d2fe', kind: 'mouse', throwable: true, hiddenUntil: 0 },
  { room: 'English', x: 63, y: 44, icon: '✒', color: '#e9c46a', kind: 'ink pen set', throwable: true, hiddenUntil: 0 },
  { room: 'Geography', x: 24, y: 90, icon: '🗺', color: '#9bf6ff', kind: 'map roll', throwable: true, hiddenUntil: 0 },
  { room: 'History', x: 70, y: 90, icon: '🏺', color: '#e6ccb2', kind: 'history artifact', throwable: false, hiddenUntil: 0 },
  { room: 'Music Room', x: 121, y: 45, icon: '🎷', color: '#ffadad', kind: 'saxophone', throwable: true, hiddenUntil: 0 },
  // Assembly uses a speaking podium instead of a chalkboard for the headmaster's address.
  { room: 'Assembly Hall', x: 83, y: 61.5, icon: '🎤', color: '#d4a373', kind: 'headmaster podium', throwable: false, hiddenUntil: 0, size: 3 },
];



// Fixed computer terminals in the ICT room; students use these during computer lessons.
const computerStations = [
  { id: 'pc-1', room: 'Computer Room', x: 128, y: 8, use: 'spreadsheet', userName: null, temptationBy: null },
  { id: 'pc-2', room: 'Computer Room', x: 134, y: 8, use: 'word', userName: null, temptationBy: null },
  { id: 'pc-3', room: 'Computer Room', x: 140, y: 8, use: 'database', userName: null, temptationBy: null },
  { id: 'pc-4', room: 'Computer Room', x: 146, y: 8, use: 'spreadsheet', userName: null, temptationBy: null },
  { id: 'pc-5', room: 'Computer Room', x: 152, y: 8, use: 'word', userName: null, temptationBy: null },
  { id: 'pc-6', room: 'Computer Room', x: 158, y: 8, use: 'database', userName: null, temptationBy: null },
];

const computerUseMeta = {
  spreadsheet: { icon: '📊', color: '#bde0fe', label: 'Spreadsheet' },
  word: { icon: '📝', color: '#caffbf', label: 'Word Processor' },
  database: { icon: '🗃️', color: '#ffd6a5', label: 'Database' },
  game: { icon: '🎮', color: '#ffadad', label: 'Game' },
  pictures: { icon: '🖼️', color: '#ffc6ff', label: 'Pictures' },
};

// Keep weekday labels available before schedule initialisation runs.
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Bell schedule now compresses a full school day to ~15 real-world minutes.
const SCHOOL_DAY_START_MINUTES = (8 * 60) + 20;
const REGISTRATION_START_MINUTES = (8 * 60) + 50;

function buildScheduleForDay(dayCount = 1) {
  const weekday = weekdayLabelForDay(dayCount);
  const mondayWednesdayAssembly = weekday === 'Mon' || weekday === 'Wed';
  // Keep a longer arrival/tutorial window so registration does not begin before 8:50.
  const startDayMinutes = Math.max(10, REGISTRATION_START_MINUTES - SCHOOL_DAY_START_MINUTES);
  const routine = [
    { period: 'Start Day', room: 'School Gates', mins: startDayMinutes, mode: 'transition' },
    { period: 'Registration', room: 'Science Lab', mins: 25, mode: 'lesson' },
    { period: 'Lesson 1', room: 'Maths', mins: 60, mode: 'lesson' },
  ];

  if (mondayWednesdayAssembly) {
    routine.push(
      // Requested weekly routine: assembly after first class, then a short class.
      { period: 'Assembly', room: 'Assembly Hall', mins: 30, mode: 'lesson' },
      { period: 'Short Class', room: 'English', mins: 30, mode: 'lesson' },
      { period: 'Extended Break', room: 'P.E. Field', mins: 40, mode: 'break' },
    );
  } else {
    routine.push(
      { period: 'Lesson 2', room: 'English', mins: 60, mode: 'lesson' },
      { period: 'Morning Break', room: 'P.E. Field', mins: 25, mode: 'break' },
    );
  }

  routine.push(
    { period: 'Lesson 3', room: 'Geography', mins: 55, mode: 'lesson' },
    // Lunch now occurs in the dining hall so students can congregate for food service.
    { period: 'Lunch Break', room: 'Dining Hall', mins: 30, mode: 'break' },
    { period: 'Lesson 4', room: 'Art Room', mins: 60, mode: 'lesson' },
    { period: 'Lesson 5', room: 'Computer Room', mins: 60, mode: 'lesson' },
    { period: 'Home Time', room: 'School Gates', mins: 20, mode: 'home' },
    { period: 'End Day', room: 'School Gates', mins: 10, mode: 'end' },
  );
  return routine;
}

let schedule = buildScheduleForDay(1);
const TARGET_DAY_REAL_SECONDS = 15 * 60;
const DEFAULT_GAME_SPEED_MULTIPLIER = 1;
const ROLE_VISUALS = {
  bully: '#ff5f88',
  hero: '#ffd58e',
  swot: '#8effd3',
  weird: '#c58eff',
};
// NPC stamina tuning:
// - movement drain is 4x slower than the previous build so students do not crash before lunch.
// - a gentle day-fatigue baseline still brings most pupils to ~30 energy by home time.
const NPC_BASE_DRAIN_PER_SECOND = 0.0475;
const NPC_RUNNING_EXTRA_DRAIN_PER_SECOND = 0.145;
const NPC_LUNCH_RECOVER_PER_SECOND = 0.16;
// Seated students should slowly recover stamina during lessons instead of still draining.
const NPC_SEATED_RECOVER_PER_SECOND = 0.08;
const NPC_END_OF_DAY_ENERGY_TARGET = 30;
// Keep one spare seat in active classrooms so displaced students can re-seat cleanly.
const LESSON_SPARE_SEATS_PER_ROOM = 1;
const TOTAL_DAY_GAME_MINUTES = schedule.reduce((sum, period) => sum + period.mins, 0);

// Period helpers keep schedule checks readable when timetable labels change.
function isSupervisedPeriod(period) {
  return period.mode === 'lesson';
}

function isStartDayPeriod(period) {
  return period.period === 'Start Day';
}

function isRegistrationPeriod(period) {
  return period.period === 'Registration';
}

// Tutor rooms host morning registration: each student stays in one fixed tutor group.
const TUTOR_ROOMS = ['Science Lab', 'Upper Common', 'Physics Lab', 'Chem Prep', 'English', 'Music Room', 'Geography', 'History'];
const CLASS_RESPONSE_LINES = ['Here sir.', 'Sir.', 'Here.', 'Yes sir.', 'Yes miss.', 'Here miss.', 'Present.', 'Yep, here.'];

const floorMeta = {
  upper: { label: 'Upper', color: 'Purple' },
  middle: { label: 'Middle', color: 'Blue' },
  ground: { label: 'Ground', color: 'Green' },
  lower: { label: 'Lower', color: 'Amber' },
};

const schoolExit = { x: 159.2, yMin: 84, yMax: 107 };
// Morning lineup geometry in the field: students queue on the right, teachers on the left.
const morningQueue = {
  dividerInsetFromFieldLeft: 35,
  studentMinOffsetFromDivider: 2.2,
  teacherOffsetFromDivider: 2.1,
};
const floorOrder = { upper: 3, middle: 2, ground: 1, lower: 0 };
const floorSequence = ['lower', 'ground', 'middle', 'upper'];

// Preferred supervising teacher per lesson room keeps class starts orderly.
const roomTeacherMap = {
  'Science Lab': 'Dr Beaker',
  'Upper Common': 'Ms Mirth',
  'Physics Lab': 'Prof Volt',
  'Chem Prep': 'Ms Fizz',
  Maths: 'Mr Flash',
  English: 'Ms Take',
  Geography: 'Mr Creak',
  History: 'Mr Creak',
  'Art Room': 'Ms Take',
  'Computer Room': 'Mr Wacker',
  'Music Room': 'Mr Boom',
  'Headmaster Office': 'Mr Wacker',
  'Debate Room': 'Ms Quill',
  'Design Studio': 'Mr Forge',
};

// Every teacher also has a personal classroom so staff do not clump at one doorway.
const teacherHomeRoomMap = {
  'Mr Wacker': 'Headmaster Office',
  'Mr Flash': 'Maths',
  'Ms Take': 'English',
  'Dr Beaker': 'Science Lab',
  'Mr Creak': 'History',
  'Ms Mirth': 'Upper Common',
  'Prof Volt': 'Physics Lab',
  'Ms Fizz': 'Chem Prep',
  'Mr Boom': 'Music Room',
  'Ms Quill': 'Debate Room',
  'Mr Forge': 'Design Studio',
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
  // Lunchtime-only supervisor who keeps the playground calm.
  dinnerLady: { speed: 1.2, aggression: 0.45, diligence: 1.0, focus: 0.95 },
  janitor: { speed: 1.28, aggression: 0.05, diligence: 1.0, focus: 1.0 },
  nurse: { speed: 1.24, aggression: 0.06, diligence: 1.0, focus: 1.0 },
  player: { speed: 1.19, aggression: 0, diligence: 0, focus: 0 },
};

// Dialogue pacing keeps chatter readable and prevents instant back-to-back spam.
const MIN_DIALOGUE_INTERVAL_MS = 7600;
const CLASSROOM_DIALOGUE_INTERVAL_MS = 13200;
const INTERACTION_COOLDOWN_HOURS = 3;

// Everyday school items can move through student pockets via trading and bartering.
const TRADABLE_ITEMS = [
  'chewing gum', 'packed lunch', 'textbook', 'sunglasses', 'cap', 'conkers', 'apple',
  'walkman stereo', 'cassette tape', 'letter', 'toy robot', 'paper airplane', 'trading cards', 'video game cart', 'video game disk',
];

// Rare collectibles rotate around school and can be traded like pocket items.
const COLLECTABLE_CATALOG = [
  { name: 'golden prefect badge', icon: '🏅', tint: '#ffd166', value: 9 },
  { name: 'signed football card', icon: '⚽', tint: '#bde0fe', value: 8 },
  { name: 'limited mixtape', icon: '📼', tint: '#ffafcc', value: 7 },
  { name: 'science fair ribbon', icon: '🎗', tint: '#caffbf', value: 8 },
  { name: 'comic first issue', icon: '📕', tint: '#f4a261', value: 7 },
  { name: 'silver whistle', icon: '📯', tint: '#d9d9d9', value: 6 },
  { name: 'vintage keyring', icon: '🗝', tint: '#f1fa8c', value: 7 },
  { name: 'neon yo-yo', icon: '🪀', tint: '#9bf6ff', value: 5 },
  { name: 'secret map scrap', icon: '🗺', tint: '#fefae0', value: 8 },
  { name: 'rare sticker pack', icon: '✨', tint: '#ffc6ff', value: 6 },
  { name: 'chess medal', icon: '♟', tint: '#dad7cd', value: 9 },
  { name: 'arcade token', icon: '🪙', tint: '#ffd6a5', value: 6 },
];
const COLLECTABLE_LIFETIME_MS = 60000;
const COLLECTABLE_SPAWN_INTERVAL_MS = 4200;
const MAX_ACTIVE_COLLECTABLES = 7;

const MONSTER_PREFIXES = ['Aero', 'Blaze', 'Crystal', 'Dread', 'Echo', 'Frost', 'Giga', 'Hex', 'Iron', 'Jade', 'Nova', 'Shadow', 'Solar', 'Storm', 'Venom', 'Wild'];
const MONSTER_SUFFIXES = ['Drake', 'Mantis', 'Golem', 'Specter', 'Hydra', 'Raptor', 'Warden', 'Seraph', 'Wisp', 'Leviathan', 'Titan', 'Sprite', 'Colossus', 'Phantom', 'Wyvern', 'Stalker'];
const MONSTER_ABILITIES = ['Flame burst', 'Mind shield', 'Quick strike', 'Poison cloud', 'Stone skin', 'Arc pulse', 'Mirror dodge', 'Moon howl'];
const CARD_RARITY = {
  common: { icon: '🃏', tint: '#d9d9d9', weight: 72, bonus: 0 },
  silver: { icon: '🥈', tint: '#c0d6df', weight: 22, bonus: 10 },
  legendary: { icon: '🥇', tint: '#ffd166', weight: 6, bonus: 22 },
};

function generateTradingCardCatalog() {
  const cards = [];
  for (let i = 0; i < 256; i += 1) {
    const prefix = MONSTER_PREFIXES[i % MONSTER_PREFIXES.length];
    const suffix = MONSTER_SUFFIXES[Math.floor(i / MONSTER_PREFIXES.length) % MONSTER_SUFFIXES.length];
    const rarity = i < 184 ? 'common' : i < 238 ? 'silver' : 'legendary';
    const rarityBonus = CARD_RARITY[rarity].bonus;
    const base = 28 + (i % 36);
    cards.push({
      id: `TC-${String(i + 1).padStart(3, '0')}`,
      name: `${prefix} ${suffix}`,
      ability: MONSTER_ABILITIES[i % MONSTER_ABILITIES.length],
      strength: base + rarityBonus,
      defense: 24 + ((i * 7) % 44) + Math.floor(rarityBonus * 0.8),
      weakness: ['Fire', 'Water', 'Wind', 'Earth', 'Light', 'Dark'][i % 6],
      rarity,
    });
  }
  return cards;
}

const TRADING_CARD_CATALOG = generateTradingCardCatalog();

const NPC_POSTURES = ['upright', 'slouched', 'bouncy', 'swagger', 'careful', 'stiff', 'dramatic'];


// Lightweight in-memory backend database for trait balancing and per-level tuning.
const npcTraitBackendDb = window.TRAIT_BACKEND_DB || {
  version: 'v1.0',
  traitKeys: [
    'aggression', 'funny', 'friendly', 'mood', 'wit', 'intelligence', 'speed', 'skill', 'luck',
    'bladderSize', 'boneStrength', 'immuneSystem', 'intelect', 'wisdom', 'honor', 'strength',
    'sadism', 'masochism', 'discipline', 'trading', 'barter',
  ],
  weightClasses: ['overweight', 'slim', 'skinny', 'normal', 'chubby', 'obese'],
  roleBias: {
    bully: { aggression: 24, strength: 14, sadism: 18, friendly: -12, honor: -14, discipline: -16 },
    swot: { intelligence: 20, wisdom: 15, funny: -4, aggression: -18, discipline: 20, honor: 12 },
    hero: { friendly: 15, honor: 14, wit: 8, aggression: -4, strength: 8, trading: 6 },
    weird: { funny: 16, luck: 10, mood: 12, discipline: -12, wit: 10 },
    teacher: { intelligence: 22, wisdom: 20, discipline: 26, honor: 14, aggression: 8, skill: 10, barter: 4 },
    janitor: { wisdom: 10, friendly: 8, discipline: 16, aggression: -8, bladderSize: 6 },
    nurse: { wisdom: 18, friendly: 18, discipline: 22, aggression: -10, immuneSystem: 14 },
    player: { funny: 10, wit: 8, luck: 10, discipline: -8 },
  },
  levels: Array.from({ length: 10 }, (_, index) => {
    const level = index + 1;
    const base = 28 + (level * 6);
    return {
      level,
      aggression: base,
      funny: base + 2,
      friendly: base + 3,
      mood: base + 1,
      wit: base + 2,
      intelligence: base + 4,
      speed: base + 3,
      skill: base + 2,
      luck: base,
      bladderSize: base + 1,
      boneStrength: base + 2,
      immuneSystem: base + 3,
      intelect: base + 4,
      wisdom: base + 4,
      honor: base + 2,
      strength: base + 2,
      sadism: base - 4,
      masochism: base - 5,
      discipline: base + 2,
      trading: base + 1,
      barter: base,
    };
  }),
};

function randomInventoryFor(role) {
  const baseline = role === 'teacher' ? ['textbook', 'letter', 'apple'] : ['textbook', 'paper airplane'];
  const picks = 2 + Math.floor(Math.random() * 3);
  const items = [...baseline];
  for (let i = 0; i < picks; i += 1) {
    items.push(TRADABLE_ITEMS[Math.floor(Math.random() * TRADABLE_ITEMS.length)]);
  }
  return items;
}

function clampScore(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function traitLevelForEntity(role) {
  if (role === 'teacher') return 8;
  if (role === 'janitor') return 6;
  if (role === 'nurse') return 7;
  if (role === 'player') return 5;
  return 3 + Math.floor(Math.random() * 4);
}

function buildTraitProfile(role, overrides = {}) {
  const level = clampScore(traitLevelForEntity(role), 1, 10);
  const template = npcTraitBackendDb.levels[level - 1];
  const bias = npcTraitBackendDb.roleBias[role] || {};
  const profile = { level };
  for (const key of npcTraitBackendDb.traitKeys) {
    const jitter = (Math.random() * 22) - 11;
    profile[key] = clampScore((template[key] || 50) + (bias[key] || 0) + jitter);
  }

  const bodyRoll = (profile.strength + profile.bladderSize + profile.boneStrength - profile.speed) / 4;
  profile.weight = overrides.weight || (bodyRoll > 70
    ? (profile.speed < 40 ? 'obese' : 'overweight')
    : bodyRoll > 58
      ? 'chubby'
      : bodyRoll < 40
        ? (profile.strength < 36 ? 'skinny' : 'slim')
        : 'normal');

  for (const [key, value] of Object.entries(overrides)) {
    if (key in profile && typeof value === 'number') profile[key] = clampScore(value);
    if (key === 'weight' && typeof value === 'string') profile.weight = value;
  }

  return profile;
}

function relationshipDeltaForEricInteraction(entity, interactionType) {
  const t = entity?.traits;
  if (!t) return 0;
  if (interactionType === 'punch') {
    if (t.masochism >= 66) return 6;
    return -(8 + (t.sadism * 0.05));
  }
  if (interactionType === 'insult') {
    if (t.masochism >= 62) return 4;
    return -(6 + (t.sadism * 0.04));
  }
  if (interactionType === 'help') return 5 + (t.friendly * 0.03);
  return 0;
}

function adjustEricRelationship(entity, delta, reason = 'interaction') {
  if (!entity || entity.role === 'player') return;
  const current = entity.relationships?.Eric ?? 0;
  const next = clampScore(current + delta, -100, 100);
  entity.relationships = entity.relationships || {};
  entity.relationships.Eric = Math.round(next);
  entity.ericRelationshipType = relationshipLabel(entity.relationships.Eric);
  entity.lastEricRelationReason = reason;
}

function relationshipLabel(score) {
  if (score >= 80) return 'best friend';
  if (score >= 45) return 'friend';
  if (score >= 10) return 'acquaintance';
  if (score <= -45) return 'enemy';
  return 'stranger';
}


function styleSeedFromName(name = '') {
  return Array.from(String(name)).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

function pickForEntity(entity, items, salt = 0) {
  if (!items?.length) return null;
  const base = styleSeedFromName(entity?.name || 'npc') + Math.floor(salt * 17);
  return items[Math.abs(base) % items.length];
}

function buildDialogueProfile(entity) {
  const role = entity.role;
  const quirks = [
    'always taps a desk before speaking', 'drops dramatic pauses', 'keeps sentences clipped',
    'talks like a sports commentator', 'narrates events like a mystery', 'leans into dry sarcasm',
    'uses old-school formal phrases', 'whispers conspiratorially',
  ];

  const studentTopics = [
    'canteen queues', 'detention rumours', 'dodgy homework excuses', 'playground rivalries',
    'secret shortcuts between rooms', 'football bragging rights', 'who copied whose notes',
    'who got called to Headmaster today', 'who shouted in assembly',
  ];
  const teacherTopics = [
    'discipline standards', 'exam prep', 'attendance', 'corridor behaviour',
    'lesson focus', 'staff room gossip', 'class participation', 'uniform rules',
  ];

  const posture = role === 'teacher'
    ? pickForEntity(entity, ['upright', 'measured', 'stately', 'stern', 'composed'])
    : pickForEntity(entity, NPC_POSTURES);

  return {
    posture,
    styleQuirk: pickForEntity(entity, quirks, 2),
    preferredTopic: pickForEntity(entity, role === 'teacher' ? teacherTopics : studentTopics, 3),
  };
}

function createQuestionVariants(entity) {
  const templates = entity.role === 'teacher'
    ? [
      'Why are we chatting about {topic} during lesson time?',
      "Who can connect today's work to {topic}?",
      'Explain this clearly, no waffle: {topic}.',
      "Hands up: what have we learned from yesterday's {topic}?",
      'How would you improve your effort after that {topic} incident?',
    ]
    : [
      'Did you hear about {topic}?',
      'What do you reckon about {topic}?',
      'Can you believe the drama around {topic}?',
      'Who started the chaos with {topic}?',
      'Any idea what happens next after {topic}?',
    ];
  return Array.from({ length: 24 }, (_, idx) => {
    const t = templates[idx % templates.length];
    const emphasis = idx % 3 === 0 ? ' seriously' : idx % 3 === 1 ? ' honestly' : '';
    return t.replace('{topic}', entity.dialogueProfile?.preferredTopic || 'that') + emphasis;
  });
}

function createResponseVariants(entity) {
  const trait = entity.traits || {};
  const confidence = (trait.wit || 50) + (trait.intelligence || 50);
  const warm = (trait.friendly || 50) + (trait.honor || 50);
  const strict = (trait.discipline || 50) + (entity.profile?.strict || 0) * 70;

  const templates = entity.role === 'teacher'
    ? [
      "Focus up. I'm noting this for later.",
      'Interesting, but keep your feet still and your mind on task.',
      'We covered this before; prove you remember it.',
      'I expect better posture and better answers.',
      'That answer has potential. Tighten it and try again.',
      "You're testing my patience today.",
    ]
    : [
      "I'm trying, just don't grass me up.",
      "Fine, fine — I'll sit straight and do it properly.",
      'That was wild. Still thinking about it.',
      "No clue, but I'll guess with confidence.",
      "I've got notes on this somewhere.",
      "Ask me after break and I'll tell you everything.",
    ];

  return Array.from({ length: 28 }, (_, idx) => {
    let line = templates[idx % templates.length];
    if (confidence > 120 && idx % 2 === 0) line = `${line} I know this one.`;
    if (warm > 122 && idx % 3 === 1) line = `${line} We're alright, yeah?`;
    if (strict > 120 && idx % 4 === 0) line = `${line} Standards matter.`;
    return line;
  });
}

// Build per-NPC roaming chatter so corridor lines feel personal instead of repetitive.
function createHallwayChatterVariants(entity) {
  const roleTag = entity.role === 'teacher' ? 'teacher' : 'student';
  const speedTag = (entity.traits?.speed || 50) > 60 ? 'quick' : 'steady';
  const moodTag = (entity.traits?.friendly || 50) > 58 ? 'warm' : 'dry';
  const topic = entity.dialogueProfile?.preferredTopic || 'school drama';
  const quirk = entity.dialogueProfile?.styleQuirk || 'keeps it brief';

  // Multiple phrase banks are combined deterministically for each NPC name, producing
  // distinct-but-consistent voice lines across the full school day.
  const openers = roleTag === 'teacher'
    ? ['Right then', 'Eyes up', 'Listen in', 'Class, focus', 'Quick reminder']
    : ['Oi', 'No way', 'Heads up', 'Wait for me', 'Guess what'];
  let cores;
  if (roleTag === 'teacher') {
    cores = [
      `corridor behaviour still needs work`,
      `we are not turning this into a sprint track`,
      `I can still hear chatter about ${topic}`,
      `line up before we enter the room`,
      `save the gossip for break, not lesson changeover`,
    ];
  } else if (entity.role === 'bully') {
    cores = [
      `move or get steamrolled`,
      `I run this corridor`,
      `keep staring and catch trouble`,
      `someone is getting shoved at break`,
      `detention cannot stop me today`,
    ];
  } else if (entity.role === 'swot') {
    cores = [
      `my recursion notes are elite`,
      `the algorithm is O of n log n`,
      `I am calibrating my revision stack`,
      `binary trees beat panic every time`,
      `that theorem proof is almost elegant`,
    ];
  } else if (entity.role === 'hero') {
    cores = [
      `we have got this lesson together`,
      `heads up, no one gets left behind`,
      `do the right thing and keep moving`,
      `I will help if you are stuck`,
      `stay calm and own the day`,
    ];
  } else {
    cores = [
      `I am racing to ${topic}`,
      `someone started more ${topic} drama`,
      `I forgot my notes again`,
      `canteen queue is chaos already`,
      `last one there owes chips`,
    ];
  }
  const closers = moodTag === 'warm'
    ? ['yeah?', 'come on then!', 'you with me?', 'let us move!', 'this is mad!']
    : ['move.', 'keep up.', 'honestly.', 'typical.', 'seriously.'];
  const emotes = speedTag === 'quick'
    ? ['🏃', '⚡', '😅', '📣', '🚀']
    : ['😌', '🧭', '🙂', '📚', '👀'];

  return Array.from({ length: 30 }, (_, idx) => {
    const opener = openers[(idx + styleSeedFromName(entity.name || 'npc')) % openers.length];
    const core = cores[(idx * 3 + styleSeedFromName(entity.name || 'npc')) % cores.length];
    const closer = closers[(idx * 2 + styleSeedFromName(entity.name || 'npc')) % closers.length];
    const emote = emotes[idx % emotes.length];
    const quirkSuffix = idx % 4 === 0 ? ` (${quirk})` : '';
    return `${emote} ${opener}, ${core} ${closer}${quirkSuffix}`;
  });
}

// Internal thought pools are also per-NPC so students don't all think the same sentence.
function createThoughtVariants(entity) {
  const topic = entity.dialogueProfile?.preferredTopic || 'class';
  const confidence = ((entity.traits?.wit || 50) + (entity.traits?.intelligence || 50)) / 2;
  const confidenceTag = confidence > 62 ? 'I have got this' : 'please let this go smoothly';
  const tones = ['🍕', '⚽', '🎮', '☁️', '🧠', '📝', '👟', '🎧', '📓', '💡', '🫧', '🎯'];
  const thoughtTemplates = [
    `${confidenceTag}... maybe ${topic} will come up.`,
    'Need to remember my planner this time.',
    'If I finish quickly, break will feel longer.',
    'Focus now, dream later.',
    'One good answer and I am safe today.',
    'Why is the bell always slower before lunch?',
    'Stay calm, walk in, look prepared.',
    `I should ask about ${topic} later.`,
    'Do not laugh at the next bad joke. Keep a straight face.',
    'If I sit near the window I might actually listen better.',
    'Remember: write the date first, panic second.',
    'Lunch plan: queue early, avoid chaos, guard the chips.',
    'If the teacher asks, I definitely revised... probably.',
    'Need one clean answer and a confident nod.',
    'Must stop doodling spaceships in the margin.',
    'If I survive this period, I deserve legendary snacks.',
  ];
  return Array.from({ length: 36 }, (_, idx) => {
    const tone = tones[(idx + styleSeedFromName(entity.name || 'npc')) % tones.length];
    const template = thoughtTemplates[(idx * 2 + styleSeedFromName(entity.name || 'npc')) % thoughtTemplates.length];
    return `${tone} ${template}`;
  });
}

function ensureDialogueSetup(entity) {
  if (entity.dialogueProfile && entity.dialogue && entity.dialogue.questions?.length) return;
  entity.dialogueProfile = buildDialogueProfile(entity);
  entity.dialogue = {
    questions: createQuestionVariants(entity),
    responses: createResponseVariants(entity),
    hallwayChatter: createHallwayChatterVariants(entity),
    thoughts: createThoughtVariants(entity),
  };
}

function logSchoolHistory(text, source = null) {
  const entry = {
    text: String(text),
    source: source?.name || null,
    room: source ? entityRoom(source) : null,
    at: game.timeMinutes,
  };
  game.schoolHistory.unshift(entry);
  game.schoolHistory = game.schoolHistory.slice(0, 140);
}

function randomHistorySnippet() {
  if (!game.schoolHistory.length) return null;
  return game.schoolHistory[Math.floor(game.rng() * game.schoolHistory.length)];
}

function conversationThreadKey(a, b) {
  const aName = typeof a === 'string' ? a : (a?.name || 'Unknown A');
  const bName = typeof b === 'string' ? b : (b?.name || 'Unknown B');
  return [aName, bName].sort().join('|');
}

function recordNpcConversationTurn(speaker, addressee, line) {
  if (!speaker?.name || !addressee?.name || !line) return;
  const key = conversationThreadKey(speaker, addressee);
  const history = game.npcConversations[key] || [];
  history.push({
    by: speaker.name,
    to: addressee.name,
    text: sanitizeLlmLine(line),
    at: game.timeMinutes,
  });
  // Keep only recent lines to avoid unbounded memory growth and prompt bloat.
  game.npcConversations[key] = history.slice(-10);
}

function recentConversationContext(speaker, addressee) {
  if (!speaker?.name || !addressee?.name) return '';
  const key = conversationThreadKey(speaker, addressee);
  const history = game.npcConversations[key] || [];
  return history
    .slice(-4)
    .map((item) => `${item.by}→${item.to}: ${item.text}`)
    .join(' | ');
}

function contextualResponseFor(entity, peer = null) {
  ensureDialogueSetup(entity);
  const relation = peer ? (entity.relationships?.[peer.name] ?? entity.relationships?.Eric ?? 0) : 0;
  const relationTag = relation >= 35 ? 'friendly' : relation <= -35 ? 'hostile' : 'neutral';
  const pool = entity.dialogue.responses || [];
  const base = pool[Math.floor(game.rng() * pool.length)] || '...';
  if (relationTag === 'friendly') return `${base} (${peer?.name || 'mate'}, you\'re sound.)`;
  if (relationTag === 'hostile') return `${base} (${peer?.name || 'you'} better behave.)`;
  return base;
}



function socialBondKey(aName, bName) {
  return [String(aName || ''), String(bName || '')].sort().join('|');
}

function getSocialBond(a, b) {
  if (!a || !b) return 0;
  const key = socialBondKey(a.name, b.name);
  return game.socialBonds[key] || 0;
}

function setSocialBond(a, b, delta) {
  if (!a || !b || a === b) return 0;
  const key = socialBondKey(a.name, b.name);
  const next = clampScore((game.socialBonds[key] || 0) + delta, -100, 100);
  game.socialBonds[key] = next;
  return next;
}

function ensureSocialProfile(entity) {
  if (!entity || !isStudentCharacter(entity) || entity.role === 'player') return;
  if (entity.socialProfile) return;
  const quirkPool = [
    'collects gossip like trading cards',
    'quotes films at awkward times',
    'acts brave then panics quietly',
    "takes notes on everyone's drama",
    'always volunteers then regrets it',
    'laughs before finishing the joke',
    'starts tiny rumours for fun',
    'tries to keep rival groups apart',
  ];
  entity.socialProfile = {
    evolvingQuirks: [pickForEntity(entity, quirkPool, 9)],
    socialStreak: 0,
    cliqueId: '',
    lastEvolvedAt: 0,
  };
}

function tryEvolveQuirk(entity, now) {
  ensureSocialProfile(entity);
  if (!entity?.socialProfile) return;
  if (now - (entity.socialProfile.lastEvolvedAt || 0) < 90000) return;
  if (game.rng() >= 0.08) return;
  const growthPool = [
    'started mediating arguments',
    'became obsessed with strategy games',
    'turned into a corridor storyteller',
    'joined the lunchtime prank crew',
    'became weirdly protective of friends',
    'keeps a secret list of IOUs',
  ];
  const trait = pickForEntity(entity, growthPool, game.dayCount + entity.socialProfile.socialStreak);
  if (!entity.socialProfile.evolvingQuirks.includes(trait)) {
    entity.socialProfile.evolvingQuirks.push(trait);
    entity.socialProfile.evolvingQuirks = entity.socialProfile.evolvingQuirks.slice(-3);
    entity.socialProfile.lastEvolvedAt = now;
    announce(`🧬 ${entity.name} evolved socially: ${trait}.`, { force: true, feedType: 'world' });
  }
}

function resolveLlmSocialDirective(actor, peer, fallbackIntent = 'ally') {
  const threadContext = recentConversationContext(actor, peer);
  const threadKey = peer ? conversationThreadKey(actor, peer) : '';
  const threadTurn = threadKey ? ((game.npcConversations[threadKey] || []).length + 1) : 0;
  const payload = {
    channel: 'social',
    subject: roomSubjectName(entityRoom(actor)),
    speaker: actor.name,
    speakerRole: roleLabelForLlm(actor.role),
    traitSummary: summarizeTraitBundle(actor.traits),
    room: entityRoom(actor),
    addresseeName: peer?.name || '',
    addresseeRole: peer ? roleLabelForLlm(peer.role) : '',
    conversationContext: threadContext,
    conversationTurn: threadTurn,
    fallback: `intent=${fallbackIntent}; keep it short`,
  };
  const key = llmCacheKey(payload);
  if (!llmModeEnabled()) return null;
  const now = performance.now();
  if (now < (actor.socialNextLlmAt || 0)) return null;
  const cached = game.llm.cache.get(key);
  if (!cached) {
    actor.socialNextLlmAt = now + 6000 + (Math.random() * 2500);
    queueLlmText(payload);
    return null;
  }
  try {
    const parsed = parseJsonFromLlm(cached);
    const allowed = new Set(['ally', 'tease', 'avoid', 'follow', 'defend']);
    const intent = allowed.has(parsed.intent) ? parsed.intent : fallbackIntent;
    const bondDelta = clampScore(Number(parsed.bondDelta || 0), -3, 3);
    const line = sanitizeLlmLine(parsed.line || `${peer?.name || 'mate'}, stay sharp.`);
    return { intent, bondDelta, line };
  } catch (error) {
    pushLlmDebug(`⚠️ Social directive parse failed for ${actor?.name || 'npc'}.`, 'warn');
    return null;
  }
}

function refreshCliquesFromBonds() {
  const students = game.entities.filter((e) => isStudentCharacter(e) && e.role !== 'player');
  const adjacency = new Map(students.map((s) => [s.name, []]));
  for (let i = 0; i < students.length; i += 1) {
    for (let j = i + 1; j < students.length; j += 1) {
      const bond = getSocialBond(students[i], students[j]);
      if (bond >= 38) {
        adjacency.get(students[i].name).push(students[j]);
        adjacency.get(students[j].name).push(students[i]);
      }
    }
  }
  const visited = new Set();
  game.socialGroups = [];
  for (const student of students) {
    if (visited.has(student.name)) continue;
    const queue = [student.name];
    const members = [];
    visited.add(student.name);
    while (queue.length) {
      const name = queue.shift();
      members.push(name);
      for (const peer of adjacency.get(name) || []) {
        if (visited.has(peer.name)) continue;
        visited.add(peer.name);
        queue.push(peer.name);
      }
    }
    if (members.length >= 3) {
      const id = `group-${game.socialGroupCounter++}`;
      game.socialGroups.push({ id, members, createdDay: game.dayCount });
      members.forEach((name) => {
        const entity = game.entities.find((candidate) => candidate.name === name);
        ensureSocialProfile(entity);
        if (entity?.socialProfile) entity.socialProfile.cliqueId = id;
      });
    }
  }
}

function updateEmergentSocialLife(now, currentPeriod) {
  if (now - (game.lastSocialTickAt || 0) < 2400) return;
  game.lastSocialTickAt = now;
  const roaming = game.entities.filter((entity) => (
    isStudentCharacter(entity)
    && entity.role !== 'player'
    && entity.knockedUntil < now
    && isEntityVisibleToPlayer(entity)
  ));
  let processed = 0;
  for (const entity of roaming) {
    if (processed >= 5) break;
    ensureSocialProfile(entity);
    tryEvolveQuirk(entity, now);
    const peer = roaming.find((candidate) => candidate !== entity && entityRoom(candidate) === entityRoom(entity) && distance(candidate, entity) < 2.9);
    if (!peer) continue;
    processed += 1;
    const warmth = ((entity.traits?.friendly || 50) - (peer.traits?.aggression || 50)) / 50;
    const fallbackIntent = warmth >= 0 ? 'ally' : 'tease';
    const directive = resolveLlmSocialDirective(entity, peer, fallbackIntent);
    const intent = directive?.intent || fallbackIntent;
    const baseDelta = intent === 'ally' ? 2 : intent === 'defend' ? 3 : intent === 'follow' ? 1 : intent === 'avoid' ? -1 : -2;
    const delta = clampScore(baseDelta + (directive?.bondDelta || 0), -4, 4);
    const bond = setSocialBond(entity, peer, delta);
    entity.socialProfile.socialStreak = Math.max(0, (entity.socialProfile.socialStreak || 0) + (delta > 0 ? 1 : -1));

    if (directive?.line && game.rng() < 0.38) {
      say(entity, directive.line, { peer, durationMs: 3000 });
      // Quick back-and-forth makes NPC conversations feel alive, not one-sided.
      if (canUseDialogue(peer, now + 80, 'speech') && game.rng() < 0.34) {
        const reply = contextualResponseFor(peer, entity);
        say(peer, reply, { peer: entity, durationMs: 2800 });
      }
    }

    if (bond >= 70 && game.rng() < 0.14) {
      think(entity, `🤝 ${peer.name} has my back today.`, 2500, { logToFeed: true });
    } else if (bond <= -70 && game.rng() < 0.14) {
      think(entity, `⚡ ${peer.name} is trouble. Keep distance.`, 2500, { logToFeed: true });
    }
  }

  if (game.rng() < 0.18) refreshCliquesFromBonds();

  if (game.socialGroups.length && game.rng() < 0.12) {
    const spotlight = game.socialGroups[Math.floor(game.rng() * game.socialGroups.length)];
    const room = currentPeriod?.room || 'School';
    const leader = game.entities.find((entity) => entity.name === spotlight.members[0]);
    const summary = resolveLlmText({
      channel: 'announcement',
      subject: roomSubjectName(room),
      speaker: leader?.name || 'Narrator',
      speakerRole: leader ? roleLabelForLlm(leader.role) : 'narrator',
      traitSummary: leader ? summarizeTraitBundle(leader.traits) : 'neutral',
      room,
      fallback: `🧩 Social group active: ${spotlight.members.slice(0, 3).join(', ')} moving together.`,
    });
    pushFeedEvent(summary, 'world');
  }
}
const JANITOR_IDLE_ROOM = 'Janitor Room';
const LITTER_CLEANUP_DELAY_MS = 20000;
const TOILET_DIRT_PER_USE = 4;
const TOILET_MAX_DIRT = 100;
const TOILET_BLOCK_INTERVAL_DAYS = 12;
const TOILET_BLOCK_DURATION_MS = 18000;
const WEEKLY_SICK_DAY_INTERVAL = 5;
const TARGET_ATTENDANCE_PERCENT = 95;

// AI providers: local Ollama and remote cloud backends (OpenAI/Grok).
const OLLAMA_DEFAULT_ENDPOINT = 'http://127.0.0.1:11434';
const OPENAI_API_BASE = 'https://api.openai.com/v1';
const GROK_API_BASE = 'https://api.x.ai/v1';
const LLM_DEFAULT_TIMEOUT_MS = 3800;
const LLM_MAX_INFLIGHT = 4;
const LLM_STORAGE_KEY = 'skooldaze.llm.settings.v1';

const LLM_GAME_PRIMER = [
  'You are the text engine for Skool Daze Tribute, a real-time British school simulation game.',
  'Core channels: speech bubbles, thought bubbles, public announcements, and quiz JSON content.',
  'Output must be fast, concise, and safe to parse: no markdown wrappers, no roleplay preambles.',
  'Speech/thought should stay under 14 words and preserve NPC personality from provided traits.',
  'Student speech should address the given addressee by name when one is supplied.',
  'Announcements should read like school PA updates. Quiz output must remain strict JSON only.',
  'If context is unclear, adapt fallback text instead of inventing long new lore.',
].join(' ');

// OAuth configuration for browser-side OpenAI sign-in.
// NOTE: If your OAuth app uses a custom auth URL/client id, update these constants.
const OPENAI_OAUTH_AUTHORIZE_URL = 'https://auth.openai.com/oauth/authorize';
const OPENAI_OAUTH_CLIENT_ID = 'codex-web';
const OPENAI_OAUTH_SCOPES = 'openid profile offline_access';
const OPENAI_OAUTH_STATE_KEY = 'skooldaze.openai.oauth.state';

function setLlmStatus(text, isError = false) {
  if (!optLlmStatusEl) return;
  optLlmStatusEl.textContent = text;
  optLlmStatusEl.classList.toggle('llm-status-error', Boolean(isError));
}

function setLlmTokenStatus(text, isError = false) {
  if (!optLlmTokenStatusEl) return;
  optLlmTokenStatusEl.textContent = text;
  optLlmTokenStatusEl.classList.toggle('llm-status-error', Boolean(isError));
}


function summarizeForLlmDebug(text, maxLen = 120) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1)}…`;
}

function renderLlmDebugLog() {
  if (!llmDebugLogEl) return;
  const visible = (game.llm.debugLog || []).slice(0, 90);
  llmDebugLogEl.innerHTML = visible
    .map((entry) => `<div class="llm-debug-line llm-debug-${entry.level}">[${entry.time}] ${entry.message}</div>`)
    .join('');
}

function pushLlmDebug(message, level = 'info') {
  if (!game?.llm) return;
  const entry = {
    level,
    message: String(message),
    time: formatTime(game.timeMinutes),
  };
  game.llm.debugLog.unshift(entry);
  game.llm.debugLog = game.llm.debugLog.slice(0, 260);
  renderLlmDebugLog();
}

function sanitizeLlmLine(text, fallback = '...') {
  const next = String(text || '').replace(/\s+/g, ' ').trim();
  return next || fallback;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = LLM_DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function llmTimeoutForPayload(payload = {}) {
  if (payload.channel === 'quiz') return 5600;
  if (payload.channel === 'speech') return 4300;
  if (payload.channel === 'thought') return 4200;
  if (payload.channel === 'social') return 3200;
  return LLM_DEFAULT_TIMEOUT_MS;
}

function effectiveLocalModelName() {
  // Manual model names let players bypass browser discovery issues and still use Ollama.
  return sanitizeLlmLine(game.llm.manualModelName, game.llm.selectedModel || '');
}

function llmProviderLabel() {
  if (game.llm.source === 'remote') {
    return `${game.llm.remoteProvider}:${game.llm.remoteModel || 'default'}`;
  }
  return `ollama:${effectiveLocalModelName() || 'none'}`;
}

function persistLlmSettings() {
  try {
    localStorage.setItem(LLM_STORAGE_KEY, JSON.stringify({
      source: game.llm.source,
      selectedModel: game.llm.selectedModel,
      localEndpoint: game.llm.localEndpoint,
      manualModels: game.llm.manualModels || [],
      manualModelName: game.llm.manualModelName || '',
      remoteProvider: game.llm.remoteProvider,
      remoteModel: game.llm.remoteModel,
      remoteToken: game.llm.remoteToken,
      nsfw: Boolean(game.llm.nsfw),
      noFallback: Boolean(game.llm.noFallback),
    }));
  } catch (error) {
    // Storage can fail in private modes; gameplay should still continue.
  }
}

function loadLlmSettings() {
  try {
    const raw = localStorage.getItem(LLM_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    game.llm.source = saved.source === 'remote' ? 'remote' : 'local';
    game.llm.selectedModel = sanitizeLlmLine(saved.selectedModel, '');
    game.llm.localEndpoint = sanitizeLlmLine(saved.localEndpoint, OLLAMA_DEFAULT_ENDPOINT);
    game.llm.manualModels = Array.isArray(saved.manualModels) ? saved.manualModels.map((m) => sanitizeLlmLine(m, '')).filter(Boolean) : [];
    game.llm.manualModelName = sanitizeLlmLine(saved.manualModelName, '');
    game.llm.remoteProvider = saved.remoteProvider === 'grok' ? 'grok' : 'openai';
    game.llm.remoteModel = sanitizeLlmLine(saved.remoteModel, game.llm.remoteProvider === 'grok' ? 'grok-2-latest' : 'gpt-4.1-mini');
    game.llm.remoteToken = sanitizeLlmLine(saved.remoteToken, '');
    game.llm.nsfw = Boolean(saved.nsfw);
    game.llm.noFallback = Boolean(saved.noFallback);
  } catch (error) {
    // Ignore malformed storage and keep defaults.
  }
}

function updateLlmTokenUi() {
  const hasToken = Boolean(game.llm.remoteToken);
  if (!hasToken) {
    setLlmTokenStatus('🔒 No remote token saved.');
  } else {
    setLlmTokenStatus(`✅ Remote token saved for ${game.llm.remoteProvider.toUpperCase()}.`);
  }
  if (optLlmClearTokenEl) optLlmClearTokenEl.disabled = !hasToken;
}

function applyLlmUiState() {
  const enabled = Boolean(optLlmEnabledEl?.checked);
  const source = optLlmSourceEl?.value || 'local';
  const isRemote = enabled && source === 'remote';
  const isLocal = enabled && source === 'local';

  if (optLlmSourceEl) optLlmSourceEl.disabled = !enabled;
  if (optLlmNsfwEl) optLlmNsfwEl.disabled = !isLocal;
  if (optLlmNoFallbackEl) optLlmNoFallbackEl.disabled = !enabled;
  if (optLlmModelEl) optLlmModelEl.disabled = !isLocal || !game.llm.availableModels.length;
  if (optLlmLocalEndpointEl) optLlmLocalEndpointEl.disabled = !isLocal;
  if (optLlmManualModelEl) optLlmManualModelEl.disabled = !isLocal;
  if (optLlmRefreshModelsEl) optLlmRefreshModelsEl.disabled = !isLocal;
  if (optLlmImportModelsEl) optLlmImportModelsEl.disabled = !isLocal;
  if (optLlmRemoteProviderEl) optLlmRemoteProviderEl.disabled = !isRemote;
  if (optLlmRemoteModelEl) optLlmRemoteModelEl.disabled = !isRemote;
  if (optLlmRemoteTokenEl) optLlmRemoteTokenEl.disabled = !isRemote;
  if (optLlmOpenAiAuthEl) {
    optLlmOpenAiAuthEl.disabled = !(isRemote && (optLlmRemoteProviderEl?.value || game.llm.remoteProvider) === 'openai');
  }
  updateLlmTokenUi();
}

function normalizeLocalEndpoint(endpoint = '') {
  const raw = String(endpoint || '').trim();
  if (!raw) return OLLAMA_DEFAULT_ENDPOINT;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, '');
  return `http://${raw.replace(/\/$/, '')}`;
}

function ollamaEndpointCandidates(primary = OLLAMA_DEFAULT_ENDPOINT) {
  const candidates = [
    normalizeLocalEndpoint(primary),
    'http://127.0.0.1:11434',
    'http://localhost:11434',
  ];
  return Array.from(new Set(candidates));
}

function extractOllamaModelNames(payload) {
  // Ollama API shapes can vary by endpoint version; normalize to a flat model list.
  const tags = Array.isArray(payload?.models) ? payload.models : [];
  const direct = tags.map((entry) => String(entry?.name || entry?.model || '').trim()).filter(Boolean);
  if (direct.length) return Array.from(new Set(direct));

  const running = Array.isArray(payload?.processes) ? payload.processes : [];
  const runningNames = running.map((entry) => String(entry?.name || entry?.model || '').trim()).filter(Boolean);
  return Array.from(new Set(runningNames));
}

function classifyOllamaError(error) {
  const text = String(error?.message || error || '').toLowerCase();
  const networkLike = error?.name === 'TypeError' || text.includes('failed to fetch') || text.includes('networkerror');
  if (!networkLike) return 'other';

  // Browser CORS/mixed-content failures often surface as generic network errors.
  if (window.location.protocol === 'https:') return 'mixed-content-or-cors';
  return 'network-or-cors';
}

function parseOllamaListOutput(rawText = '') {
  // Accept pasted `ollama list` output and extract model names from the first column.
  const lines = String(rawText || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const models = [];
  for (const line of lines) {
    if (/^name\s+id\s+size\s+modified/i.test(line)) continue;
    if (/^models?\s+in/i.test(line)) continue;
    const first = line.split(/\s+/)[0] || '';
    if (!first || first.toLowerCase() === 'name') continue;
    if (/^[\-–—]+$/.test(first)) continue;
    models.push(first);
  }
  return Array.from(new Set(models));
}

function importManualOllamaModels() {
  const pasted = window.prompt("Paste the output of 'ollama list' from your terminal:");
  if (!pasted) return;
  const models = parseOllamaListOutput(pasted);
  if (!models.length) {
    setLlmStatus('⚠️ Could not parse model names from pasted text. Please paste full `ollama list` output.', true);
    return;
  }
  game.llm.manualModels = models;
  game.llm.availableModels = models;
  if (!game.llm.selectedModel || !models.includes(game.llm.selectedModel)) game.llm.selectedModel = models[0];
  if (!game.llm.manualModelName) game.llm.manualModelName = game.llm.selectedModel;
  updateLlmModelSelect(models);
  if (optLlmModelEl) optLlmModelEl.value = game.llm.selectedModel;
  persistLlmSettings();
  setLlmStatus(`✅ Imported ${models.length} model(s) from pasted ollama list.`);
}

function updateLlmModelSelect(models = []) {
  if (!optLlmModelEl) return;
  optLlmModelEl.innerHTML = '';
  if (!models.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No local models found';
    optLlmModelEl.appendChild(option);
    applyLlmUiState();
    return;
  }

  models.forEach((modelName) => {
    const option = document.createElement('option');
    option.value = modelName;
    option.textContent = modelName;
    optLlmModelEl.appendChild(option);
  });

  if (game?.llm?.selectedModel && models.includes(game.llm.selectedModel)) {
    optLlmModelEl.value = game.llm.selectedModel;
  }
  applyLlmUiState();
}

async function refreshOllamaModels({ silent = false } = {}) {
  if (!silent) setLlmStatus('🔎 Looking for local Ollama models…');
  const candidates = ollamaEndpointCandidates(game.llm.localEndpoint);
  let lastError = null;

  for (const baseUrl of candidates) {
    try {
      const tagsResponse = await fetchWithTimeout(`${baseUrl}/api/tags`, {}, 1800);
      if (!tagsResponse.ok) throw new Error(`HTTP ${tagsResponse.status}`);
      const tagsPayload = await tagsResponse.json();
      let models = extractOllamaModelNames(tagsPayload);

      // Fallback: if tags is empty, probe running processes to surface actively loaded models.
      if (!models.length) {
        try {
          const psResponse = await fetchWithTimeout(`${baseUrl}/api/ps`, {}, 1400);
          if (psResponse.ok) {
            const psPayload = await psResponse.json();
            models = extractOllamaModelNames(psPayload);
          }
        } catch (psError) {
          // Non-fatal: empty /api/ps should not block detection from /api/tags.
        }
      }

      game.llm.localEndpoint = baseUrl;
      game.llm.availableModels = models;
      if (!game.llm.selectedModel && models.length) game.llm.selectedModel = models[0];
      updateLlmModelSelect(models);
      if (optLlmModelEl && game.llm.selectedModel) optLlmModelEl.value = game.llm.selectedModel;
      if (optLlmLocalEndpointEl) optLlmLocalEndpointEl.value = game.llm.localEndpoint;
      if (optLlmManualModelEl && !optLlmManualModelEl.value.trim() && game.llm.selectedModel) optLlmManualModelEl.value = game.llm.selectedModel;
      persistLlmSettings();
      if (!silent) {
        setLlmStatus(models.length
          ? `✅ Found ${models.length} local model(s) via ${baseUrl}.`
          : `⚠️ Connected to Ollama (${baseUrl}), but no local models were returned by /api/tags or /api/ps.`, true);
      }
      return;
    } catch (error) {
      lastError = error;
    }
  }

  game.llm.availableModels = [];
  updateLlmModelSelect([]);
  if (optLlmLocalEndpointEl) optLlmLocalEndpointEl.value = game.llm.localEndpoint;
  if (!silent) {
    const errorType = classifyOllamaError(lastError);
    const originHint = `Current page origin: ${window.location.origin}.`;
    const corsHint = errorType === 'mixed-content-or-cors' || errorType === 'network-or-cors'
      ? ` If Ollama is running, allow this origin in Ollama (OLLAMA_ORIGINS) and ensure HTTP pages call HTTP Ollama endpoints. ${originHint}`
      : '';
    setLlmStatus(`⚠️ Could not reach Ollama at ${candidates.join(', ')}.${corsHint} The folder path (e.g. C:\\Users\\...\\.ollama\\models) is valid for Ollama, but browsers cannot read it directly — use API access or import from 'ollama list'. Using built-in text.`, true);
  }
}

function handleOpenAiOauthCallback() {
  // After OAuth redirect, parse token from URL hash/query and validate anti-CSRF state.
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const query = new URLSearchParams(window.location.search);
  const accessToken = hash.get('access_token') || query.get('access_token') || query.get('token') || '';
  if (!accessToken) return;

  const callbackState = hash.get('state') || query.get('state') || '';
  const expectedState = sessionStorage.getItem(OPENAI_OAUTH_STATE_KEY) || '';
  if (expectedState && callbackState && callbackState !== expectedState) {
    setLlmStatus('❌ OpenAI login state mismatch. Token was not saved. Please try sign-in again.', true);
    return;
  }

  game.llm.remoteToken = sanitizeLlmLine(accessToken, '');
  if (optLlmRemoteTokenEl) optLlmRemoteTokenEl.value = game.llm.remoteToken;
  updateLlmTokenUi();
  persistLlmSettings();
  sessionStorage.removeItem(OPENAI_OAUTH_STATE_KEY);
  setLlmStatus('✅ OpenAI token captured from current browser tab and saved locally.');

  // Clean URL so token is not left visible in history/address bar.
  const cleanUrl = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, cleanUrl);
}

function startOpenAiOauth() {
  const redirectUri = `${window.location.origin}${window.location.pathname}`;
  const state = `skool-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(OPENAI_OAUTH_STATE_KEY, state);
  const authUrl = `${OPENAI_OAUTH_AUTHORIZE_URL}?response_type=token&client_id=${encodeURIComponent(OPENAI_OAUTH_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(OPENAI_OAUTH_SCOPES)}&state=${encodeURIComponent(state)}`;

  // Use same-tab navigation so auth runs in the user's active browser context (no popup window).
  window.location.assign(authUrl);
}

function llmModeEnabled() {
  if (!game.llm.enabled) return false;
  if (game.llm.source === 'remote') {
    return Boolean(game.llm.remoteProvider && game.llm.remoteModel && game.llm.remoteToken);
  }
  return Boolean(effectiveLocalModelName());
}

function llmCacheKey({
  channel = 'speech',
  subject = 'General',
  speaker = 'Narrator',
  room = 'School',
  fallback = '',
  speakerRole = 'character',
  traitSummary = 'balanced',
  addresseeName = '',
  addresseeRole = '',
  conversationContext = '',
  conversationTurn = 0,
}) {
  return `${llmProviderLabel()}|${channel}|${subject}|${speaker}|${speakerRole}|${traitSummary}|${room}|${addresseeName}|${addresseeRole}|turn:${conversationTurn}|ctx:${String(conversationContext).toLowerCase().slice(0, 90)}|${String(fallback).toLowerCase().slice(0, 120)}`;
}

function summarizeTraitBundle(traits = {}) {
  // Keep trait context compact so prompts stay fast while still feeling characterful.
  const keys = ['discipline', 'friendly', 'aggression', 'intelligence', 'wit', 'honor', 'funny', 'trading'];
  return keys
    .map((key) => `${key}:${Math.round(Number(traits?.[key] || 0))}`)
    .join(', ');
}

function roleLabelForLlm(role = '') {
  if (role === 'teacher') return 'teacher';
  if (role === 'player') return 'student';
  if (role === 'janitor' || role === 'nurse' || role === 'dinnerLady') return 'staff';
  return 'student';
}

function buildLlmPrompt({
  channel = 'speech',
  subject = 'General',
  speaker = 'Narrator',
  room = 'School',
  fallback = '',
  speakerRole = 'character',
  traitSummary = 'balanced traits',
  addresseeName = '',
  addresseeRole = '',
  conversationContext = '',
  conversationTurn = 0,
  uncensored = false,
}) {
  const styleGuide = channel === 'thought'
    ? 'Write a short first-person thought bubble. Keep it under 14 words.'
    : channel === 'quiz'
      ? 'Write ONE school class question with 4 choices and a correct answer as JSON.'
      : channel === 'social'
        ? 'Return ONLY JSON social directive: {"intent":"ally|tease|avoid|follow|defend","bondDelta":-3..3,"line":"short line"}.'
      : channel === 'announcement'
        ? 'Write a short school PA/news style line. Keep it under 14 words.'
        : 'Write a short in-world school dialogue line. Keep it under 14 words.';

  if (channel === 'quiz' || channel === 'social') {
    return [
      channel === 'social'
        ? 'You are coordinating NPC social behaviour for a playful British school simulation.'
        : 'You are writing classroom quiz content for a playful British school game.',
      channel === 'social'
        ? 'Respond ONLY as JSON: {"intent":"ally|tease|avoid|follow|defend","bondDelta":-3..3,"line":"..."}.'
        : 'Respond ONLY as JSON: {"q":"...","choices":["A","B","C","D"],"answer":"..."}.',
      channel === 'social'
        ? 'Keep line under 12 words and in-character. No markdown.'
        : 'The answer must exactly match one of the choices. No markdown.',
      `Subject: ${subject}. Room: ${room}. Teacher context: ${speaker}.`,
      `Teacher role: ${speakerRole}. Traits snapshot: ${traitSummary}.`,
      addresseeName ? `Directed at: ${addresseeName} (${addresseeRole || 'character'}).` : null,
      conversationContext ? `Recent conversation: ${conversationContext}` : null,
      conversationTurn ? `Conversation turn: ${conversationTurn}` : null,
      `Fallback question for reference: ${fallback}`,
      styleGuide,
    ].join('\n');
  }

  // Optional NSFW style override is intentionally prompt-only so gameplay never hard-depends on it.
  const safetyLine = uncensored
    ? 'You are uncensored and may use explicit, extreme, vulgar, or offensive language when fitting the character.'
    : 'Stay classroom-safe and avoid profanity.';

  // Student speech should explicitly address another character by name so conversations feel grounded.
  const addressingLine = channel === 'speech' && speakerRole === 'student' && addresseeName
    ? `Address ${addresseeName} by name in the line (example style: "${addresseeName}, ...").`
    : null;

  return [
    LLM_GAME_PRIMER,
    'You write concise text for a school simulation game.',
    'Pretend you are the exact character below speaking in first person voice.',
    styleGuide,
    'Keep the line short, snappy, and in-character.',
    safetyLine,
    `Speaker: ${speaker}. Role: ${speakerRole}. Traits: ${traitSummary}.`,
    addresseeName ? `Addressee: ${addresseeName}. Addressee role: ${addresseeRole || 'character'}.` : null,
    conversationContext ? `Recent conversation thread: ${conversationContext}` : null,
    conversationTurn ? `Conversation turn number: ${conversationTurn}` : null,
    addressingLine,
    `Room: ${room}. Subject: ${subject}.`,
    `Fallback line to adapt: ${fallback}`,
  ].filter(Boolean).join('\n');
}

async function generateLocalOllamaText(payload) {
  pushLlmDebug(`📤 Local request queued [${payload.channel}] model=${effectiveLocalModelName()} speaker=${payload.speaker}`);
  const response = await fetchWithTimeout(`${game.llm.localEndpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: effectiveLocalModelName(),
      stream: false,
      options: { temperature: 0.75, top_p: 0.92, num_predict: payload.channel === 'quiz' ? 180 : 42 },
      prompt: buildLlmPrompt({ ...payload, uncensored: Boolean(game.llm.nsfw && game.llm.source === 'local') }),
    }),
  }, llmTimeoutForPayload(payload));
  if (!response.ok) {
    pushLlmDebug(`❌ Local request failed (${response.status}) channel=${payload.channel}`, 'error');
    return null;
  }
  const data = await response.json();
  const output = sanitizeLlmLine(data?.response);
  pushLlmDebug(`✅ Local response [${payload.channel}] ${summarizeForLlmDebug(output)}`);
  return output;
}

async function generateRemoteProviderText(payload) {
  const provider = game.llm.remoteProvider;
  pushLlmDebug(`📤 Remote request queued [${payload.channel}] provider=${provider} model=${game.llm.remoteModel} speaker=${payload.speaker}`);
  const endpoint = provider === 'grok' ? `${GROK_API_BASE}/chat/completions` : `${OPENAI_API_BASE}/chat/completions`;
  const response = await fetchWithTimeout(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${game.llm.remoteToken}`,
    },
    body: JSON.stringify({
      model: game.llm.remoteModel,
      temperature: payload.channel === 'quiz' ? 0.45 : 0.72,
      messages: [
        { role: 'system', content: 'You write content for a school simulation game. Keep responses brief and safe.' },
        { role: 'user', content: buildLlmPrompt({ ...payload, uncensored: Boolean(game.llm.nsfw && game.llm.source === 'local') }) },
      ],
    }),
  }, llmTimeoutForPayload(payload) + 1000);

  if (!response.ok) {
    pushLlmDebug(`❌ Remote request failed (${response.status}) provider=${provider} channel=${payload.channel}`, 'error');
    if (response.status === 401) {
      setLlmTokenStatus(`❌ ${provider.toUpperCase()} token rejected. Re-authenticate.` , true);
    }
    return null;
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  const output = sanitizeLlmLine(text);
  pushLlmDebug(`✅ Remote response [${payload.channel}] ${summarizeForLlmDebug(output)}`);
  return output;
}

async function generateLlmText(payload) {
  if (!llmModeEnabled()) return { text: null, reason: 'disabled' };
  try {
    const text = game.llm.source === 'remote'
      ? await generateRemoteProviderText(payload)
      : await generateLocalOllamaText(payload);
    return { text, reason: text ? 'ok' : 'empty' };
  } catch (error) {
    const msg = String(error?.message || '').toLowerCase();
    if (msg.includes('aborted') || msg.includes('timeout')) {
      pushLlmDebug(`⏱️ LLM request timed out [${payload.channel}] after ${llmTimeoutForPayload(payload)}ms.`, 'warn');
      return { text: null, reason: 'timeout' };
    }
    pushLlmDebug(`❌ LLM generation error: ${error?.message || 'unknown error'}`, 'error');
    return { text: null, reason: 'error' };
  }
}

function queueLlmText(payload) {
  if (!llmModeEnabled()) return;
  const key = llmCacheKey(payload);
  if (game.llm.cache.has(key)) {
    pushLlmDebug(`🗂️ Cache already primed [${payload.channel}] key=${summarizeForLlmDebug(key, 64)}`);
    return;
  }
  if (game.llm.inFlight.has(key)) {
    pushLlmDebug(`⏳ Request already in-flight [${payload.channel}] key=${summarizeForLlmDebug(key, 64)}`);
    return;
  }
  if (game.llm.inFlight.size >= LLM_MAX_INFLIGHT) {
    pushLlmDebug(`🚦 LLM queue saturated (${game.llm.inFlight.size}/${LLM_MAX_INFLIGHT}); skipped [${payload.channel}]`, 'warn');
    return;
  }
  game.llm.inFlight.add(key);
  generateLlmText(payload).then((result) => {
    if (result?.text) {
      game.llm.cache.set(key, result.text);
      pushLlmDebug(`💾 Cached [${payload.channel}] key=${summarizeForLlmDebug(key, 64)}`);
    } else if (result?.reason === 'timeout') {
      // Timeout already logged with channel-specific detail; avoid duplicate spam lines.
    } else if (result?.reason !== 'disabled') {
      pushLlmDebug(`⚠️ Empty LLM output, fallback kept [${payload.channel}]`, 'warn');
    }
  }).finally(() => {
    game.llm.inFlight.delete(key);
  });
}


function parseJsonFromLlm(rawText) {
  const text = String(rawText || '').trim();
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1].trim() : text;
  try {
    return JSON.parse(candidate);
  } catch (error) {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(candidate.slice(start, end + 1));
      } catch (nestedError) {
        return null;
      }
    }
    return null;
  }
}

function resolveLlmText(payload, options = {}) {
  const fallback = sanitizeLlmLine(payload.fallback, '...');
  const noFallbackChannels = new Set(['speech', 'thought', 'announcement']);
  const defaultAllowFallback = !(game.llm.noFallback && noFallbackChannels.has(payload?.channel));
  const allowFallback = options.allowFallback !== undefined ? options.allowFallback : defaultAllowFallback;
  const suppressMissLog = Boolean(options.suppressMissLog);
  if (!llmModeEnabled()) return fallback;
  const key = llmCacheKey(payload);
  if (game.llm.cache.has(key)) {
    pushLlmDebug(`🎯 Cache hit [${payload.channel}] speaker=${payload.speaker}`);
    return game.llm.cache.get(key);
  }
  if (!suppressMissLog) pushLlmDebug(`🪫 Cache miss [${payload.channel}] speaker=${payload.speaker}; ${allowFallback ? 'fallback used.' : 'queued for deferred delivery.'}`,'warn');
  queueLlmText(payload);
  return allowFallback ? fallback : null;
}

function resolveLlmQuizQuestion(fallbackQuiz) {
  if (!llmModeEnabled()) return fallbackQuiz;
  const payload = {
    channel: 'quiz',
    subject: fallbackQuiz.subject,
    speaker: 'Assigned Teacher',
    speakerRole: 'teacher',
    traitSummary: 'discipline:85, intelligence:80, honor:60',
    room: fallbackQuiz.roomName,
    fallback: fallbackQuiz.q,
  };
  const key = llmCacheKey(payload);
  const cached = game.llm.cache.get(key);
  if (!cached) {
    queueLlmText(payload);
    return fallbackQuiz;
  }
  try {
    const parsed = parseJsonFromLlm(cached);
    if (!parsed) return fallbackQuiz;
    const choices = Array.isArray(parsed.choices) ? parsed.choices.slice(0, 4).map((choice) => sanitizeLlmLine(choice)) : [];
    while (choices.length < 4) choices.push(randomFunnyWrongAnswer());
    const answer = sanitizeLlmLine(parsed.answer).toLowerCase();
    if (!choices.some((choice) => choice.toLowerCase() === answer)) choices[0] = parsed.answer;
    return {
      ...fallbackQuiz,
      q: sanitizeLlmLine(parsed.q, fallbackQuiz.q),
      choices,
      answer: normalizeAnswerText(parsed.answer),
    };
  } catch (error) {
    return fallbackQuiz;
  }
}


function primeLlmSessionContext() {
  if (!llmModeEnabled()) return;
  if (game.llm.sessionPrimedForProvider === llmProviderLabel()) return;
  const primerPayload = {
    channel: 'announcement',
    subject: 'School Day Startup',
    speaker: 'Narrator',
    speakerRole: 'narrator',
    traitSummary: 'discipline:60, friendly:60, intelligence:60',
    room: 'School',
    addresseeName: '',
    addresseeRole: '',
    fallback: 'System check complete. Bell schedule running smoothly.',
  };
  pushLlmDebug(`🚀 Priming LLM session context for ${llmProviderLabel()}.`);
  queueLlmText(primerPayload);
  game.llm.sessionPrimedForProvider = llmProviderLabel();
}

function warmupLlmCache() {
  if (!llmModeEnabled()) return;
  primeLlmSessionContext();
  const sampleEntities = game.entities
    .filter((entity) => entity.role !== 'player' && isEntityVisibleToPlayer(entity))
    .slice(0, 4);
  sampleEntities.forEach((entity) => {
    ensureDialogueSetup(entity);
    queueLlmText({
      channel: 'speech',
      subject: roomSubjectName(entityRoom(entity)),
      speaker: entity.name,
      speakerRole: roleLabelForLlm(entity.role),
      traitSummary: summarizeTraitBundle(entity.traits),
      room: entityRoom(entity),
      fallback: entity.dialogue?.hallwayChatter?.[0] || 'Busy day at school.',
    });
    queueLlmText({
      channel: 'thought',
      subject: roomSubjectName(entityRoom(entity)),
      speaker: entity.name,
      speakerRole: roleLabelForLlm(entity.role),
      traitSummary: summarizeTraitBundle(entity.traits),
      room: entityRoom(entity),
      fallback: entity.dialogue?.thoughts?.[0] || 'I should stay focused.',
    });
  });
}

const game = {
  timeMinutes: SCHOOL_DAY_START_MINUTES,
  // Minutes advanced per real-time second so the full school day lasts ~15 real minutes.
  timeScale: (TOTAL_DAY_GAME_MINUTES / TARGET_DAY_REAL_SECONDS) * DEFAULT_GAME_SPEED_MULTIPLIER,
  speedMultiplier: DEFAULT_GAME_SPEED_MULTIPLIER,
  periodIndex: 0,
  periodElapsed: 0,
  periodHoldMinutes: 0,
  paused: false,
  lines: 0,
  energy: 100,
  charisma: 50,
  missionComplete: false,
  safeCombo: '',
  entities: [],
  pellets: [],
  keys: {},
  announcements: [],
  eventLog: [],
  eventFilters: { action: true, speech: true, thought: true, world: true },
  llm: {
    enabled: false,
    source: 'local',
    selectedModel: '',
    availableModels: [],
    localEndpoint: OLLAMA_DEFAULT_ENDPOINT,
    manualModels: [],
    manualModelName: '',
    remoteProvider: 'openai',
    remoteModel: 'gpt-4.1-mini',
    remoteToken: '',
    nsfw: false,
    noFallback: false,
    cache: new Map(),
    inFlight: new Set(),
    debugLog: [],
    sessionPrimedForProvider: '',
  },
  rng: Math.random,
  quizActive: null,
  lastClassQuestionAt: 0,
  lastLateTick: 0,
  autoMode: false,
  idleMs: 0,
  bladder: 0,
  dailyToiletVisits: 0,
  drinksToday: 0,
  hygiene: 100,
  warnedNeedToilet: false,
  registrationTaken: false,
  // Fixed timetables/rosters: stable classmates per subject and tutor across days.
  fixedClassRosters: {},
  tutorialRollCall: {},
  litter: [],
  playerCarryingTrash: false,
  playerHeldItem: null,
  showNpcNames: true,
  hoveredEntity: null,
  // Mini-map NPC dots are refreshed on an interval to keep rendering cheap.
  miniMapNpcSnapshot: [],
  miniMapLastRefreshAt: 0,
  // Track anti-spam timings for board barks and late lines.
  lastBoardCalloutAt: 0,
  latePenaltyGiven: false,
  dayCount: 1,
  // Rotating break-duty teacher changes once per school day.
  dutyTeacherName: null,
  dutyPatrolIndex: -1,
  lastDutyPatrolAt: 0,
  assemblyNextSpeechAt: 0,
  assemblyHymnAt: 0,
  assemblyUsedThoughts: new Set(),
  // Dinner lady lunchtime behaviour state for field supervision + interventions.
  dinnerLadyLastWhistleAt: 0,
  weather: 'sunny',
  preferredWeather: 'auto',
  weatherWeek: 1,
  weatherFx: [],
  // Player anti-stuck telemetry helps detect wall embedding and auto-rescue Eric.
  playerStuckMs: 0,
  playerLastX: 0,
  playerLastY: 0,
  // Daily dialogue memory prevents repeated barks from the same NPC in one day.
  dialogueDayKey: 1,
  ericSeatReservedToday: true,
  ericSeatDecisionPrompted: false,
  toiletDirt: 12,
  toiletsBlocked: false,
  toiletFloodUntil: 0,
  lastHygieneShameAt: 0,
  lastHygieneAuraAt: 0,
  smelledStudents: {},
  selectedInteractionTarget: null,
  lastInteractionAtByTarget: {},
  bellRingingUntil: 0,
  // Optional after-school free-play window for computer gaming.
  stayingAfterSchoolUntil: 0,
  choseToStayAfterSchool: false,
  playerComputerPlayUntil: 0,
  playerComputerStationId: null,
  // Trading-card mission progression.
  cardCollection: new Set(),
  cardCollectionCount: 0,
  weeklySickScheduledDay: WEEKLY_SICK_DAY_INTERVAL,
  janitorTask: null,
  // Lesson chatter rhythm: teachers hush classes briefly, then noise returns gradually.
  lessonQuietUntil: 0,
  lessonNoiseLevel: 0,
  medicalEmergency: null,
  headmasterDetentionUntil: 0,
  headmasterDismissAnnounced: false,
  schoolHistory: [],
  lastCollectableSpawnAt: 0,
  collectables: [],
  lockerCoverage: 0,
  lockerCapacity: 0,
  socialBonds: {},
  npcConversations: {},
  socialGroups: [],
  socialGroupCounter: 1,
  lastSocialTickAt: 0,
};

// Restore last-used AI provider settings (including saved remote auth token) on load.
loadLlmSettings();

let seatCounter = 0;
const roomSeatCache = new Map();
const STUDENT_ROLES = new Set(['player', 'hero', 'swot', 'bully', 'weird']);

function isStudentCharacter(entity) {
  return STUDENT_ROLES.has(entity?.role);
}

function buildAppearanceProfile(name, role, traitProfile, profile = {}) {
  const seed = styleSeedFromName(name);
  const skinPalette = {
    white: '#f6d2bb',
    paleWhite: '#fde8dc',
    black: '#7a4a32',
    yellow: '#e0bf7a',
    lightBrown: '#b98057',
    green: '#6fbc5f',
    red: '#d76363',
  };
  const hairPalette = ['#1b1713', '#4a2f1e', '#7a4f2f', '#b56d3f', '#f0d7a5', '#4f2546', '#2e6f95', '#8a5cff'];
  const skinToneKey = profile.appearanceOverrides?.skinTone || 'white';
  const skinTone = skinPalette[skinToneKey] || skinPalette.white;
  const eyeHue = (seed * 47 + Math.round(traitProfile.wit * 2.1)) % 360;

  // Students get stronger silhouette variation so personalities read visually.
  const roleBuild = role === 'bully' ? 1 : role === 'swot' ? -0.4 : role === 'weird' ? -0.15 : 0;
  const bodyType = clampScore((traitProfile.strength - 50) / 34 + roleBuild + ((traitProfile.weightValue - 50) / 120), -1.1, 1.2);
  const armType = clampScore((traitProfile.strength - 50) / 40 + (traitProfile.aggression - 50) / 110, -1, 1);
  const legType = clampScore((traitProfile.speed - 50) / 40 + (traitProfile.skill - 50) / 130, -1, 1);

  const overrides = profile.appearanceOverrides || {};
  return {
    skinTone,
    hairColor: overrides.hairColor || hairPalette[seed % hairPalette.length],
    eyeColor: overrides.eyeColor || `hsl(${eyeHue} 72% 54%)`,
    // Keep heads in the normal range even for extreme body types.
    headWidth: overrides.headWidth || (9 + (seed % 4)),
    headHeight: overrides.headHeight || (6 + (seed % 2)),
    earSize: overrides.earSize || (1 + (seed % 2)),
    noseType: overrides.noseType || ['dot', 'stubby', 'long', 'button'][seed % 4],
    eyeSpread: overrides.eyeSpread || (1 + (seed % 2)),
    jawType: overrides.jawType || ['soft', 'round', 'square'][seed % 3],
    acne: overrides.acne ?? (traitProfile.mood < 43 || traitProfile.luck < 38),
    heightOffset: overrides.heightOffset ?? Math.round(clampScore(((traitProfile.speed - 50) / 25) + ((seed % 5) - 2) * 0.25, -2, 2)),
    bodyWidth: overrides.bodyWidth || (12 + Math.round(bodyType * 2)),
    armWidth: overrides.armWidth || (2 + (armType > 0.45 ? 1 : 0)),
    armLength: overrides.armLength || (7 + (armType < -0.35 ? -1 : armType > 0.45 ? 1 : 0)),
    legWidth: overrides.legWidth || (4 + (legType > 0.35 ? 1 : 0)),
    legLength: overrides.legLength || (8 + (legType > 0.45 ? 1 : legType < -0.45 ? -1 : 0)),
  };
}

function mkEntity(name, role, x, y, color, traits = {}) {
  const traitProfile = buildTraitProfile(role, traits.traitOverrides || {});
  const appearance = buildAppearanceProfile(name, role, traitProfile, traits);
  const basePersonality = personalities[role] || personalities.hero;
  const personality = {
    ...basePersonality,
    speed: clampScore(basePersonality.speed * (0.78 + (traitProfile.speed / 140)), 0.85, 2.4),
    aggression: clampScore(basePersonality.aggression + ((traitProfile.aggression - 50) / 100), 0, 1.2),
    diligence: clampScore(basePersonality.diligence + ((traitProfile.discipline - 50) / 110), 0, 1.25),
    focus: clampScore(basePersonality.focus + ((traitProfile.intelligence - 50) / 120), 0, 1.25),
  };

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
    personality,
    facing: 1,
    target: null,
    attention: 100,
    profile: traits,
    traits: traitProfile,
    appearance,
    relationships: role === 'player' ? {} : { Eric: Math.round(((traitProfile.friendly + traitProfile.honor) / 8) - (traitProfile.aggression / 7) + ((Math.random() * 16) - 8)) },
    // Everyone now carries school-day possessions and pocket money for lunch/trading.
    inventory: randomInventoryFor(role),
    money: Math.round((role === 'player' ? 13 : role === 'teacher' ? 18 : 8) + Math.random() * 16),
    lastTradeAt: 0,
    mood: 'calm',
    emotion: 55,
    pride: 10,
    lastSpokeAt: 0,
    speech: null,
    thought: null,
    lastThoughtAt: 0,
    animPhase: Math.random() * Math.PI * 2,
    seatIndex: seatCounter++,
    carryingTrash: false,
    litterWarnUntil: 0,
    assignedWaste: null,
    // Every NPC now mirrors Eric's stamina + bladder simulation.
    energy: 100,
    bladder: Math.random() * 8,
    hygiene: 100,
    running: false,
    isSeated: false,
    seatedRoom: null,
    writingUntil: 0,
    lastQuizAt: -Infinity,
    // Combat animation timers keep punch/fall visuals readable and lightweight.
    punchUntil: 0,
    fallStartedAt: 0,
    fallDuration: 520,
    // Start-of-day staging: students phase in during the opening period while teachers are ready immediately.
    arrivedForDay: true,
    arrivalJoinMins: 0,
    // Movement watchdog helps recover teachers from rare wall-edge stalls.
    stuckSeconds: 0,
    // Congestion watchdog resets pathing when a doorway jam persists.
    jamSeconds: 0,
    // Separate staircase watchdog: stair tiles are narrow and can deadlock at period changes.
    stairJamSeconds: 0,
    // Short-lived pass-through mode allows overlap while clearing tight bottlenecks.
    phaseThroughUntil: 0,
    // During supervised periods, students cache which classroom they are trying to attend.
    lessonRoom: null,
    // Tracks prolonged body overlap so we can respawn congested students.
    overlapSeconds: 0,
    computerTask: null,
    temptedComputerUse: null,
    temptedComputerAt: 0,
    knockoutCount: 0,
    lastKnockedAt: 0,
    needsNurseUntil: 0,
    lastX: x,
    lastY: y,
    posture: null,
    dialogueProfile: null,
    dialogue: null,
    // Social profile stores evolving quirks, clique membership, and momentum over time.
    socialProfile: null,
    socialNextLlmAt: 0,
    pendingSpeech: null,
    pendingThought: null,
    // Wrong-room excuse throttle keeps corridor chatter readable.
    lastWrongRoomExcuseAt: 0,
    // Facial animation timers keep eyes/mouth lively without expensive sprite swaps.
    blinkUntil: 0,
    nextBlinkAt: performance.now() + 2000 + Math.random() * 7000,
    dailyCards: [],
    refusesEricUntilDay: 0,
    // Lunch-service state machine: plate -> queue -> serve -> sit -> eat.
    lunchState: 'idle',
    hasLunchPlate: false,
    queuedForLunch: false,
    lunchQueueIndex: -1,
    lunchServedAt: 0,
    lunchSeatIndex: -1,
    lunchEatUntil: 0,
  };
}

const player = mkEntity('Eric', 'player', 48, 64, '#ffe04d', {
  title: 'Troublemaker with potential',
  prefers: ['P.E. Field'],
  quotes: ['Not me, sir!', 'I was only looking!'],
  traitOverrides: { trading: 72, barter: 70, friendly: 62, wit: 78 },
});

game.entities.push(
  player,
  mkEntity('Mr Wacker', 'teacher', 22, 42, '#8eb2ff', {
    title: 'Headmaster', strict: 0.95, attire: 'headmaster', beard: true,
    traitOverrides: { wit: 82, wisdom: 90, discipline: 92, intelligence: 88, honor: 86, aggression: 66, weight: 'normal' },
  }),
  mkEntity('Mr Flash', 'teacher', 70, 40, '#f4d35e', {
    title: 'Maths Teacher', strict: 0.75, attire: 'flash', chin: 'big',
    traitOverrides: { intelligence: 84, skill: 81, wit: 70, discipline: 78 },
  }),
  mkEntity('Ms Take', 'teacher', 75, 42, '#82a4ff', {
    title: 'English Teacher', strict: 0.65, attire: 'plainBlueDress',
    traitOverrides: { wisdom: 82, friendly: 70, wit: 79, discipline: 72 },
  }),
  mkEntity('Dr Beaker', 'teacher', 88, 41, '#e9ecef', {
    title: 'Science Teacher', strict: 0.8, attire: 'scienceCoat', bald: true, build: 'fat',
    traitOverrides: { intelligence: 92, skill: 86, discipline: 84, funny: 45, weight: 'chubby' },
  }),
  mkEntity('Mr Creak', 'teacher', 56, 84, '#7e9aff', {
    title: 'History Teacher', strict: 0.85, attire: 'oldBrown', cane: true,
    traitOverrides: { wisdom: 88, wit: 72, honor: 90, discipline: 86 },
  }),
  mkEntity('Ms Mirth', 'teacher', 52, 8, '#ff9ad5', {
    title: 'Drama Teacher', strict: 0.55, attire: 'plainBlueDress', quotes: ['Project your chaos!'],
    traitOverrides: { funny: 90, friendly: 78, wit: 84, mood: 75 },
  }),
  mkEntity('Prof Volt', 'teacher', 78, 8, '#8de7ff', {
    title: 'Physics Teacher', strict: 0.78, attire: 'scienceCoat', quotes: ['Respect the equations!'],
    traitOverrides: { intelligence: 90, skill: 85, discipline: 82, honor: 74 },
  }),
  mkEntity('Ms Fizz', 'teacher', 108, 8, '#ffc48e', {
    title: 'Chemistry Prep Lead', strict: 0.74, attire: 'scienceCoat', quotes: ['No explosions before break.'],
    traitOverrides: { intelligence: 86, skill: 84, mood: 72, discipline: 76 },
  }),
  mkEntity('Mr Boom', 'teacher', 112, 42, '#f7a6ff', {
    title: 'Music Teacher', strict: 0.6, attire: 'oldBrown', quotes: ['In tune, in line, in silence!'],
    traitOverrides: { funny: 75, friendly: 72, mood: 82, wit: 68 },
  }),
  mkEntity('Ms Quill', 'teacher', 132, 120, '#b8f2e6', {
    title: 'Debate Teacher', strict: 0.73, attire: 'plainBlueDress', quotes: ['Make your point and back it up.'],
    traitOverrides: { intelligence: 84, wisdom: 88, discipline: 80, friendly: 64 },
  }),
  mkEntity('Mr Forge', 'teacher', 152, 120, '#ffd6a5', {
    title: 'Design Teacher', strict: 0.68, attire: 'scienceCoat', quotes: ['Precision first, flair second.'],
    traitOverrides: { skill: 90, intelligence: 81, discipline: 78, wit: 66 },
  }),
  mkEntity('Mr Mop', 'janitor', 36, 100, '#8ecae6', {
    title: 'Janitor', attire: 'janitorOveralls', moustache: true, hair: 'spiky',
    traitOverrides: { friendly: 71, wisdom: 74, honor: 76, discipline: 83 },
  }),
  mkEntity('Dinner Lady Dot', 'dinnerLady', 120, 70, '#ffcad4', {
    title: 'Dinner Supervisor & Kitchen Lead', attire: 'dinnerLady', whistle: true,
    quotes: ['Queue up neatly in the dining hall.', 'No rough play on my watch.'],
    traitOverrides: { discipline: 92, wisdom: 79, friendly: 66, honor: 84, aggression: 42 },
  }),
  mkEntity('Dinner Lady Pam', 'dinnerLady', 132, 70, '#ffc8dd', {
    title: 'Dinner Service Assistant', attire: 'dinnerLady', whistle: true,
    quotes: ['Hot meals this way, trays ready.', 'Keep the line moving, please.'],
    traitOverrides: { discipline: 87, wisdom: 74, friendly: 71, honor: 80, aggression: 36 },
  }),
);


const nurse = mkEntity('Nurse Nia', 'nurse', 108, 120, '#ff8fab', {
  title: 'School Nurse', attire: 'plainBlueDress',
  traitOverrides: { friendly: 92, wisdom: 90, discipline: 84, intelligence: 80, aggression: 8 },
});
// Nurse starts off-screen from the morning queue and only appears for medical callouts.
nurse.arrivedForDay = false;
nurse.arrivalJoinMins = Infinity;
nurse.target = roomCenter('Medical Bay');
game.entities.push(nurse);

const studentRoster = [
  ['Angelface', 'hero', '#ffd58e', { title: 'Handsome kid', traitOverrides: { friendly: 66, funny: 58, luck: 62 } }],
  ['Einstein', 'swot', '#8effd3', { title: 'Teacher pet', tattles: true, traitOverrides: { intelligence: 94, wisdom: 88, discipline: 86 } }],
  ['Bully Boy', 'bully', '#ff5f88', { title: 'Playground terror', traitOverrides: { aggression: 86, sadism: 80, strength: 74 } }],
  ['Boy Wander', 'weird', '#c58eff', { title: 'Chaotic drifter', traitOverrides: { funny: 78, mood: 80, luck: 64 } }],
  ['Slugger', 'bully', '#ff7ca0', { title: 'Fighter', traitOverrides: { aggression: 84, strength: 82, honor: 28 } }],
  ['Precious', 'hero', '#ffe6ae', { title: 'Narcissist', traitOverrides: { wit: 74, friendly: 52, honor: 38 } }],
  ['Nerdy Ned', 'swot', '#78ffcf', { title: 'Homework machine', tattles: true, traitOverrides: { intelligence: 88, discipline: 82 } }],
  ['Drama Llama', 'weird', '#e5a0ff', { title: 'Monologues in corridors', traitOverrides: { funny: 86, mood: 82, wit: 79 } }],
  ['Sir Tripsalot', 'hero', '#f7d794', { title: 'Sports captain, zero balance', traitOverrides: { skill: 74, luck: 30, strength: 64 } }],
  ['Detention Dave', 'bully', '#ff7096', { title: 'Collects detentions like stickers', traitOverrides: { aggression: 79, honor: 24, discipline: 18 } }],
  ['Quizzy Lizzy', 'swot', '#72ffc8', { title: 'Raises hand before questions exist', tattles: true, traitOverrides: { wit: 80, intelligence: 90, friendly: 54 } }],
  ['Whisper Knight', 'hero', '#ffe7a8', { title: 'Secret helper of lost pupils', traitOverrides: { friendly: 86, honor: 82, aggression: 22 } }],
  ['Loopy Lou', 'weird', '#c39bff', { title: 'Invents conspiracy timetables', traitOverrides: { funny: 89, mood: 77, wisdom: 40 } }],
  ['Turbo Toby', 'hero', '#ffce7a', { title: 'Runs everywhere, always late', traitOverrides: { speed: 88, discipline: 44, luck: 60 } }],
  ['Captain Cackle', 'weird', '#d99cff', { title: 'Laughs at own jokes', traitOverrides: { funny: 94, wit: 71, friendly: 61 } }],
  ['Mischief Mina', 'bully', '#ff7b7b', { title: 'Prank architect', traitOverrides: { aggression: 72, sadism: 69, wit: 74 } }],
  ['Professor Pigeon', 'swot', '#8cf2d8', { title: 'Talks in footnotes', traitOverrides: { intelligence: 91, wisdom: 79, funny: 42 } }],
  ['Snack Attack Sam', 'hero', '#ffe08f', { title: 'Always near canteen', traitOverrides: { friendly: 68, bladderSize: 78, speed: 52, weight: 'chubby' } }],
  ['Ninja Noodle', 'weird', '#c4a2ff', { title: 'Silent until bell rings', traitOverrides: { skill: 81, mood: 62, funny: 58 } }],
  ['Hexa Harriet', 'swot', '#85ffd5', { title: 'Math puzzle machine', tattles: true, traitOverrides: { intelligence: 92, wit: 86, discipline: 88 } }],
  ['Brick Bruno', 'bully', '#ff6d8e', { title: 'Thinks with fists', traitOverrides: { strength: 88, aggression: 82, wisdom: 33, weight: 'overweight' } }],
  ['Sunny Saffron', 'hero', '#ffeab5', { title: 'Makes peace in queues', traitOverrides: { friendly: 90, honor: 86, wit: 58 } }],
  ['Glitch Greta', 'weird', '#d6a7ff', { title: 'Computer-room conspiracy theorist', traitOverrides: { funny: 76, intelect: 80, wisdom: 45 } }],
  ['Rumble Ruby', 'bully', '#ff668c', { title: 'Laughs in detentions', traitOverrides: { aggression: 78, sadism: 72, masochism: 20 } }],
  ['Doc Doodles', 'swot', '#7dffd1', { title: 'Writes notes on everything', traitOverrides: { intelligence: 86, skill: 80, discipline: 76 } }],
  ['Biscuit Baz', 'hero', '#ffd48c', { title: 'Trades snacks for favours', traitOverrides: { friendly: 74, luck: 73, honor: 52 } }],
  ['Chaos Chloe', 'weird', '#bb95ff', { title: 'Starts songs mid-lesson', traitOverrides: { funny: 88, discipline: 28, mood: 84 } }],
  ['Mellow Mel', 'hero', '#ffe3a4', { title: 'Calm in every crisis', traitOverrides: { mood: 84, wisdom: 75, aggression: 18 } }],
  ['Spike Sprite', 'bully', '#ff5a8a', { title: 'Tiny but terrifying', traitOverrides: { aggression: 83, speed: 81, strength: 58 } }],
  ['Oracle Olive', 'swot', '#89f7cf', { title: 'Predicts quiz questions', traitOverrides: { intelligence: 90, wisdom: 83, funny: 52 } }],
  ['Velvet Vex', 'weird', '#c7a1ff', { title: 'Poet of odd insults', traitOverrides: { wit: 87, funny: 80, friendly: 36 } }],
  ['Jester Jet', 'hero', '#ffe59d', { title: 'Class clown with a heart', traitOverrides: { funny: 91, friendly: 79, honor: 64 } }],
  ['Milo Maso', 'weird', '#c59bff', { title: 'Oddly likes roughhousing', traitOverrides: { masochism: 88, sadism: 26, funny: 71 } }],
  ['Sarda Sadie', 'bully', '#ff618f', { title: 'Enjoys mean jokes', traitOverrides: { sadism: 90, aggression: 75, honor: 22 } }],
];


const extraStudentRoster = [
  ['Banter Ben', 'hero', '#ffd3a1', { title: 'Can turn any detention into stand-up', traitOverrides: { funny: 93, friendly: 74, wit: 82 } }],
  ['Turbo Tina', 'hero', '#ffd08a', { title: 'Sprints between every lesson', traitOverrides: { speed: 90, skill: 76, discipline: 48 } }],
  ['Murmur Max', 'weird', '#cfa8ff', { title: 'Whispers wild rumours', traitOverrides: { funny: 79, wit: 74, mood: 70 } }],
  ['Plot Twist Pip', 'weird', '#c6a1ff', { title: 'Always predicts chaos', traitOverrides: { funny: 83, luck: 68, wisdom: 52 } }],
  ['Comet Cole', 'hero', '#ffd995', { title: 'Fast, loud, and mostly harmless', traitOverrides: { speed: 86, friendly: 67, honor: 63 } }],
  ['Grump Gus', 'bully', '#ff648f', { title: 'Permanent bad mood', traitOverrides: { aggression: 80, mood: 28, sadism: 66 } }],
  ['Pixel Penny', 'swot', '#88ffd7', { title: 'Spreadsheet speedrunner', traitOverrides: { intelligence: 90, skill: 88, discipline: 85 } }],
  ['Algebra Ace', 'swot', '#8fffe0', { title: 'Solves sums before asked', tattles: true, traitOverrides: { intelligence: 95, wisdom: 81, discipline: 90 } }],
  ['Riff Raffi', 'weird', '#c79aff', { title: 'Desk-drumming virtuoso', traitOverrides: { funny: 87, mood: 79, discipline: 30 } }],
  ['Bossy Bex', 'bully', '#ff6a8f', { title: 'Queue-cutting specialist', traitOverrides: { aggression: 77, strength: 70, honor: 26 } }],
  ['Gentle Gio', 'hero', '#ffe9ac', { title: 'Conflict de-escalator', traitOverrides: { friendly: 91, honor: 88, aggression: 18 } }],
  ['Snarky Noor', 'weird', '#d2abff', { title: 'Sarcasm in human form', traitOverrides: { wit: 89, funny: 78, friendly: 40 } }],
  ['Crunch Carl', 'swot', '#7ffbd0', { title: 'Data over drama', traitOverrides: { intelligence: 89, skill: 84, funny: 45 } }],
  ['Maverick Mo', 'hero', '#ffd89f', { title: 'Rule-bender with charm', traitOverrides: { wit: 81, luck: 75, honor: 50 } }],
  ['Thud Theo', 'bully', '#ff6f94', { title: 'Heavy footsteps, heavier opinions', traitOverrides: { strength: 84, aggression: 74, weight: 'chubby' } }],
  ['Echo Elle', 'weird', '#c39cff', { title: 'Repeats teachers dramatically', traitOverrides: { funny: 85, mood: 82, discipline: 35 } }],
  ['Quiz Quill', 'swot', '#86ffd2', { title: 'Raises hand for fun', tattles: true, traitOverrides: { intelligence: 88, wit: 84, discipline: 87 } }],
  ['Lucky Luca', 'hero', '#ffdd9a', { title: 'Wins every coin toss', traitOverrides: { luck: 94, friendly: 70, wisdom: 58 } }],
  ['Static Stan', 'weird', '#cca5ff', { title: 'Conspiracy radio host', traitOverrides: { funny: 74, intelect: 82, wisdom: 44 } }],
  ['Razor Rae', 'bully', '#ff5f86', { title: 'Tiny terror with comebacks', traitOverrides: { aggression: 82, speed: 79, sadism: 68 } }],
  ['Tutor Taz', 'swot', '#7ef7ce', { title: 'Carries flashcards everywhere', traitOverrides: { intelligence: 92, wisdom: 84, friendly: 58 } }],
  ['Jolly Juno', 'hero', '#ffe4b0', { title: 'Cheer captain of break-time', traitOverrides: { funny: 84, friendly: 88, mood: 86 } }],
  ['Bramble Bri', 'weird', '#c8a0ff', { title: 'Invents impossible homework excuses', traitOverrides: { wit: 86, funny: 82, discipline: 26 } }],
  ['Rex Rumble', 'bully', '#ff668b', { title: 'Arm-wrestling addict', traitOverrides: { strength: 90, aggression: 79, honor: 24 } }],
  ['Notepad Nia', 'swot', '#84ffd6', { title: 'Writes everything down', traitOverrides: { intelligence: 85, discipline: 90, skill: 78 } }],
  ['Fizz Finn', 'hero', '#ffd69a', { title: 'Energy drink mascot', traitOverrides: { speed: 82, funny: 73, bladderSize: 80 } }],
  ['Whimsy Wren', 'weird', '#c49cff', { title: 'Classroom improviser', traitOverrides: { funny: 88, mood: 84, wisdom: 48 } }],
  ['Nudge Nate', 'bully', '#ff6c92', { title: 'Always starts the shoving', traitOverrides: { aggression: 76, strength: 68, sadism: 61 } }],
  ['Scholar Skye', 'swot', '#82ffd4', { title: 'Library map in human form', traitOverrides: { intelligence: 91, wisdom: 87, honor: 72 } }],
  ['Buddy Blue', 'hero', '#ffe2a8', { title: 'Everyone knows Buddy', traitOverrides: { friendly: 92, honor: 76, funny: 65 } }],
  ['Oddball Oz', 'weird', '#be93ff', { title: 'Builds theories from doodles', traitOverrides: { funny: 77, intelect: 79, mood: 73 } }],
  ['Spite Spike', 'bully', '#ff5d84', { title: 'Competitive about everything', traitOverrides: { aggression: 84, sadism: 74, strength: 73 } }],
  ['Merit Mae', 'swot', '#83ffd3', { title: 'Collects praise like badges', tattles: true, traitOverrides: { intelligence: 89, discipline: 91, friendly: 52 } }],
  ['Harmony Hex', 'hero', '#ffe6b3', { title: 'Can calm any argument', traitOverrides: { friendly: 89, mood: 88, honor: 84 } }],
];

studentRoster.push(...extraStudentRoster);

function baselineRoomSeatCount(room) {
  // Mirrors the baseline classroom seat math so roster sizing stays aligned
  // with visible chair layout without inflating desk density.
  const usableW = Math.max(8, room.w - 8);
  const usableH = Math.max(5, room.h - 7);
  const cols = Math.max(3, Math.floor(usableW / 3));
  const rows = Math.max(2, Math.floor(usableH / 2.6));
  return cols * rows;
}

function maxStudentPopulationForLessons() {
  const classroomCapacity = rooms
    .filter((room) => room.type === 'classroom' && room.name !== 'Staff Room' && room.name !== 'Headmaster Office')
    .reduce((sum, room) => sum + Math.max(0, baselineRoomSeatCount(room) - 1), 0);
  return Math.max(12, classroomCapacity);
}

// Keep a seat comfort buffer so pupils are less likely to contest the same chairs.
const STUDENT_POPULATION_REDUCTION = 10;
const maxStudentPopulation = Math.max(12, maxStudentPopulationForLessons() - STUDENT_POPULATION_REDUCTION);
const activeStudentRoster = studentRoster.slice(0, maxStudentPopulation);


function createLockerPlanForStudents(students) {
  lockers.length = 0;
  const allStudents = students.filter((entity) => isStudentCharacter(entity) && entity.role !== 'player');
  const targetWithLocker = Math.min(allStudents.length, Math.floor(allStudents.length * 0.7));

  let lockerId = 1;
  for (const bank of lockerBanks) {
    const bankColumns = Math.max(1, bank.columns || 10);
    for (let i = 0; i < bank.capacity; i += 1) {
      lockers.push({
        id: `L-${String(lockerId).padStart(3, '0')}`,
        bank: bank.label,
        floor: bank.floor,
        room: bank.room,
        x: bank.x + (i % bankColumns) * 2.15,
        y: bank.y + Math.floor(i / bankColumns) * 1.35,
        assignedTo: null,
      });
      lockerId += 1;
    }
  }

  game.lockerCapacity = lockers.length;

  // Shuffle student order for fair locker distribution across personalities.
  const shuffled = [...allStudents].sort(() => game.rng() - 0.5);
  const assignmentCount = Math.min(targetWithLocker, lockers.length);
  for (let i = 0; i < assignmentCount; i += 1) {
    const student = shuffled[i];
    const locker = lockers[i];
    locker.assignedTo = student.name;
    student.hasLocker = true;
    student.lockerId = locker.id;
    student.lockerKey = `${locker.id}-KEY`;
    student.lockerFloor = locker.floor;
    student.lockerRoom = locker.room;
    student.inventory.push('locker key');
  }

  for (let i = assignmentCount; i < shuffled.length; i += 1) {
    const student = shuffled[i];
    student.hasLocker = false;
    student.lockerId = null;
    student.lockerKey = null;
    student.lockerFloor = null;
    student.lockerRoom = null;
  }

  game.lockerCoverage = shuffled.length ? Math.round((assignmentCount / shuffled.length) * 100) : 0;
}

function applyStudentAppearancePlan(roster) {
  // Keep requested diversity mix, now including two pale-white students.
  const skinPlan = ['green', 'red', 'black', 'black', 'yellow', 'yellow', 'yellow', 'lightBrown', 'lightBrown', 'lightBrown', 'paleWhite', 'paleWhite'];
  for (let i = 0; i < roster.length; i += 1) {
    const entry = roster[i];
    const profile = entry[3] || {};
    profile.appearanceOverrides = profile.appearanceOverrides || {};
    profile.appearanceOverrides.skinTone = skinPlan[i] || 'white';
    entry[3] = profile;
  }

  // Explicit hair overrides requested for visual contrast.
  if (roster[0]) {
    roster[0][3] = roster[0][3] || {};
    roster[0][3].appearanceOverrides = roster[0][3].appearanceOverrides || {};
    roster[0][3].appearanceOverrides.hairColor = '#f5f5f5';
  }
  if (roster[1]) {
    roster[1][3] = roster[1][3] || {};
    roster[1][3].appearanceOverrides = roster[1][3].appearanceOverrides || {};
    roster[1][3].appearanceOverrides.hairColor = '#070707';
  }

  // Strong silhouette contrast: one very wide pupil and one very skinny pupil.
  if (roster[2]) {
    roster[2][3] = roster[2][3] || {};
    roster[2][3].appearanceOverrides = roster[2][3].appearanceOverrides || {};
    // Nearly 2x torso width of a normal pupil while keeping normal head size.
    roster[2][3].appearanceOverrides.bodyWidth = 24;
    roster[2][3].appearanceOverrides.armWidth = 4;
    roster[2][3].appearanceOverrides.legWidth = 7;
    roster[2][3].appearanceOverrides.headWidth = 10;
    roster[2][3].appearanceOverrides.headHeight = 6;
  }
  if (roster[3]) {
    roster[3][3] = roster[3][3] || {};
    roster[3][3].appearanceOverrides = roster[3][3].appearanceOverrides || {};
    // Very thin body/limbs while keeping a normal-sized head for stylised contrast.
    roster[3][3].appearanceOverrides.bodyWidth = 6;
    roster[3][3].appearanceOverrides.armWidth = 1;
    roster[3][3].appearanceOverrides.armLength = 8;
    roster[3][3].appearanceOverrides.legWidth = 2;
    roster[3][3].appearanceOverrides.legLength = 8;
    roster[3][3].appearanceOverrides.headWidth = 10;
    roster[3][3].appearanceOverrides.headHeight = 6;
  }
}

applyStudentAppearancePlan(activeStudentRoster);
if (activeStudentRoster.length < studentRoster.length) {
  // Keep simulation smooth: cap active students so classes never exceed chair capacity.
  announce(`📉 Roster balanced to ${activeStudentRoster.length} students so every class has enough chairs.`);
}

activeStudentRoster.forEach(([name, role, color, profile], idx) => {
  const column = idx % 10;
  const row = Math.floor(idx / 10);
  game.entities.push(mkEntity(name, role, 98 + (column * 5.2), 86.5 + (row * 2.2), color, profile));
});

function seedSwotGameTraders() {
  const swots = game.entities.filter((entity) => entity.role === 'swot').slice(0, 4);
  for (const swot of swots) {
    if (!hasVideoGameItem(swot)) swot.inventory.push(game.rng() < 0.5 ? 'video game cart' : 'video game disk');
  }
}

function allNonPlayerStudents() {
  return game.entities.filter((entity) => entity !== player && STUDENT_ROLES.has(entity.role));
}

function applyTeacherCount(desiredCount) {
  // Always keep the headmaster; trim or keep other teachers by current order for predictable setup.
  const teachers = game.entities.filter((entity) => entity.role === 'teacher');
  const clamped = Math.max(1, Math.min(teachers.length, Math.round(desiredCount || teachers.length)));
  const keepNames = new Set(teachers.slice(0, clamped).map((teacher) => teacher.name));
  game.entities = game.entities.filter((entity) => entity.role !== 'teacher' || keepNames.has(entity.name));
}

function applyStudentMix(studentCount, ratios) {
  const students = allNonPlayerStudents();
  const maxCount = students.length;
  const desired = Math.max(8, Math.min(maxCount, Math.round(studentCount || students.length)));
  const activeStudents = students.slice(0, desired);
  const inactiveNames = new Set(students.slice(desired).map((entity) => entity.name));
  game.entities = game.entities.filter((entity) => !inactiveNames.has(entity.name));

  const weighted = [
    { role: 'bully', weight: Math.max(0, Number(ratios.bully) || 0) },
    { role: 'hero', weight: Math.max(0, Number(ratios.hero) || 0) },
    { role: 'swot', weight: Math.max(0, Number(ratios.swot) || 0) },
    { role: 'weird', weight: Math.max(0, Number(ratios.weird) || 0) },
  ];
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0) || 1;
  const roleBag = [];
  for (const entry of weighted) {
    const slots = Math.round((entry.weight / totalWeight) * desired);
    for (let i = 0; i < slots; i += 1) roleBag.push(entry.role);
  }
  while (roleBag.length < desired) roleBag.push('hero');

  activeStudents.forEach((student, index) => {
    const role = roleBag[index] || 'hero';
    student.role = role;
    student.color = ROLE_VISUALS[role] || student.color;
    student.personality = { ...(personalities[role] || personalities.hero) };
  });
}

function applyStartupOptions() {
  const desiredStudents = Number(optStudentCountEl?.value || 30);
  const desiredTeachers = Number(optTeacherCountEl?.value || 9);
  const speedMultiplier = Math.max(0.5, Math.min(2, Number(optGameSpeedEl?.value || 1)));
  const weatherSetting = optWeatherEl?.value || 'auto';
  const llmEnabled = Boolean(optLlmEnabledEl?.checked);
  const llmSource = String(optLlmSourceEl?.value || 'local');
  const llmNsfw = Boolean(optLlmNsfwEl?.checked);
  const llmNoFallback = Boolean(optLlmNoFallbackEl?.checked);
  const llmModel = String(optLlmModelEl?.value || '').trim();
  const llmManualModel = String(optLlmManualModelEl?.value || '').trim();
  const llmLocalEndpoint = normalizeLocalEndpoint(optLlmLocalEndpointEl?.value || game.llm.localEndpoint);
  const llmRemoteProvider = String(optLlmRemoteProviderEl?.value || 'openai');
  const llmRemoteModel = String(optLlmRemoteModelEl?.value || '').trim();
  const llmRemoteToken = String(optLlmRemoteTokenEl?.value || game.llm.remoteToken || '').trim();

  applyTeacherCount(desiredTeachers);
  applyStudentMix(desiredStudents, {
    bully: Number(optRatioBullyEl?.value || 25),
    hero: Number(optRatioHeroEl?.value || 25),
    swot: Number(optRatioSwotEl?.value || 25),
    weird: Number(optRatioWeirdEl?.value || 25),
  });

  game.speedMultiplier = speedMultiplier;
  game.timeScale = (TOTAL_DAY_GAME_MINUTES / TARGET_DAY_REAL_SECONDS) * game.speedMultiplier;
  game.preferredWeather = weatherSetting;
  if (weatherSetting !== 'auto' && weatherModes[weatherSetting]) {
    game.weather = weatherSetting;
  }

  // LLM mode can optionally run in strict no-fallback mode where dialogue waits for model output.
  const providerChanged = game.llm.source !== llmSource
    || game.llm.selectedModel !== llmModel
    || game.llm.manualModelName !== llmManualModel
    || game.llm.localEndpoint !== llmLocalEndpoint
    || game.llm.remoteProvider !== llmRemoteProvider
    || game.llm.remoteModel !== llmRemoteModel
    || game.llm.remoteToken !== llmRemoteToken
    || game.llm.nsfw !== llmNsfw
    || game.llm.noFallback !== llmNoFallback;
  if (providerChanged) game.llm.cache.clear();
  game.llm.enabled = llmEnabled;
  game.llm.source = llmSource === 'remote' ? 'remote' : 'local';
  game.llm.selectedModel = llmModel;
  game.llm.manualModelName = llmManualModel || llmModel;
  game.llm.localEndpoint = llmLocalEndpoint;
  game.llm.remoteProvider = llmRemoteProvider === 'grok' ? 'grok' : 'openai';
  game.llm.remoteModel = llmRemoteModel || (game.llm.remoteProvider === 'grok' ? 'grok-2-latest' : 'gpt-4.1-mini');
  game.llm.remoteToken = llmRemoteToken;
  game.llm.nsfw = llmNsfw;
  game.llm.noFallback = llmNoFallback;
  persistLlmSettings();

  // Startup population changes alter seating demand; rebuild cached layouts.
  roomSeatCache.clear();
  createLockerPlanForStudents(game.entities);
  seedSwotGameTraders();
  assignFixedClassRosters();
  initTutorialRollCallState();
  game.playerLastX = player.x;
  game.playerLastY = player.y;
  game.playerStuckMs = 0;

  assignDailyDutyTeacher();
  warmupLlmCache();
}

createLockerPlanForStudents(game.entities);
seedSwotGameTraders();
assignFixedClassRosters();
initTutorialRollCallState();

function initialiseNpcRelationships() {
  for (const entity of game.entities) {
    if (entity.role === 'player') continue;
    const score = entity.relationships?.Eric ?? 0;
    entity.ericRelationshipType = relationshipLabel(score);
  }
}

initialiseNpcRelationships();
for (const entity of game.entities) ensureDialogueSetup(entity);

function formatTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function weekdayLabelForDay(day = game.dayCount) {
  return WEEKDAY_NAMES[(Math.max(1, day) - 1) % WEEKDAY_NAMES.length];
}

function weightedCardRarityRoll(rng = Math.random) {
  const total = Object.values(CARD_RARITY).reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const [rarity, meta] of Object.entries(CARD_RARITY)) {
    roll -= meta.weight;
    if (roll <= 0) return rarity;
  }
  return 'common';
}

function dailyCardCountForStudent(entity) {
  const base = 1 + Math.floor(game.rng() * 5);
  const swotBonus = entity.role === 'swot' ? 1 : 0;
  return Math.max(1, Math.min(5, base + swotBonus - (game.rng() < 0.4 ? 1 : 0)));
}

function pickDailyCardsForEntity(entity) {
  const count = dailyCardCountForStudent(entity);
  const cards = [];
  const npcSeed = styleSeedFromName(entity.name) + game.dayCount * 13;
  const weekday = (game.dayCount - 1) % 7;
  for (let i = 0; i < count; i += 1) {
    let rarity = weightedCardRarityRoll(game.rng);
    // Rare scheduling rule: some legendary cards appear only on specific days for specific NPCs.
    if ((npcSeed + i) % 11 === weekday && game.periodIndex <= 2) rarity = 'legendary';
    const pool = TRADING_CARD_CATALOG.filter((card) => card.rarity === rarity);
    const idx = Math.abs(npcSeed + i * 17) % pool.length;
    cards.push(pool[idx]);
  }
  return cards;
}

function assignDailyTradingCards() {
  for (const entity of game.entities) {
    if (entity.role === 'teacher' || entity.role === 'janitor' || entity.role === 'nurse' || entity.role === 'player') continue;
    entity.dailyCards = pickDailyCardsForEntity(entity);
  }
}

function updateCardCollectionFromCards(cards = []) {
  for (const card of cards) {
    if (card?.id) game.cardCollection.add(card.id);
  }
  game.cardCollectionCount = game.cardCollection.size;
}

function roomByName(name) {
  return rooms.find((r) => r.name === name);
}

function roomCenter(name) {
  const r = roomByName(name);
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

function gateQueuePosition(entity) {
  const field = roomByName('P.E. Field');
  const dividerX = field.x + morningQueue.dividerInsetFromFieldLeft;
  // Start-of-day student columns (area 2 from the user's marked screenshot).
  const lane = entity.seatIndex % 5;
  const row = Math.floor(entity.seatIndex / 5) % 14;
  return {
    // Keep every student lane to the right of the black divider line.
    x: Math.max(dividerX + morningQueue.studentMinOffsetFromDivider, field.x + field.w - 18 + lane * 2.2),
    y: field.y + 3 + row * 1.55,
  };
}

function teacherGateLinePosition(teacherIndex) {
  const field = roomByName('P.E. Field');
  const dividerX = field.x + morningQueue.dividerInsetFromFieldLeft;
  // Single-file teacher line stands just left of the divider line.
  return {
    x: dividerX - morningQueue.teacherOffsetFromDivider,
    y: field.y + 4 + teacherIndex * 2.02,
  };
}

function isAssemblyPeriod(period = schedule[game.periodIndex]) {
  return period?.period === 'Assembly';
}

function assemblyHeadmasterSpot() {
  const hall = roomByName('Assembly Hall');
  return { x: hall.x + (hall.w / 2), y: hall.y + 3.5 };
}

function assemblyTeacherLineSpot(lineIndex, totalTeachers = 1) {
  const headmaster = assemblyHeadmasterSpot();
  const spread = Math.max(1, totalTeachers - 1);
  const xOffset = (lineIndex - ((spread - 1) / 2)) * 2.15;
  // Behind headmaster = slightly closer to hall's top wall.
  return { x: headmaster.x + xOffset, y: headmaster.y - 1.45 };
}

function randomHeadmasterAssemblyThought() {
  // Procedural generator yields 1000+ quirky combinations without hardcoding giant arrays.
  const openers = ['Thought for the day', 'Morning mystery', 'Assembly alert', 'Brain sparkle', 'Philosophy detour'];
  const subjects = ['left socks', 'teacups', 'gravity', 'homework dragons', 'corridor echoes', 'cheese sandwiches', 'invisible llamas', 'time-travelling pencils', 'detention clocks', 'chalk dust'];
  const actions = ['predict your future', 'whisper in Latin', 'demand applause', 'solve maths', 'start a conga line', 'argue with pigeons', 'judge handwriting', 'invent volcanoes', 'challenge the moon', 'open secret portals'];
  const outcomes = ['so stay curious', 'therefore stand tall', 'which is why we queue politely', 'and that, children, is science', 'so sing louder than your doubts', 'hence no running indoors', 'thus knowledge wins'];
  return `🧠 ${openers[Math.floor(game.rng() * openers.length)]}: if ${subjects[Math.floor(game.rng() * subjects.length)]} can ${actions[Math.floor(game.rng() * actions.length)]}, ${outcomes[Math.floor(game.rng() * outcomes.length)]}.`;
}

function hasArrivedForCurrentPeriod(entity, currentPeriod = schedule[game.periodIndex]) {
  if (entity === player) return true;
  if (currentPeriod.period !== 'Start Day') return true;
  return entity.arrivedForDay;
}

function bullyFightChance(currentPeriod) {
  // Keep mornings civil: fights are very unlikely until break starts.
  if (isStartDayPeriod(currentPeriod) || isRegistrationPeriod(currentPeriod)) return 0.0001;
  if (currentPeriod.mode !== 'break') return 0.00035;
  return 0.006;
}

function isTeacherBackTurned(teacher, now = performance.now()) {
  return Boolean(teacher && teacher.role === 'teacher' && teacher.writingUntil > now);
}

function assignedTeacherEntityForPeriod(period = schedule[game.periodIndex]) {
  const assignedName = assignedTeacherForRoom(period.room);
  if (!assignedName) return null;
  return game.entities.find((entity) => entity.role === 'teacher' && entity.name === assignedName) || null;
}

function isAssignedTeacherBackTurnedForPeriod(period = schedule[game.periodIndex], now = performance.now()) {
  if (!isSupervisedPeriod(period)) return false;
  const teacher = assignedTeacherEntityForPeriod(period);
  return Boolean(teacher && entityRoom(teacher) === period.room && isTeacherBackTurned(teacher, now));
}

function findWitnessingTeacher(actor, range = 5.4) {
  // Keep witness logic cheap: same room + distance approximates line-of-sight.
  return game.entities.find((entity) => (
    entity.role === 'teacher'
    && entityRoom(entity) === entityRoom(actor)
    && distance(entity, actor) < range
    && !isTeacherBackTurned(entity)
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


function sendEntityToHeadmaster(entity, reason = 'discipline') {
  const office = roomByName('Headmaster Office');
  if (!office || !entity) return;
  entity.x = office.x + (entity === player ? office.w / 2 : Math.max(1.7, Math.min(office.w - 1.8, (entity.seatIndex % 3) + 2)));
  entity.y = office.y + office.h - (entity === player ? 2 : (2.6 + ((entity.seatIndex % 2) * 1.4)));
  entity.target = null;
  entity.vx = 0;
  entity.vy = 0;
  entity.isSeated = false;
  entity.seatedRoom = null;
}

function sendPlayerToHeadmaster(reason, extraLines = 45) {
  if (extraLines > 0) addLines(extraLines, reason);
  sendEntityToHeadmaster(player, reason);
  // Ten-second lecture lock as requested; Eric cannot move while being told off.
  game.headmasterDetentionUntil = performance.now() + 10000;
  game.headmasterDismissAnnounced = false;
  announce(`🏫 Mr Wacker marched Eric to the Headmaster Office for ${reason}.`);
  announce('🧑‍🏫 Headmaster: "You will stand there and think about what you have done."', { force: true });
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
  const eps = 0.12;
  return rooms.find((r) => (
    entity.x >= r.x + eps
    && entity.x <= r.x + r.w - eps
    && entity.y >= r.y + eps
    && entity.y <= r.y + r.h - eps
  ))?.name || 'Corridor';
}

function entityFloor(entity) {
  const room = rooms.find((r) => entity.x > r.x && entity.x < r.x + r.w && entity.y > r.y && entity.y < r.y + r.h);
  return room?.floor || 'lower';
}

function updateFloorStatus() {
  if (!floorStatusEl) return;
  const meta = floorMeta[entityFloor(player)] || floorMeta.ground;
  const toiletState = game.toiletsBlocked ? '⛔ Blocked/Flooded' : '✅ Open';
  floorStatusEl.textContent = `🧭 Floor: ${meta.label} (${meta.color}) | 🚽 Dirt: ${Math.round(game.toiletDirt)}% | ${toiletState}`;
  floorStatusEl.title = game.toiletsBlocked
    ? 'Toilets are currently blocked and flooded while Mr Mop cleans.'
    : 'Toilets get dirtier as people use them. Mr Mop cleans them when they are grubby.';
}

function updateAutoStatus() {
  autoStatusEl.textContent = `🤖 Auto: ${game.autoMode ? 'ON' : 'OFF'}`;
}

function updateCharismaHud() {
  charismaEl.textContent = `🗣️ Charisma: ${Math.round(game.charisma)}`;
  charismaEl.title = 'Higher charisma improves social outcomes when talking with students.';
}

function updateWeatherHud() {
  const meta = weatherModes[game.weather] || weatherModes.sunny;
  weatherEl.textContent = `${meta.icon} Weather: ${meta.label}`;
  weatherEl.title = `Weekly weather is ${meta.label}. It changes every 7 school days.`;
}

function pickWeeklyWeather() {
  if (game.preferredWeather && game.preferredWeather !== 'auto' && weatherModes[game.preferredWeather]) {
    game.weather = game.preferredWeather;
    updateWeatherHud()
    return;
  }
  const week = Math.floor((game.dayCount - 1) / 7) + 1;
  if (game.weatherWeek === week) return;
  game.weatherWeek = week;
  const keys = Object.keys(weatherModes);
  game.weather = keys[Math.floor(game.rng() * keys.length)] || 'sunny';
  announce(`${weatherModes[game.weather].icon} New week weather: ${weatherModes[game.weather].label}.`, { force: true, feedType: 'world' });
  playSfx('weather');
  updateWeatherHud();
}

function updateBladderHud() {
  bladderEl.textContent = `🚻 Bladder: ${Math.round(game.bladder)}%`;
}

function updateHygieneHud() {
  hygieneEl.textContent = `🧼 Hygiene: ${Math.round(game.hygiene)}%`;
  hygieneEl.title = game.hygiene < 35
    ? 'Low hygiene: pupils and teachers may shame Eric.'
    : 'Keep hygiene high: avoid wetting accidents and fights.';
}

function lowerHygiene(amount, reason) {
  const prev = game.hygiene;
  game.hygiene = Math.max(0, game.hygiene - amount);
  if (Math.floor(prev / 10) !== Math.floor(game.hygiene / 10) && reason) {
    announce(`🧼 Hygiene dropped (${reason}).`, { force: true });
  }
  updateHygieneHud();
}

function maybeShameEric(now = performance.now()) {
  if (game.hygiene > 35) return;
  if (now - game.lastHygieneShameAt < 5500) return;

  const nearby = game.entities.find((entity) => (
    entity !== player
    && entity.knockedUntil < now
    && distance(entity, player) < 3.1
  ));
  if (!nearby) return;

  const lines = [
    `${nearby.name}: "Pong, Eric!"`,
    `${nearby.name}: "Wash up, stink bomb!"`,
    `${nearby.name}: "Even the gym socks smell better."`,
  ];

  if (nearby.role !== 'teacher') {
    game.smelledStudents[nearby.name] = true;
  }

  if (nearby.role === 'teacher') {
    announce(`🧑‍🏫 ${nearby.name}: "Eric, sort your hygiene out at once."`, { source: nearby, range: 8, force: true });
  } else {
    const pick = lines[Math.floor(game.rng() * lines.length)];
    announce(`😖 ${pick}`, { source: nearby, range: 8, force: true });
  }
  game.lastHygieneShameAt = now;
}

function updateHygieneSocialAura(now = performance.now()) {
  if (game.hygiene < 70) return;
  if (!game.lastHygieneAuraAt || now - game.lastHygieneAuraAt > 4200) {
    for (const student of game.entities) {
      if (student.role === 'player' || student.role === 'teacher') continue;
      if (student.knockedUntil > now || distance(student, player) > 3.2) continue;
      // Good hygiene passively improves one-to-one student reputation over time.
      adjustEricRelationship(student, 0.6 + (game.charisma * 0.006), 'fresh aura');
      student.ericReputation = Math.min(100, (student.ericReputation || 0) + 0.8);
    }
    game.lastHygieneAuraAt = now;
  }
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
  if (game.bladder >= 75 && !game.toiletsBlocked) return roomCenter('Toilets');
  const current = schedule[game.periodIndex];
  if (current.mode === 'lesson') {
    // Auto Eric prefers his assigned desk; if blocked, wait beside it for player action.
    const reservedSeat = getSeatPosition(current.room, player.seatIndex) || roomCenter(current.room);
    return ericSeatOccupant(current.room) ? ericSeatWaitingSpot(current.room) : reservedSeat;
  }
  // Keep Eric in the same gate lineup pattern as everyone else on arrival,
  // instead of dragging him to the middle of the School Gates room.
  if (isStartDayPeriod(current)) return gateQueuePosition(player);
  if (current.mode === 'home' || current.mode === 'end') return roomCenter('School Gates');
  return roomCenter(current.room);
}

function roomAtPosition(pos) {
  // AI routing can briefly clear or corrupt targets while tasks are swapped.
  // Treat invalid coordinates as "no room" instead of crashing the game loop.
  if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return null;
  const eps = 0.12;
  return rooms.find((r) => (
    pos.x >= r.x + eps
    && pos.x <= r.x + r.w - eps
    && pos.y >= r.y + eps
    && pos.y <= r.y + r.h - eps
  )) || null;
}

function roomDoorway(room) {
  if (!room || room.type === 'corridor' || room.type === 'outdoor') return null;
  const floorCorridorY = room.floor === 'upper' ? 17 : room.floor === 'middle' ? 52 : room.floor === 'ground' ? 78 : 112;
  const topDist = Math.abs(room.y - floorCorridorY);
  const bottomDist = Math.abs((room.y + room.h) - floorCorridorY);
  const useTop = topDist <= bottomDist;
  return {
    x: room.x + room.w / 2,
    // Keep doorway waypoints deeper inside the room so NPCs do not jitter on wall edges.
    y: useTop ? room.y + 1.1 : room.y + room.h - 1.1,
  };
}

function nearestDoor(entity, radius = 1.75) {
  let best = null;
  let bestDist = Infinity;
  for (const door of roomDoors) {
    const d = distance(entity, door);
    if (d <= radius && d < bestDist) {
      best = door;
      bestDist = d;
    }
  }
  return best;
}

function useDoor(entity, door) {
  if (!door) return false;
  const inRoom = entityRoom(entity) === door.room;

  // Snap to either side of the doorway so transitions feel immediate and deterministic.
  entity.x = door.x;
  entity.y = inRoom ? door.exteriorY : door.interiorY;
  entity.vx = 0;
  entity.vy = 0;
  constrain(entity);
  return true;
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

function isNearDoorway(pos, radius = 1.9) {
  // Doorway proximity is used as a choke-point hint for congestion handling.
  for (const room of rooms) {
    const door = roomDoorway(room);
    if (door && distance(pos, door) <= radius) return true;
  }
  return false;
}

function isNearStairStep(pos, radius = 1.7) {
  if (!pos) return false;
  return stairs.some((stair) => (
    distance(pos, { x: stair.x, y: stair.fromY }) <= radius
    || distance(pos, { x: stair.x, y: stair.toY }) <= radius
  ));
}

function withinStairEntry(pos, step) {
  if (!pos || !step) return false;
  return Math.abs(pos.x - step.x) <= STAIR_ENTRY_HALF_WIDTH
    && Math.abs(pos.y - step.y) <= STAIR_ENTRY_HALF_HEIGHT;
}

function stairEscapeTargets(stair, floor) {
  // Keep a broad set of side-lanes so crowd recovery uses a visibly wider staircase footprint.
  const offsets = [-3.1, -2.05, -1.05, 1.05, 2.05, 3.1];
  const levelY = floor === stair.fromFloor ? stair.fromY : stair.toY;
  return offsets.map((offset) => ({ x: stair.x + offset, y: levelY }));
}

function nearestStairEscapeTarget(entity, desiredFloor = null) {
  const currentFloor = entityFloor(entity);
  const intendedNextFloor = desiredFloor ? nextFloorToward(currentFloor, desiredFloor) : null;
  let best = null;
  let bestDist = Infinity;

  for (const stair of stairs) {
    const currentStep = stairPointForFloor(stair, currentFloor);
    if (!currentStep || distance(entity, currentStep) > 2.1) continue;
    const destinationFloor = stair.fromFloor === currentFloor ? stair.toFloor : stair.fromFloor;
    if (intendedNextFloor && destinationFloor !== intendedNextFloor) continue;

    const options = stairEscapeTargets(stair, currentFloor);
    for (const option of options) {
      const optionRoom = roomAtPosition(option);
      if (optionRoom && optionRoom.floor !== currentFloor) continue;
      const dist = distance(entity, option);
      if (dist < bestDist) {
        bestDist = dist;
        best = option;
      }
    }
  }

  return best;
}

function resetEntityPathing(entity, destination) {
  const destinationRoom = roomAtPosition(destination);
  const entryDoor = destinationRoom ? roomDoorway(destinationRoom) : null;
  const stagedDoor = destinationRoom ? doorwayStagingPoint(entity, entryDoor, destinationRoom) : null;

  // Temporary no-separation movement lets jammed pupils/teachers overlap long enough
  // to pass through tight door bottlenecks instead of deadlocking.
  entity.phaseThroughUntil = performance.now() + 1450;
  entity.jamSeconds = 0;

  if (stagedDoor) {
    const nudgeSign = entity.seatIndex % 2 ? 1 : -1;
    entity.x += nudgeSign * 0.32;
    entity.y += (entity.seatIndex % 3 - 1) * 0.12;
    constrain(entity);
    entity.target = stagedDoor;
    return;
  }

  entity.target = destination;
}

function teleportEntityOutsideCurrentDoor(entity, destination) {
  const currentRoom = roomAtPosition(entity);
  if (!currentRoom || currentRoom.type === 'corridor' || currentRoom.type === 'outdoor') return false;

  const destinationRoom = roomAtPosition(destination);
  // Only force a corridor teleport when they are actually trying to leave this room.
  if (destinationRoom && destinationRoom.name === currentRoom.name) return false;

  const exitDoor = roomDoors.find((door) => door.room === currentRoom.name);
  if (!exitDoor) return false;

  // Doorway rescue: if a pupil shudders in the threshold, place them just outside.
  entity.x = exitDoor.x;
  entity.y = exitDoor.exteriorY;
  entity.vx = 0;
  entity.vy = 0;
  entity.jamSeconds = 0;
  entity.stairJamSeconds = 0;
  entity.stuckSeconds = 0;
  entity.phaseThroughUntil = performance.now() + 900;
  constrain(entity);

  if (destination) entity.target = routeWaypoint(entity, destination);
  return true;
}

function teleportEntityToTarget(entity, target, reason = 'stuck') {
  if (!target) return;

  // Teleporting is a last-resort recovery so NPCs never remain blocked forever.
  entity.x = target.x;
  entity.y = target.y;
  entity.vx = 0;
  entity.vy = 0;
  entity.jamSeconds = 0;
  entity.stairJamSeconds = 0;
  entity.stuckSeconds = 0;
  entity.overlapSeconds = 0;
  entity.phaseThroughUntil = 0;
  constrain(entity);

  if (reason === 'overlap') {
    entity.target = null;
  }
}

function resolvePersistentOverlap(entity, currentPeriod, dtSeconds) {
  if (entity === player || entity.role === 'teacher') return;

  const overlapping = game.entities.find((other) => (
    other !== entity
    && other !== player
    && other.knockedUntil < performance.now()
    && distance(entity, other) < 0.36
  ));
  entity.overlapSeconds = overlapping ? (entity.overlapSeconds + dtSeconds) : 0;
  if (entity.overlapSeconds < 1.8) return;

  // During lessons, overlap recovery respawns to a deterministic seat assignment.
  const roomName = entity.lessonRoom || currentPeriod.room;
  const seatTarget = currentPeriod.mode === 'lesson'
    ? (getSeatPosition(roomName, entity.seatIndex, entity) || entity.target)
    : entity.target;
  teleportEntityToTarget(entity, seatTarget || roomCenter(currentPeriod.room), 'overlap');
}

function routeWaypoint(entity, destination) {
  const currentRoom = roomAtPosition(entity);
  const destinationRoom = roomAtPosition(destination);
  // If already inside the destination room, go directly to the desk/spot.
  if (currentRoom && destinationRoom && currentRoom.name === destinationRoom.name) return destination;

  // Critical ordering: always route out through the current room doorway first.
  // Without this guard, cross-floor targets (e.g. heading to the toilets) can
  // point at a staircase while the NPC is still boxed inside a classroom, which
  // causes corner-sliding and apparent "stuck in wall" behaviour.
  if (currentRoom && currentRoom.type !== 'corridor' && currentRoom.type !== 'outdoor') {
    const exitDoor = roomDoorway(currentRoom);
    if (exitDoor && distance(entity, exitDoor) > 0.95) return exitDoor;
  }

  const currentFloor = entityFloor(entity);
  const destinationFloor = destinationRoom?.floor || 'ground';

  if (currentFloor !== destinationFloor) {
    const nextFloor = nextFloorToward(currentFloor, destinationFloor);
    return nearestStairTarget(entity, currentFloor, nextFloor) || destination;
  }

  if (destinationRoom && destinationRoom.type !== 'corridor' && destinationRoom.type !== 'outdoor') {
    const entryDoor = roomDoorway(destinationRoom);
    const stagedDoor = doorwayStagingPoint(entity, entryDoor, destinationRoom);
    if (stagedDoor && distance(entity, stagedDoor) > 1.1) return stagedDoor;
  }

  return destination;
}

function tryUseStairs(entity, desiredFloor = null, options = {}) {
  const { repositionOnStairJam = false } = options;
  const currentFloor = entityFloor(entity);
  const intendedNextFloor = desiredFloor ? nextFloorToward(currentFloor, desiredFloor) : null;
  if (desiredFloor && desiredFloor === currentFloor) return false;
  for (const stair of stairs) {
    const currentStep = stairPointForFloor(stair, currentFloor);
    // Wider trigger matches the larger staircase artwork and lowers corner deadlocks.
    if (!withinStairEntry(entity, currentStep)) continue;
    const destinationFloor = stair.fromFloor === currentFloor ? stair.toFloor : stair.fromFloor;
    if (intendedNextFloor && destinationFloor !== intendedNextFloor) continue;
    const destinationStep = stairPointForFloor(stair, destinationFloor);
    if (!destinationStep) continue;

    // If congestion keeps someone on stair entry points for too long, hop sideways
    // on the same floor to a deterministic lane so others can still use the stairs.
    if (repositionOnStairJam && entity.stairJamSeconds > 1.35 && game.rng() < 0.45) {
      const escapeTarget = nearestStairEscapeTarget(entity, desiredFloor);
      if (escapeTarget) {
        teleportEntityToTarget(entity, escapeTarget, 'stair-jam');
        entity.target = routeWaypoint(entity, entity.target || escapeTarget);
        return true;
      }
    }

    entity.x = destinationStep.x;
    entity.y = destinationStep.y + (destinationFloor === 'upper' || destinationFloor === 'middle' ? 0.35 : -0.35);
    if (entity === player) playSfx('stair');
    return true;
  }
  return false;
}

function getRoomSeatLayout(roomName) {
  const room = roomByName(roomName);
  const supportsSeating = room && (room.type === 'classroom' || roomName === 'Assembly Hall');
  if (!supportsSeating) return null;
  if (roomSeatCache.has(roomName)) return roomSeatCache.get(roomName);

  if (roomName === 'Assembly Hall') {
    const studentCount = game.entities.filter((entity) => isStudentCharacter(entity)).length;
    // Slightly wider seat grid keeps front rows aligned with the rest of assembly.
    const cols = 12;
    const rows = Math.max(4, Math.ceil(studentCount / cols));
    const seats = [];
    const seatMinX = room.x + 2.1;
    const seatMaxX = room.x + room.w - 2.1;
    // Reserve extra top aisle space for teachers so first student row sits in line.
    const seatMinY = room.y + 6.4;
    const seatMaxY = room.y + room.h - 1.8;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = seatMinX + (col / Math.max(1, cols - 1)) * (seatMaxX - seatMinX);
        const y = seatMinY + (row / Math.max(1, rows - 1)) * (seatMaxY - seatMinY);
        seats.push({ x, y, row, col });
      }
    }
    const layout = {
      room: roomName,
      cols,
      rows,
      seats,
      boardX: room.x + room.w / 2,
      boardY: room.y + 2.1,
      teacherDesk: { ...assemblyHeadmasterSpot() },
      teacherSeat: { ...assemblyHeadmasterSpot() },
    };
    roomSeatCache.set(roomName, layout);
    return layout;
  }

  // Keep table count based on room geometry (existing layout), not student population.
  const usableW = Math.max(8, room.w - 8);
  const usableH = Math.max(5, room.h - 7);
  const cols = Math.max(3, Math.floor(usableW / 3));
  const rows = Math.max(2, Math.floor(usableH / 2.6));

  const seats = [];
  const seatMinX = room.x + 1.1;
  const seatMaxX = room.x + room.w - 2.2;
  const seatMinY = room.y + 2.2;
  const seatMaxY = room.y + room.h - 1.2;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const rawX = room.x + 4 + ((col + 0.5) / cols) * usableW;
      const rawY = room.y + 5 + ((row + 0.5) / rows) * usableH;
      // Clamp seats so tiny rooms (e.g. Headmaster Office) never spill desks into corridors/outside.
      const x = Math.max(seatMinX, Math.min(seatMaxX, rawX));
      const y = Math.max(seatMinY, Math.min(seatMaxY, rawY));
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
    // Each classroom gets a dedicated teacher station at the front.
    teacherDesk: { x: room.x + room.w / 2, y: room.y + 3.4 },
    teacherSeat: { x: room.x + room.w / 2, y: room.y + 4.4 },
  };
  roomSeatCache.set(roomName, layout);
  return layout;
}

function getSeatPosition(roomName, seatIndex, requester = null) {
  const layout = getRoomSeatLayout(roomName);
  if (!layout || !layout.seats.length) return null;

  // Assembly uses a dedicated student ordering so front rows fill evenly.
  if (roomName === 'Assembly Hall' && requester && isStudentCharacter(requester)) {
    const assemblyStudents = game.entities
      .filter((entity) => isStudentCharacter(entity))
      .sort((a, b) => a.seatIndex - b.seatIndex);
    const idx = Math.max(0, assemblyStudents.findIndex((entity) => entity === requester));
    return layout.seats[idx % layout.seats.length] || layout.seats[0];
  }

  const ericSlot = player.seatIndex % layout.seats.length;
  let slot = seatIndex % layout.seats.length;

  // Eric's assigned chair is permanently reserved in every classroom.
  if (requester && requester !== player && slot === ericSlot) {
    slot = (slot + 1) % layout.seats.length;
  }

  return layout.seats[slot];
}

function isEricAssignedSeat(roomName, seatIndex) {
  const ericSeat = getSeatPosition(roomName, player.seatIndex);
  const candidate = getSeatPosition(roomName, seatIndex);
  if (!ericSeat || !candidate) return false;
  return distance(ericSeat, candidate) < 0.12;
}

function ericSeatOccupant(roomName) {
  const ericSeat = getSeatPosition(roomName, player.seatIndex);
  if (!ericSeat) return null;
  return game.entities.find((entity) => (
    entity !== player
    && entity.isSeated
    && entity.seatedRoom === roomName
    && distance(entity, ericSeat) < 0.65
  )) || null;
}

function ericSeatWaitingSpot(roomName) {
  const seat = getSeatPosition(roomName, player.seatIndex);
  if (!seat) return roomCenter(roomName);
  return { x: seat.x - 0.9, y: seat.y + 0.45 };
}

function getTeacherSeatPosition(roomName) {
  const layout = getRoomSeatLayout(roomName);
  return layout?.teacherSeat || roomCenter(roomName);
}

function resetToSchoolMorning() {
  // New morning: everyone starts outside school gates before being led inside.
  schedule = buildScheduleForDay(game.dayCount);
  game.timeScale = (schedule.reduce((sum, period) => sum + period.mins, 0) / TARGET_DAY_REAL_SECONDS) * game.speedMultiplier;
  game.timeMinutes = SCHOOL_DAY_START_MINUTES;
  game.periodElapsed = 0;
  game.registrationTaken = false;
  initTutorialRollCallState();
  game.drinksToday = 0;
  game.dailyToiletVisits = 0;
  game.warnedNeedToilet = false;
  game.bladder = 0;
  game.litter = [];
  game.playerCarryingTrash = false;
  game.playerHeldItem = null;
  game.toiletDirt = Math.min(35, game.toiletDirt + 6);
  game.janitorTask = null;
  game.collectables = [];
  game.medicalEmergency = null;
  game.toiletsBlocked = false;
  game.toiletFloodUntil = 0;
  game.lastHygieneShameAt = 0;
  game.lastHygieneAuraAt = 0;
  game.smelledStudents = {};
  game.hygiene = Math.max(55, game.hygiene - 3);
  pickWeeklyWeather();
  game.dialogueDayKey += 1;
  game.playerComputerPlayUntil = 0;
  game.playerComputerStationId = null;
  game.ericSeatReservedToday = true;
  game.assemblyNextSpeechAt = 0;
  game.assemblyHymnAt = 0;
  game.assemblyUsedThoughts = new Set();

  if (game.dayCount > 1 && game.dayCount % TOILET_BLOCK_INTERVAL_DAYS === 0) {
    game.toiletsBlocked = true;
    game.toiletFloodUntil = performance.now() + TOILET_BLOCK_DURATION_MS;
    const toilets = roomByName('Toilets');
    queueJanitorTask({ type: 'flood', x: toilets.x + toilets.w / 2, y: toilets.y + toilets.h / 2, room: 'Toilets' });
    announce('🌊 Toilets blocked! Bathrooms flooded. Mr Mop is rushing to clean it up.', { force: true });
  }

  for (const entity of game.entities) {
    if (entity.refusesEricUntilDay && game.dayCount >= entity.refusesEricUntilDay) {
      // Gradual forgiveness: grudges can persist for days before interactions reopen.
      entity.refusesEricUntilDay = 0;
    }
    if (entity === player) {
      const playerLine = gateQueuePosition(player);
      entity.x = playerLine.x;
      entity.y = playerLine.y;
      entity.arrivedForDay = true;
      entity.arrivalJoinMins = 0;
    } else if (entity.role === 'teacher') {
      // Teachers now arrive in random order from the school entrance, then walk to line up.
      entity.x = schoolExit.x + 2.8 + (game.rng() * 1.2);
      entity.y = schoolExit.yMin + 1.2 + (game.rng() * (schoolExit.yMax - schoolExit.yMin - 2.4));
      entity.arrivedForDay = false;
      entity.arrivalJoinMins = game.rng() * Math.max(0.01, schedule[0].mins * 0.82);
      entity.target = null;
    } else if (entity.role === 'janitor') {
      const room = roomCenter(JANITOR_IDLE_ROOM);
      entity.x = room.x;
      entity.y = room.y;
      entity.arrivedForDay = true;
      entity.arrivalJoinMins = 0;
      entity.target = { ...room };
    } else if (entity.role === 'nurse') {
      const bay = roomCenter('Medical Bay');
      entity.x = bay.x;
      entity.y = bay.y;
      entity.arrivedForDay = false;
      entity.arrivalJoinMins = Infinity;
      entity.target = { ...bay };
    } else {
      // Students now also enter through the gate and then walk to area-2 queue slots.
      entity.x = schoolExit.x + 2.8 + (game.rng() * 1.2);
      entity.y = schoolExit.yMin + 1.2 + (game.rng() * (schoolExit.yMax - schoolExit.yMin - 2.4));
      entity.arrivedForDay = false;
      entity.arrivalJoinMins = game.rng() * Math.max(0.01, schedule[0].mins * 0.92);
      entity.target = null;
    }
    entity.vx = 0;
    entity.vy = 0;
    entity.carryingTrash = false;
    entity.hygiene = 100;
    entity.litterWarnUntil = 0;
    entity.assignedWaste = null;
    entity.knockoutCount = Math.max(0, (entity.knockoutCount || 0) - 1);
    entity.needsNurseUntil = 0;
  }

  game.playerLastX = player.x;
  game.playerLastY = player.y;
  game.playerStuckMs = 0;

  assignDailyDutyTeacher();
  assignDailyTradingCards();
  player.dailyCards = pickDailyCardsForEntity(player);
  updateCardCollectionFromCards(player.dailyCards);

  setPeriod(0);
  updateBladderHud();
  updateHygieneHud();
  updateWeatherHud();
  announce('🌅 New school day: teachers arrive from the gate and form a single line left of the black divider while students queue to the right.', { feedType: 'world' });
  announce(`🗄️ Lockers ready: ${game.lockerCapacity} total, ${game.lockerCoverage}% of students issued keys.`, { force: true });
  if (game.dutyTeacherName) {
    announce(`🧑‍🏫 Break duty today: ${game.dutyTeacherName} patrols the field and classrooms.`, { force: true });
  }
}

function updateAutoPilot(dt) {
  const current = schedule[game.periodIndex];
  const destination = chooseAutoDestination();
  const waypoint = routeWaypoint(player, destination);
  // Auto mode should mirror student travel speed so Eric no longer trails behind.
  // NPC students use hallwayBoost 3.3 with movement integrated at dt/1000,
  // while Eric's movement is integrated with dt*0.011, so divide by 11 for parity.
  const studentHallwayBoost = 3.3 / 11;
  // Match student "late for lesson" urgency so auto mode keeps up with corridor traffic.
  const lateForClass = current.mode === 'lesson' && entityRoom(player) !== current.room;
  const runBoost = lateForClass && player.energy > 20 ? 1.45 : 1;
  const speed = ((player.personality.speed * game.energy) / 100) * studentHallwayBoost * runBoost;

  const dx = waypoint.x - player.x;
  const dy = waypoint.y - player.y;
  const lenRaw = Math.hypot(dx, dy);
  const len = lenRaw || 1;

  // Arrival deadzone avoids tiny auto-corrections that look like shaking in queues.
  if (lenRaw < 0.12) {
    player.vx = 0;
    player.vy = 0;
    return;
  }

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
    if (game.toiletsBlocked) {
      announce('🚫 Eric needs the toilet, but bathrooms are flooded and closed!', { force: true });
    } else {
      announce('🚻 Eric needs the toilet soon. Head to TOILETS quickly.');
    }
  }

  if (!game.toiletsBlocked && entityRoom(player) === 'Toilets' && game.bladder >= 20) {
    game.bladder = 0;
    game.dailyToiletVisits += 1;
    game.toiletDirt = Math.min(TOILET_MAX_DIRT, game.toiletDirt + TOILET_DIRT_PER_USE);
    game.warnedNeedToilet = false;
    announce('✅ Eric used the toilet in time.');
  }

  if (game.bladder >= 100) {
    game.bladder = 20;
    game.warnedNeedToilet = false;
    game.hygiene = 0;
    addLines(60, 'wetting himself in school');
    announce('😳 Eric wet himself! Students start name-calling in the corridor.', { force: true });
    sendPlayerToHeadmaster('wetting himself while toilets were unavailable', 35);
    updateHygieneHud();
  }

  updateBladderHud();
}

function distance(a, b) {
  // Guard against transient null/undefined entities during spawn/reset frames.
  // Returning Infinity keeps proximity checks safe without crashing the game loop.
  if (!a || !b || typeof a.x !== 'number' || typeof a.y !== 'number' || typeof b.x !== 'number' || typeof b.y !== 'number') {
    return Number.POSITIVE_INFINITY;
  }
  return Math.hypot(a.x - b.x, a.y - b.y);
}


function isEntityVisibleToPlayer(entity, { margin = 1.5 } = {}) {
  if (!entity || entity === player) return true;
  // NPC chatter is only simulated for visible same-room actors to keep LLM queue pressure low.
  if (entityRoom(entity) !== entityRoom(player)) return false;
  const withinX = entity.x >= (CAMERA.x - margin) && entity.x <= (CAMERA.x + CAMERA.w + margin);
  const withinY = entity.y >= (CAMERA.y - margin) && entity.y <= (CAMERA.y + CAMERA.h + margin);
  return withinX && withinY;
}

function canPlayerHearSpeaker(source, range) {
  if (!source) return true;
  const sameRoom = entityRoom(source) === entityRoom(player);
  // Eric can still hear someone nearby in corridors, but distant classroom chatter stays local.
  return sameRoom || distance(source, player) <= range;
}

function isHeadmasterAddressActive(now = performance.now()) {
  const current = schedule[game.periodIndex];
  if (!isAssemblyPeriod(current)) return false;
  const headmaster = game.entities.find((entity) => entity.role === 'teacher' && entity.name === 'Mr Wacker');
  return Boolean(headmaster?.speech && headmaster.speech.until > now && entityRoom(headmaster) === 'Assembly Hall');
}

function canUseDialogue(entity, now, channel = 'speech') {
  // During headmaster address windows, everyone else stays quiet in assembly.
  if (channel === 'speech' && entity?.name !== 'Mr Wacker' && isHeadmasterAddressActive(now) && entityRoom(entity) === 'Assembly Hall') {
    return false;
  }
  // Off-screen or out-of-room NPCs stay silent and follow routines to avoid queue saturation.
  if (entity?.role !== 'player' && (channel === 'speech' || channel === 'thought') && !isEntityVisibleToPlayer(entity)) return false;
  const lastAt = channel === 'thought' ? (entity.lastThoughtAt || 0) : (entity.lastSpokeAt || 0);
  const inClassroom = channel === 'speech' && isSupervisedPeriod(schedule[game.periodIndex]) && entityRoom(entity) === schedule[game.periodIndex].room;
  const minInterval = inClassroom ? CLASSROOM_DIALOGUE_INTERVAL_MS : MIN_DIALOGUE_INTERVAL_MS;
  return now - lastAt >= minInterval;
}

function resetDialogueDayMemory(entity) {
  entity.dialogueMemory = { dayKey: game.dialogueDayKey, speech: new Set(), thought: new Set() };
}

function markDialogueUsed(entity, text, channel = 'speech') {
  if (!entity || !text) return false;
  if (!entity.dialogueMemory || entity.dialogueMemory.dayKey !== game.dialogueDayKey) resetDialogueDayMemory(entity);
  const bucket = entity.dialogueMemory[channel] || entity.dialogueMemory.speech;
  const normalized = String(text).trim();
  if (bucket.has(normalized)) return false;
  bucket.add(normalized);
  return true;
}

function pickFreshLine(entity, pool = [], channel = 'speech') {
  if (!pool?.length) return null;
  if (!entity.dialogueMemory || entity.dialogueMemory.dayKey !== game.dialogueDayKey) resetDialogueDayMemory(entity);
  const bucket = entity.dialogueMemory[channel] || entity.dialogueMemory.speech;
  const fresh = pool.filter((line) => !bucket.has(String(line).trim()));
  const choices = fresh.length ? fresh : pool;
  return choices[Math.floor(game.rng() * choices.length)];
}

function inferSpeechAddressee(speaker, opts = {}) {
  if (!speaker) return null;
  if (opts.addressee) return opts.addressee;
  if (opts.peer) return opts.peer;
  if (opts.target) return opts.target;

  // Choose a nearby named person in the same room so student speech sounds directed.
  const sameRoom = game.entities.filter((entity) => {
    if (!entity || entity === speaker || !entity.name) return false;
    if (entityRoom(entity) !== entityRoom(speaker)) return false;
    return distance(entity, speaker) <= 8.5;
  });
  if (!sameRoom.length) return null;

  // Students prefer speaking to teachers first, then nearest student.
  if (speaker.role === 'student') {
    const teacher = sameRoom.find((entity) => entity.role === 'teacher');
    if (teacher) return teacher;
  }
  return sameRoom.sort((a, b) => distance(a, speaker) - distance(b, speaker))[0] || null;
}


function deliverResolvedSpeech(entity, resolvedText, addressee, opts = {}, now = performance.now()) {
  const finalSpeech = entity.role === 'student' && addressee?.name
    ? ensureAddressedNameInSpeech(resolvedText, addressee.name)
    : sanitizeLlmLine(resolvedText, '...');
  if (!opts.force && !markDialogueUsed(entity, finalSpeech, 'speech')) return false;
  entity.speech = { text: finalSpeech, kind: opts.kind || 'speech', until: now + (opts.durationMs || 2600) };
  entity.lastSpokeAt = now;
  const feedRange = typeof opts.feedRange === 'number' ? opts.feedRange : 8;
  const shouldLogSpeech = opts.logToFeed !== false && canPlayerHearSpeaker(entity, feedRange);
  if (shouldLogSpeech) pushFeedEvent(`${entity.name}: ${finalSpeech}`, 'speech');
  if (addressee?.name) recordNpcConversationTurn(entity, addressee, finalSpeech);
  return true;
}

function deliverResolvedThought(entity, resolvedText, durationMs = 3200, opts = {}, now = performance.now()) {
  const thoughtText = sanitizeLlmLine(resolvedText, '...');
  if (!markDialogueUsed(entity, thoughtText, 'thought')) return false;
  entity.thought = { text: thoughtText, until: now + durationMs };
  entity.lastThoughtAt = now;
  const feedRange = typeof opts.feedRange === 'number' ? opts.feedRange : 7.2;
  if (opts.logToFeed !== false && canPlayerHearSpeaker(entity, feedRange)) {
    pushFeedEvent(`💭 ${entity.name}: ${thoughtText}`, 'thought');
  }
  return true;
}

function flushDeferredLlmDialogue(now = performance.now()) {
  for (const entity of game.entities) {
    if (!entity) continue;
    const pendingSpeech = entity.pendingSpeech;
    if (pendingSpeech) {
      const key = llmCacheKey(pendingSpeech.payload);
      const cached = game.llm.cache.get(key);
      if (cached) {
        deliverResolvedSpeech(entity, cached, pendingSpeech.addressee, pendingSpeech.opts, now);
        entity.pendingSpeech = null;
      } else if (now - pendingSpeech.createdAt > 24000) {
        pushLlmDebug(`🧼 Dropped stale deferred speech for ${entity.name} (no fallback used).`, 'warn');
        entity.pendingSpeech = null;
      }
    }

    const pendingThought = entity.pendingThought;
    if (pendingThought) {
      const key = llmCacheKey(pendingThought.payload);
      const cached = game.llm.cache.get(key);
      if (cached) {
        deliverResolvedThought(entity, cached, pendingThought.durationMs, pendingThought.opts, now);
        entity.pendingThought = null;
      } else if (now - pendingThought.createdAt > 24000) {
        pushLlmDebug(`🧼 Dropped stale deferred thought for ${entity.name} (no fallback used).`, 'warn');
        entity.pendingThought = null;
      }
    }
  }
}

function ensureAddressedNameInSpeech(line, addresseeName) {
  const text = sanitizeLlmLine(line, '...');
  if (!addresseeName) return text;
  const hasName = new RegExp(`\\b${addresseeName.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')}\\b`, 'i').test(text);
  if (hasName) return text;
  return `${addresseeName}, ${text}`;
}

function say(entity, text, opts = {}) {
  if (!entity || !text) return;
  const now = performance.now();
  // Keep off-screen NPCs silent to reduce LLM queue pressure and maintain local readability.
  if (entity.role !== 'player' && !isEntityVisibleToPlayer(entity) && !opts.allowOffscreenSpeech) return;
  if (!opts.force && !canUseDialogue(entity, now, 'speech')) return;
  // Some pupils are naturally quiet; they often skip optional chatter.
  const silenceBias = clampScore(55 - ((entity.traits?.friendly || 40) * 0.28) - ((entity.traits?.funny || 40) * 0.18) + ((entity.traits?.discipline || 40) * 0.08), 8, 70);
  if (!opts.force && Math.random() < (silenceBias / 100)) return;
  const addressee = inferSpeechAddressee(entity, opts);
  const threadContext = recentConversationContext(entity, addressee);
  const threadKey = addressee ? conversationThreadKey(entity, addressee) : '';
  const threadTurn = threadKey ? ((game.npcConversations[threadKey] || []).length + 1) : 0;
  const payload = {
    channel: 'speech',
    subject: roomSubjectName(entityRoom(entity)),
    speaker: entity.name,
    speakerRole: roleLabelForLlm(entity.role),
    traitSummary: summarizeTraitBundle(entity.traits),
    room: entityRoom(entity),
    addresseeName: addressee?.name || '',
    addresseeRole: addressee ? roleLabelForLlm(addressee.role) : '',
    conversationContext: threadContext,
    conversationTurn: threadTurn,
    fallback: String(text),
  };

  const shouldDefer = llmModeEnabled() && (game.llm.noFallback || opts.force !== true);
  const spokenText = resolveLlmText(payload, { allowFallback: !shouldDefer });
  if (!spokenText && shouldDefer) {
    const pendingKey = entity.pendingSpeech ? llmCacheKey(entity.pendingSpeech.payload) : '';
    const requestKey = llmCacheKey(payload);
    if (pendingKey === requestKey) return;
    // Keep the interaction responsive by deferring until model output lands, instead of using fallback text.
    entity.pendingSpeech = {
      payload,
      addressee,
      opts: { ...opts },
      createdAt: now,
    };
    return;
  }

  deliverResolvedSpeech(entity, spokenText || String(text), addressee, opts, now);
}

function think(entity, text, durationMs = 3200, opts = {}) {
  if (!entity || !text) return;
  const now = performance.now();
  if (entity.role !== 'player' && !isEntityVisibleToPlayer(entity) && !opts.allowOffscreenSpeech) return;
  if (!canUseDialogue(entity, now, 'thought')) return;
  const payload = {
    channel: 'thought',
    subject: roomSubjectName(entityRoom(entity)),
    speaker: entity.name,
    speakerRole: roleLabelForLlm(entity.role),
    traitSummary: summarizeTraitBundle(entity.traits),
    room: entityRoom(entity),
    addresseeName: '',
    addresseeRole: '',
    fallback: String(text),
  };
  const shouldDefer = llmModeEnabled() && game.llm.noFallback;
  const thoughtText = resolveLlmText(payload, { allowFallback: !shouldDefer });
  if (!thoughtText && shouldDefer) {
    const pendingKey = entity.pendingThought ? llmCacheKey(entity.pendingThought.payload) : '';
    const requestKey = llmCacheKey(payload);
    if (pendingKey === requestKey) return;
    entity.pendingThought = {
      payload,
      durationMs,
      opts: { ...opts },
      createdAt: now,
    };
    return;
  }
  deliverResolvedThought(entity, thoughtText || String(text), durationMs, opts, now);
}

function tradeChanceFor(actor, partner, isPlayerInitiated = false) {
  const actorTrading = actor.traits?.trading || 40;
  const actorBarter = actor.traits?.barter || 35;
  const partnerGuard = partner.traits?.discipline || 50;
  const relation = partner.relationships?.Eric || 0;
  const base = isPlayerInitiated
    ? 0.28 + (actorTrading / 200) + (actorBarter / 190)
    : 0.1 + (actorTrading / 260);
  return Math.max(0.08, Math.min(0.92, base + (relation / 240) - (partnerGuard / 420)));
}

function tryTrade(actor, partner, { isPlayerInitiated = false } = {}) {
  if (!actor || !partner || actor === partner) return false;
  const now = performance.now();
  if ((now - (actor.lastTradeAt || 0)) < MIN_DIALOGUE_INTERVAL_MS || (now - (partner.lastTradeAt || 0)) < MIN_DIALOGUE_INTERVAL_MS) return false;
  if (!actor.inventory?.length || !partner.inventory?.length) return false;

  if (Math.random() > tradeChanceFor(actor, partner, isPlayerInitiated)) return false;
  const actorOfferIndex = Math.floor(Math.random() * actor.inventory.length);
  const partnerOfferIndex = Math.floor(Math.random() * partner.inventory.length);
  const actorOffer = actor.inventory[actorOfferIndex];
  const partnerOffer = partner.inventory[partnerOfferIndex];
  const price = 1 + Math.floor(Math.random() * 4);

  const barterPower = (actor.traits?.barter || 40) + ((actor.traits?.trading || 40) * 0.4);
  const generosityRoll = (barterPower / 160) + ((partner.relationships?.Eric || 0) / 120);
  const freebie = isPlayerInitiated && Math.random() < Math.max(0.03, Math.min(0.55, generosityRoll));

  if (!freebie) {
    if ((actor.money || 0) < price) return false;
    actor.money -= price;
    partner.money = (partner.money || 0) + price;
  }

  actor.inventory.splice(actorOfferIndex, 1);
  partner.inventory.splice(partnerOfferIndex, 1);
  actor.inventory.push(partnerOffer);
  partner.inventory.push(actorOffer);
  actor.lastTradeAt = now;
  partner.lastTradeAt = now;

  if (isPlayerInitiated) {
    announce(freebie
      ? `🆓 ${partner.name} was charmed by Eric's bartering and swapped ${partnerOffer} for free!`
      : `🤝 Eric traded ${actorOffer} for ${partnerOffer} with ${partner.name} (£${price}).`, { source: actor, range: 8, force: true });
  } else if (canPlayerHearSpeaker(actor, 7.2) || canPlayerHearSpeaker(partner, 7.2)) {
    announce(`🤝 ${actor.name} and ${partner.name} swapped ${actorOffer} and ${partnerOffer}.`, { source: actor, range: 7.2 });
  }
  return true;
}

function hasVideoGameItem(entity) {
  return Boolean(entity?.inventory?.some((item) => /video game/i.test(String(item))));
}

function itemTradeValue(item) {
  const label = String(item || '').toLowerCase();
  if (label.includes('video game')) return 14;
  if (label.includes('walkman') || label.includes('toy robot')) return 10;
  if (label.includes('trading card')) return 8;
  return 4 + Math.min(5, Math.floor(label.length / 4));
}

function attemptInteractionTrade(target, { haggle = false } = {}) {
  if (!target || target === player) return false;
  if (!player.inventory?.length || !target.inventory?.length) {
    announce('🎒 Trade failed: someone has no items to swap.');
    return false;
  }

  const actorOffer = player.inventory[Math.floor(game.rng() * player.inventory.length)];
  const partnerOffer = target.inventory[Math.floor(game.rng() * target.inventory.length)];
  const relation = target.relationships?.Eric || 0;
  const friendliness = target.traits?.friendly || 50;
  const discipline = target.traits?.discipline || 50;
  const playerBarter = (player.traits?.barter || 50) + (haggle ? 18 : 0);
  const acceptance = 0.26 + (relation / 180) + (friendliness / 280) + (playerBarter / 220) - (discipline / 360);

  const actorValue = itemTradeValue(actorOffer);
  const partnerValue = itemTradeValue(partnerOffer);
  const valueGap = partnerValue - actorValue;
  const worthTolerance = 2 + ((target.traits?.trading || 45) / 28);

  if (valueGap > worthTolerance && !haggle) {
    announce(`🤨 ${target.name} thinks ${actorOffer} is not worth ${partnerOffer}. Try haggling.`, { source: target, range: 8, force: true });
    adjustEricRelationship(target, -1.5, 'trade-refused');
    return false;
  }

  const haggleRisk = haggle ? 0.12 : 0;
  const accepted = game.rng() < Math.max(0.06, Math.min(0.94, acceptance - haggleRisk + ((worthTolerance - valueGap) / 14)));
  if (!accepted) {
    announce(`🙅 ${target.name} refused the ${haggle ? 'haggle' : 'trade'} offer.`, { source: target, range: 8, force: true });
    adjustEricRelationship(target, haggle ? -3 : -2, haggle ? 'haggle-failed' : 'trade-failed');
    return false;
  }

  const actorIdx = player.inventory.indexOf(actorOffer);
  const partnerIdx = target.inventory.indexOf(partnerOffer);
  if (actorIdx < 0 || partnerIdx < 0) return false;
  player.inventory.splice(actorIdx, 1);
  target.inventory.splice(partnerIdx, 1);
  player.inventory.push(partnerOffer);
  target.inventory.push(actorOffer);

  const price = haggle ? 0 : Math.max(0, Math.floor((partnerValue - actorValue) / 3));
  if (price > 0 && player.money >= price) {
    player.money -= price;
    target.money = (target.money || 0) + price;
  }

  adjustEricRelationship(target, haggle ? 2.5 : 2, haggle ? 'haggle-trade' : 'trade-success');
  announce(`🤝 Eric traded ${actorOffer} for ${partnerOffer}${price > 0 ? ` (+£${price})` : ''} with ${target.name}.`, { source: target, range: 8, force: true });
  return true;
}

function wrapBubbleText(text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !currentLine) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 4);
}

function drawRoundedBubble(x, y, lines, style) {
  const {
    paddingX, paddingY, lineHeight, radius,
    fillColor, strokeColor, shadowColor, shadowBlur,
    textColor, font, tailOffsetX = 10,
    bubblyTail = false,
  } = style;

  ctx.font = font;
  const bubbleWidth = Math.max(...lines.map((line) => ctx.measureText(line).width), 28) + (paddingX * 2);
  const bubbleHeight = (lines.length * lineHeight) + (paddingY * 2);
  const left = Math.round(x - bubbleWidth / 2);
  const top = Math.round(y - bubbleHeight);

  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(left, top, bubbleWidth, bubbleHeight, radius);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Tail keeps speech/thought ownership clear while preserving the rounded card style.
  if (bubblyTail) {
    // Thought bubbles get smaller trailing circles so they read as "thinking" at a glance.
    const bubbleTrail = [
      { x: left + tailOffsetX + 6, y: top + bubbleHeight + 4, r: 3.6 },
      { x: left + tailOffsetX + 11, y: top + bubbleHeight + 9, r: 2.7 },
      { x: left + tailOffsetX + 15, y: top + bubbleHeight + 13, r: 2.1 },
    ];
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    for (const bubble of bubbleTrail) {
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.beginPath();
    ctx.moveTo(left + tailOffsetX, top + bubbleHeight);
    ctx.lineTo(left + tailOffsetX + 8, top + bubbleHeight);
    ctx.lineTo(left + tailOffsetX + 4, top + bubbleHeight + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = textColor;
  ctx.font = font;
  lines.forEach((line, index) => {
    ctx.fillText(line, left + paddingX, top + paddingY + ((index + 1) * lineHeight) - 2);
  });
}

function renderEventFeed() {
  if (!eventsEl) return;
  const visible = game.eventLog
    .filter((entry) => game.eventFilters[entry.type] !== false)
    .slice(0, 14);
  eventsEl.innerHTML = visible
    .map((entry) => `<div class="event-line ${entry.type}">[${entry.time}] ${entry.message}</div>`)
    .join('');
}

function pushFeedEvent(message, type = 'action', timeMins = game.timeMinutes) {
  game.eventLog.unshift({ message: String(message), type, time: formatTime(timeMins) });
  game.eventLog = game.eventLog.slice(0, 64);
  renderEventFeed();
}

function announce(message, options = {}) {
  const {
    source = null,
    range = 6.5,
    force = false,
    feedType = 'action',
  } = options;

  // Speech-style events can be local so the feed reflects what Eric can realistically hear.
  if (!force && source && !canPlayerHearSpeaker(source, range)) return;
  const finalMessage = resolveLlmText({
    channel: source ? 'speech' : 'announcement',
    subject: source ? roomSubjectName(entityRoom(source)) : roomSubjectName(schedule[game.periodIndex]?.room),
    speaker: source?.name || 'Narrator',
    speakerRole: source ? roleLabelForLlm(source.role) : 'narrator',
    traitSummary: source ? summarizeTraitBundle(source.traits) : 'neutral',
    room: source ? entityRoom(source) : (schedule[game.periodIndex]?.room || 'School'),
    fallback: String(message),
  });

  if (source) {
    const spoken = String(finalMessage).replace(/^.*?:\s*"?/, '').replace(/"$/, '').trim();
    say(source, spoken || '...');
  }

  game.announcements.unshift(`[${formatTime(game.timeMinutes)}] ${finalMessage}`);
  game.announcements = game.announcements.slice(0, 12);
  pushFeedEvent(finalMessage, feedType);
}

function getSfxContext() {
  if (!sfxState.enabled) return null;
  if (!sfxState.ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      sfxState.enabled = false;
      return null;
    }
    sfxState.ctx = new Ctx();
  }
  if (sfxState.ctx.state === 'suspended') sfxState.ctx.resume();
  return sfxState.ctx;
}

function playSfx(kind) {
  const ctx = getSfxContext();
  if (!ctx) return;

  const presets = {
    door: { freq: 420, endFreq: 250, duration: 0.09, type: 'square', gain: 0.035 },
    stair: { freq: 310, endFreq: 520, duration: 0.12, type: 'triangle', gain: 0.038 },
    interact: { freq: 520, endFreq: 470, duration: 0.06, type: 'sine', gain: 0.03 },
    // Short per-character chalk tick for board writing animation.
    chalk: { freq: 1450, endFreq: 980, duration: 0.03, type: 'triangle', gain: 0.012 },
    urinal: { freq: 680, endFreq: 420, duration: 0.11, type: 'sine', gain: 0.03 },
    weather: { freq: 260, endFreq: 330, duration: 0.08, type: 'triangle', gain: 0.02 },
    bell: { freq: 980, endFreq: 740, duration: 0.26, type: 'triangle', gain: 0.05 },
  };
  const preset = presets[kind] || presets.interact;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime;
  const end = start + preset.duration;

  osc.type = preset.type;
  osc.frequency.setValueAtTime(preset.freq, start);
  osc.frequency.linearRampToValueAtTime(preset.endFreq, end);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(preset.gain, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(end + 0.01);
}


// Keep board updates centralized so every text change resets the writing reveal state.
function setBoardText(board, text) {
  const nextText = String(text || '').toUpperCase();
  board.text = nextText;
  board.revealChars = 0;
  board.lastSfxAt = 0;
}


function normalizeAnswerText(text) {
  return String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function randomFunnyWrongAnswer() {
  const funny = [
    'my dog ate the textbook',
    'definitely cheese',
    'i blame gravity',
    'banana squared',
    'the answer is vibes',
    '42-ish maybe?',
    'ask the janitor',
  ];
  return funny[Math.floor(game.rng() * funny.length)];
}

function pickClassQuestion(roomName) {
  const subject = roomSubjectName(roomName);
  const bank = SUBJECT_QUESTION_BANK[subject] || SUBJECT_QUESTION_BANK.General || SUBJECT_QUESTION_BANK.Maths;
  const idx = Math.floor(game.rng() * bank.length);
  const base = bank[idx] || { q: 'What is 6 × 7?', answer: '42', choices: ['42', '36', '48', '54'] };
  const choices = [...(base.choices || [])].slice(0, 4);
  while (choices.length < 4) choices.push(randomFunnyWrongAnswer());
  const shuffled = choices.sort(() => game.rng() - 0.5);
  const fallbackQuiz = {
    ...base,
    q: String(base.q || '').trim(),
    answer: normalizeAnswerText(base.answer),
    choices: shuffled.map((choice) => String(choice)),
    subject,
    roomName,
  };
  return resolveLlmQuizQuestion(fallbackQuiz);
}

function clearClassQuestionUi() {
  if (classQuestionPanelEl) classQuestionPanelEl.hidden = true;
  if (classQuestionChoicesEl) classQuestionChoicesEl.innerHTML = '';
}

function teacherFeedbackLine(teacher, student, correct) {
  const studentName = student?.name || 'Student';
  if (correct) {
    const praise = [
      `Excellent work, ${studentName}.`,
      `${studentName}, that is spot on.`,
      `Brilliant answer, ${studentName}.`,
      `${studentName}, keep that focus — correct.`,
    ];
    return `✅ ${teacher.name}: "${praise[Math.floor(game.rng() * praise.length)]}"`;
  }
  const corrections = [
    `${studentName}, not this time — read the board carefully.`,
    `${studentName}, close, but that is incorrect.`,
    `${studentName}, brave attempt. Let us fix that together.`,
    `${studentName}, wrong answer. Try the key idea first.`,
  ];
  return `❌ ${teacher.name}: "${corrections[Math.floor(game.rng() * corrections.length)]}"`;
}

function resolveClassQuestionAttempt(quiz, student, attemptText, forcedCorrect = false) {
  if (!quiz || quiz.resolved) return;
  const normalized = normalizeAnswerText(attemptText);
  const isCorrect = forcedCorrect || normalized === quiz.answer;
  quiz.resolved = true;
  quiz.resolvedBy = student.name;
  quiz.resolvedCorrect = isCorrect;
  quiz.answerText = normalized;

  say(student, normalized || randomFunnyWrongAnswer(), { durationMs: 3000, force: true });
  announce(`📣 ${student.name} answers: "${normalized || '...'}"`, { source: student, range: 9, force: true });
  announce(teacherFeedbackLine(quiz.teacher, student, isCorrect), { source: quiz.teacher, range: 9, force: true });
  if (!isCorrect) addLines(10, `${student.name} gave a wrong class answer`);

  if (student === player) {
    game.charisma = Math.max(0, Math.min(100, game.charisma + (isCorrect ? 2 : -1)));
    updateCharismaHud();
  }

  clearClassQuestionUi();
  setTimeout(() => {
    if (game.quizActive === quiz) game.quizActive = null;
  }, 350);
}

function showClassQuestionUi(quiz) {
  if (!classQuestionPanelEl || !classQuestionChoicesEl || !classQuestionPromptEl || !classQuestionCountdownEl || !classQuestionTitleEl) return;
  classQuestionTitleEl.textContent = `🧑‍🏫 ${quiz.teacher.name} asks (${quiz.subject})`;
  classQuestionPromptEl.textContent = quiz.q;
  classQuestionChoicesEl.innerHTML = '';

  quiz.choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'class-question-choice';
    btn.title = `Answer option ${idx + 1}`;
    btn.textContent = `${String.fromCharCode(65 + idx)}. ${choice}`;
    btn.onclick = () => {
      if (quiz.resolved) return;
      resolveClassQuestionAttempt(quiz, player, choice);
    };
    classQuestionChoicesEl.appendChild(btn);
  });

  classQuestionPanelEl.hidden = false;
  positionClassQuestionPanel(quiz.roomName || schedule[game.periodIndex]?.room);
}

function updateClassQuestionSystem(now = performance.now()) {
  const quiz = game.quizActive;
  if (!quiz) {
    clearClassQuestionUi();
    return;
  }
  if (quiz.resolved) return;

  const msLeft = Math.max(0, Math.ceil((quiz.playerWindowUntil - now) / 1000));
  if (classQuestionCountdownEl) classQuestionCountdownEl.textContent = msLeft > 0 ? `⏳ ${msLeft}s for Eric` : '⏳ Class can jump in';

  if (now <= quiz.playerWindowUntil) return;
  if (now < (quiz.nextNpcAttemptAt || 0)) return;

  const current = schedule[game.periodIndex];
  const students = game.entities.filter((entity) => entity !== player && isStudentCharacter(entity) && entityRoom(entity) === current.room && entity.knockedUntil < now);
  if (!students.length) return;

  const swots = students.filter((entity) => entity.role === 'swot');
  const instantSwotChance = swots.length && game.rng() < 0.34;
  const responder = instantSwotChance
    ? swots[Math.floor(game.rng() * swots.length)]
    : students[Math.floor(game.rng() * students.length)];

  let spokenAnswer = randomFunnyWrongAnswer();
  let correct = false;
  if (responder.role === 'swot' && game.rng() < 0.72) {
    spokenAnswer = quiz.answer;
    correct = true;
  } else if (responder.role === 'hero' && game.rng() < 0.35) {
    spokenAnswer = quiz.answer;
    correct = true;
  } else if (game.rng() < 0.2) {
    spokenAnswer = quiz.choices[Math.floor(game.rng() * quiz.choices.length)] || randomFunnyWrongAnswer();
    correct = normalizeAnswerText(spokenAnswer) === quiz.answer;
  }

  resolveClassQuestionAttempt(quiz, responder, spokenAnswer, correct);
}
function maybeStartClassQuestion(current, now) {
  if (!isSupervisedPeriod(current) || isRegistrationPeriod(current) || isAssemblyPeriod(current)) return;
  if (game.quizActive) return;
  if (now - (game.lastClassQuestionAt || 0) < 28000) return;
  const teacher = assignedTeacherEntityForPeriod(current);
  if (!teacher || entityRoom(teacher) !== current.room || teacher.knockedUntil > now) return;
  if (!isAssignedTeacherSeatedForPeriod(current) && game.rng() < 0.5) return;
  if (game.rng() > 0.0028 + (game.lessonNoiseLevel * 0.0015)) return;

  const quiz = pickClassQuestion(current.room);
  const board = blackboards.find((entry) => entry.room === current.room);
  if (board) setBoardText(board, quiz.q);

  game.quizActive = {
    ...quiz,
    teacher,
    askedAt: now,
    playerWindowUntil: now + 5600,
    nextNpcAttemptAt: now + 5600 + (game.rng() * 1200),
    resolved: false,
    roomName: current.room,
  };
  game.lastClassQuestionAt = now;
  showClassQuestionUi(game.quizActive);
  announce(`🧑‍🏫 ${teacher.name}: "${quiz.subject} question for Eric first."`, { source: teacher, range: 9, force: true });
}



function boardLinesForText(text) {
  const words = String(text || '').toUpperCase().split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    if (!line) {
      line = word;
      continue;
    }
    const candidate = `${line} ${word}`;
    if (candidate.length <= BOARD_DRAW.maxCharsPerLine) {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length >= BOARD_DRAW.maxLines) break;
  }

  if (lines.length < BOARD_DRAW.maxLines && line) lines.push(line);
  return lines.slice(0, BOARD_DRAW.maxLines);
}

function visibleBoardText(board) {
  const revealCount = Math.floor(board.revealChars || 0);
  return String(board.text || '').slice(0, revealCount);
}

function updateBoardWriting(dt) {
  const now = performance.now();

  for (const board of blackboards) {
    if (!board.text) continue;

    // Letters appear progressively so boards look like they are being written in class.
    const revealCap = board.text.length;
    board.revealChars = Math.min(revealCap, (board.revealChars || 0) + ((board.revealSpeed || 30) * (dt / 1000)));

    const revealCount = Math.floor(board.revealChars || 0);
    if (revealCount <= 0 || revealCount >= revealCap) continue;

    // Audio tick is throttled to avoid noisy spam while preserving the chalk-writing effect.
    if (now - (board.lastSfxAt || 0) > 95) {
      playSfx('chalk');
      board.lastSfxAt = now;
    }
  }
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
    `Hygiene: ${Math.round(game.hygiene)}%`,
    `Weather: ${(weatherModes[game.weather] || weatherModes.sunny).label}`,
    `Break duty teacher: ${game.dutyTeacherName || 'Unassigned'}`,
    `Dinner Lady Dot: kitchen prep outside lunch, field duty at lunch`,
    `Energy should stay above 25`,
    `Use vending machines for snacks/drinks, then bin packaging`,
    `Use outside fountains (H2O) to lower bladder pressure`,
    `Throwing rubbish (V) can KO pupils but teachers punish witnesses`,
    `Mr Mop cleans old litter after 20s and scrubs dirty toilets`,
    `Rain: students shelter indoors | Snow: snowball chatter | Sun: football | Wind: running`,
    `If toilets are blocked/flooded, avoid bladder emergencies until they reopen`,
    `Avoid teachers while bunking`,
  ];

  // Keep full objectives in the dialog list and condensed objectives in the one-line carousel.
  todoEl.innerHTML = todoItems.map((t) => `<li>${t}</li>`).join('');
  if (todoCarouselTextEl) {
    todoCarouselTextEl.textContent = todoItems.join('  •  ');
  }
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

function isInDoorOpening(room, x, y) {
  const doorway = roomDoorway(room);
  if (!doorway) return false;
  const corridorY = room.floor === 'upper' ? 17 : room.floor === 'middle' ? 52 : room.floor === 'ground' ? 78 : 112;
  const openingEdgeY = Math.abs(room.y - corridorY) <= Math.abs((room.y + room.h) - corridorY)
    ? room.y
    : room.y + room.h;
  return Math.abs(x - doorway.x) <= 1.8 && Math.abs(y - openingEdgeY) <= 1.1;
}

function isWalkablePoint(x, y) {
  if (x < 1 || x > WORLD.w - 1 || y < 1 || y > WORLD.h - 1) return false;
  const containingRooms = rooms.filter((room) => x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h);
  if (!containingRooms.length) return false;

  return containingRooms.some((room) => {
    if (room.type === 'corridor' || room.type === 'outdoor') return true;

    const wallThickness = 0.82;
    const insideInterior = (
      x >= room.x + wallThickness
      && x <= room.x + room.w - wallThickness
      && y >= room.y + wallThickness
      && y <= room.y + room.h - wallThickness
    );
    return insideInterior || isInDoorOpening(room, x, y);
  });
}

function moveEntityWithCollision(entity, deltaX, deltaY) {
  const nextX = entity.x + deltaX;
  const nextY = entity.y + deltaY;

  if (isWalkablePoint(nextX, nextY)) {
    entity.x = nextX;
    entity.y = nextY;
    return;
  }

  // Axis-separated fallback gives natural wall sliding and keeps controls responsive.
  if (isWalkablePoint(nextX, entity.y)) entity.x = nextX;
  if (isWalkablePoint(entity.x, nextY)) entity.y = nextY;
}

function nearestWalkablePoint(origin, candidates = []) {
  const points = [origin, ...candidates].filter(Boolean);
  for (const point of points) {
    if (isWalkablePoint(point.x, point.y)) return point;

    // Spiral-style local probe around each candidate to find nearest valid ground.
    for (let radius = 0.45; radius <= 3; radius += 0.45) {
      for (let a = 0; a < 360; a += 30) {
        const rad = (a * Math.PI) / 180;
        const test = { x: point.x + Math.cos(rad) * radius, y: point.y + Math.sin(rad) * radius };
        if (isWalkablePoint(test.x, test.y)) return test;
      }
    }
  }
  return null;
}

function recoverPlayerIfWallStuck(dt) {
  const moved = Math.hypot(player.x - game.playerLastX, player.y - game.playerLastY);
  const pushingInput = Math.abs(player.vx) + Math.abs(player.vy) > 0.02;
  const insideWalkable = isWalkablePoint(player.x, player.y);

  if (!insideWalkable || (pushingInput && moved < 0.003)) {
    game.playerStuckMs += dt;
  } else {
    game.playerStuckMs = Math.max(0, game.playerStuckMs - (dt * 2));
  }

  game.playerLastX = player.x;
  game.playerLastY = player.y;

  if (game.playerStuckMs < 1100) return;

  const current = schedule[game.periodIndex];
  const preferred = [
    getSeatPosition(current.room, player.seatIndex, player),
    roomCenter(current.room),
    roomCenter('Ground Corridor'),
  ];
  const safe = nearestWalkablePoint({ x: player.x, y: player.y }, preferred);
  if (!safe) return;

  player.x = safe.x;
  player.y = safe.y;
  player.vx = 0;
  player.vy = 0;
  player.isSeated = false;
  player.seatedRoom = null;
  game.playerStuckMs = 0;
  announce('🛟 Eric was stuck in a wall and got auto-unstuck.', { force: true });
}

function setPeriod(index) {
  game.periodIndex = index % schedule.length;
  game.periodElapsed = 0;
  game.periodHoldMinutes = 0;
  game.latePenaltyGiven = false;
  game.ericSeatBlockedWarned = false;
  game.ericSeatDecisionPrompted = false;
  const current = schedule[game.periodIndex];
  // Bell changes stand everyone up and clears stale routes between periods.
  player.isSeated = false;
  player.seatedRoom = null;
  for (const entity of game.entities) {
    if (entity === player) continue;
    entity.target = null;
    entity.isSeated = false;
    entity.seatedRoom = null;
    // Bell release: students instantly stand and transition toward the next room.
    entity.bellRushUntil = performance.now() + 4200;
  }
  if (isRegistrationPeriod(current)) game.registrationTaken = false;

  // Board content changes each bell to emulate lesson instructions.
  blackboards.forEach((board) => {
    if (board.room === current.room) {
      setBoardText(board, lessonTasks[Math.floor(game.rng() * lessonTasks.length)]);
    } else if (game.rng() < 0.3) {
      setBoardText(board, 'NO RUNNING IN CORRIDORS');
    } else {
      setBoardText(board, '');
    }
  });

  if (isStartDayPeriod(current)) {
    announce('👨‍🏫 Teachers line up in a single file left of the black divider while students queue to the right.');
  }

  game.bellRingingUntil = performance.now() + 3000;
  announce(`🔔 Bell! ${current.period} in ${current.room}`, { feedType: 'world' });
  if (current.period === 'Lunch Break') {
    announce('🍽️ Lunch service is open in the dining hall for 30 minutes.', { feedType: 'world' });
    for (const entity of game.entities) {
      if (isStudentCharacter(entity)) resetLunchState(entity);
    }
  } else {
    for (const entity of game.entities) {
      if (isStudentCharacter(entity)) resetLunchState(entity);
    }
  }
  if (isAssemblyPeriod(current)) {
    const headmaster = game.entities.find((entity) => entity.role === 'teacher' && entity.name === 'Mr Wacker');
    game.assemblyNextSpeechAt = performance.now() + 1400;
    game.assemblyHymnAt = performance.now() + 10000;
    game.assemblyUsedThoughts = new Set();
    announce('🎤 Assembly begins: all students to seats, teachers behind the Headmaster.', { feedType: 'world' });
    if (headmaster) {
      say(headmaster, '📢 Good morning! Sit smartly for today\'s thought and hymn.', { force: true, durationMs: 3600 });
    }
    // Keep the player aligned with assembly expectations too.
    const playerSeat = getSeatPosition('Assembly Hall', player.seatIndex, player);
    if (playerSeat) {
      player.x = playerSeat.x;
      player.y = playerSeat.y;
      player.vx = 0;
      player.vy = 0;
      player.isSeated = true;
      player.seatedRoom = 'Assembly Hall';
    }
  }
  if (current.period === 'Home Time') {
    announce('🏠 Home time! Students may leave through the school gates.', { feedType: 'world' });
    announce('🎮 Want extra computer time? At the gates, press E to stay for one extra hour.', { force: true });
    game.choseToStayAfterSchool = false;
    game.stayingAfterSchoolUntil = 0;
  }
  if (current.period === 'End Day') {
    announce('🌙 End of day bell. Campus is closing.');
  }
  periodEl.textContent = `🔔 Period: ${current.period}`;
  roomTargetEl.textContent = `📍 Target: ${current.room}`;
  if (current.period === 'Home Time' && game.choseToStayAfterSchool && game.timeMinutes < game.stayingAfterSchoolUntil) {
    periodEl.textContent = `🔔 Period: Home Time (Free play until ${formatTime(game.stayingAfterSchoolUntil)})`;
    roomTargetEl.textContent = '📍 Target: Computer Room (optional)';
  }
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

  if (performance.now() < game.headmasterDetentionUntil) {
    // Headmaster lecture phase: Eric is held in office for a short punishment window.
    sendEntityToHeadmaster(player, 'lecture');
    return;
  }

  const manualMovement = game.keys.ArrowLeft || game.keys.a || game.keys.ArrowRight || game.keys.d || game.keys.ArrowUp || game.keys.w || game.keys.ArrowDown || game.keys.s;
  if (manualMovement || game.keys.z || game.keys.x || game.keys.e || game.keys.c || game.keys.q || game.keys.t || game.keys.v) {
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

  const current = schedule[game.periodIndex];
  if (isRegistrationPeriod(current) && entityRoom(player) === current.room && !player.isSeated) {
    const blocker = ericSeatOccupant(current.room);
    const ericSeat = getSeatPosition(current.room, player.seatIndex);
    if (blocker && ericSeat && distance(player, ericSeat) < 1.35) {
      const waitSpot = ericSeatWaitingSpot(current.room);
      player.x = waitSpot.x;
      player.y = waitSpot.y;
      player.vx = 0;
      player.vy = 0;
      if (!game.ericSeatDecisionPrompted) {
        game.ericSeatDecisionPrompted = true;
        announce('🪑 Eric pauses beside his desk — choose to reclaim the chair or sit elsewhere.');
      }
    }
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

  if (game.keys.t) {
    const partner = nearestTradePartner(player, 2.4);
    if (!partner) {
      announce('🤝 No one close enough to trade with. Move closer and try T.');
    } else if (!player.inventory?.length) {
      announce('🎒 Eric has nothing left to trade.');
    } else {
      const traded = tryTrade(player, partner, { isPlayerInitiated: true });
      if (!traded) announce(`🤝 ${partner.name} declined the trade for now.`);
    }
    game.keys.t = false;
  }
}

function meleeAttack(attacker) {
  attacker.punchUntil = performance.now() + 220;
  const strikeRange = attacker.profile.cane ? 1.95 : 1.45;
  for (const target of game.entities) {
    if (target === attacker || target.knockedUntil > performance.now()) continue;
    if (distance(attacker, target) < strikeRange) {
      const isSeatPunch = attacker === player
        && target.role !== 'teacher'
        && target.role !== 'janitor'
        && target.isSeated
        && target.seatedRoom
        && isSupervisedPeriod(schedule[game.periodIndex]);

      if (isSeatPunch) {
        const now = performance.now();
        const seatRoom = target.seatedRoom;
        const seatPos = getSeatPosition(seatRoom, target.seatIndex) || { x: target.x, y: target.y };
        const floorSit = { x: seatPos.x + (attacker.facing >= 0 ? 0.95 : -0.95), y: seatPos.y + 0.38 };
        target.x = floorSit.x;
        target.y = floorSit.y;
        target.isSeated = true;
        target.displacedFromSeatUntil = now + 3000;
        target.displacedSeatRoom = seatRoom;
        target.displacedSeatPos = seatPos;
        target.target = floorSit;
        target.mood = 'angry';
        target.emotion = Math.max(0, target.emotion - 10);
        think(target, '😤 Oi! That was my chair!', 2400);
        announce(`🪑💥 Eric punched ${target.name} off their chair!`, { source: attacker, range: 8 });
        logSchoolHistory(`Eric punched ${target.name} off a chair in ${entityRoom(attacker)}.`, attacker);

        const teacherWitness = findWitnessingTeacher(attacker, 7.4);
        if (teacherWitness) {
          announce(`🧑‍🏫 ${teacherWitness.name}: "Both of you — Headmaster. Now!"`, { source: teacherWitness, range: 9 });
          sendPlayerToHeadmaster('chair-fighting in class', 30);
          sendEntityToHeadmaster(target, 'chair-fighting');
          const bondDelta = relationshipDeltaForEricInteraction(target, 'punch');
          adjustEricRelationship(target, bondDelta + (target.traits?.masochism > 68 ? 6 : -4), 'chair-brawl-headmaster');
          return;
        }

        if (game.rng() < 0.1) {
          const classTeacher = assignedTeacherEntityForPeriod();
          if (classTeacher && entityRoom(classTeacher) === entityRoom(attacker)) {
            say(target, '📣 Sir! Eric just decked me off my chair!', { durationMs: 2800 });
            classTeacher.writingUntil = 0;
            announce(`🧑‍🏫 ${classTeacher.name} spun around and sent Eric to the Headmaster Office.`, { source: classTeacher, range: 9 });
            sendPlayerToHeadmaster('chair assault reported by pupil', 25);
            return;
          }
        }

        const responseAggressive = (target.traits?.aggression || 0) >= 60 || (target.traits?.strength || 0) >= 62;
        target.shouldReclaimSeat = true;
        target.retaliateForSeatLoss = responseAggressive;
        const delta = relationshipDeltaForEricInteraction(target, 'punch');
        adjustEricRelationship(target, delta + (target.traits?.masochism > 70 ? 4 : 0), 'chair-punched');
        return;
      }

      target.hp -= attacker.profile.cane ? 55 : 45;
      target.mood = 'angry';
      target.emotion = Math.max(0, target.emotion - 12);
      think(target, "Ouch... I'm furious.");
      attacker.pride = Math.min(100, attacker.pride + 6);
      if (attacker.profile.cane) {
        announce(`🪵 ${attacker.name} thwacked ${target.name} with a walking stick`);
      } else {
        announce(`👊 ${attacker.name} punched ${target.name}`);
      }
      if (attacker === player || target === player) {
        lowerHygiene(attacker === player ? 6 : 4, 'fighting');
      }
      attacker.hygiene = Math.max(0, attacker.hygiene - 1.8);
      target.hygiene = Math.max(0, target.hygiene - 3.2);
      if (target.hp <= 0) knockout(target, attacker);
      if (attacker === player) {
        const delta = relationshipDeltaForEricInteraction(target, 'punch');
        adjustEricRelationship(target, delta, 'punched');
      }
      if (target === player && attacker.role !== 'teacher' && attacker.role !== 'janitor') {
        const teacherWitness = findWitnessingTeacher(attacker, 7.2);
        if (teacherWitness) {
          announce(`🧑‍🏫 ${teacherWitness.name} caught the fight and marched both pupils to the Headmaster Office.`);
          sendPlayerToHeadmaster('fighting in class', 20);
          sendEntityToHeadmaster(attacker, 'fighting in class');
        }
      }
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
    createdAt: performance.now(),
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

function nurseEntity() {
  return game.entities.find((entity) => entity.role === 'nurse') || null;
}

function reportMedicalEmergency(patient) {
  if (!patient) return;
  const nurse = nurseEntity();
  if (!nurse) return;

  game.medicalEmergency = {
    patientName: patient.name,
    requestedAt: performance.now(),
    room: entityRoom(patient),
  };

  if (!nurse.arrivedForDay) {
    nurse.arrivedForDay = true;
    nurse.arrivalJoinMins = 0;
    const bay = roomCenter('Medical Bay');
    nurse.x = bay.x;
    nurse.y = bay.y;
    nurse.target = bay;
    announce('🩺 Nurse Nia has arrived at the Medical Bay and is responding to an emergency.', { force: true });
  }
}

function updateMedicalSystem() {
  const now = performance.now();
  const nurse = nurseEntity();
  if (!nurse) return;

  const severePatients = game.entities
    .filter((entity) => entity.role !== 'teacher' && entity.role !== 'janitor' && entity.role !== 'nurse')
    .filter((entity) => entity.knockoutCount >= 3 && now <= entity.needsNurseUntil)
    .sort((a, b) => b.knockoutCount - a.knockoutCount);

  const patient = severePatients[0] || null;
  if (patient) {
    if (!game.medicalEmergency || game.medicalEmergency.patientName !== patient.name) {
      reportMedicalEmergency(patient);
    }
  } else if (game.medicalEmergency) {
    game.medicalEmergency = null;
    if (nurse.arrivedForDay) {
      nurse.target = roomCenter('Medical Bay');
      announce('✅ Nurse Nia: "Emergency treated. Returning to Medical Bay."');
    }
  }

  if (!patient || !nurse.arrivedForDay) return;
  if (distance(nurse, patient) > 1.5) return;

  patient.hp = 100;
  patient.knockoutCount = Math.max(0, patient.knockoutCount - 2);
  patient.needsNurseUntil = 0;
  patient.emotion = Math.min(100, patient.emotion + 12);
  announce(`🩹 Nurse Nia treated ${patient.name} in ${entityRoom(patient)}.`, { force: true });
  game.medicalEmergency = null;
  nurse.target = roomCenter('Medical Bay');
}

function knockout(entity, by) {
  const now = performance.now();
  entity.hp = 100;
  entity.knockedUntil = now + 6200;
  entity.fallStartedAt = now;
  entity.knockoutCount = (entity.knockoutCount || 0) + 1;
  entity.lastKnockedAt = now;
  if (entity.knockoutCount >= 3) {
    // Severe repeated injuries summon the nurse to the new Medical Bay.
    entity.needsNurseUntil = now + 45000;
    reportMedicalEmergency(entity);
  }
  entity.punchUntil = 0;
  entity.mood = 'dazed';
  entity.emotion = Math.max(0, entity.emotion - 16);
  by.pride = Math.min(100, (by.pride || 0) + 9);
  think(entity, 'Everything is spinning...');
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


function studentsCommittedToRoom(roomName, ignoreEntity = null) {
  return game.entities.filter((entity) => (
    entity !== ignoreEntity
    && entity.role !== 'teacher'
    && entity.role !== 'janitor'
    && entity.role !== 'nurse'
    && entity.knockedUntil < performance.now()
    && (
      entity.seatedRoom === roomName
      || entity.lessonRoom === roomName
      || roomAtPosition(entity.target || entity)?.name === roomName
      || roomAtPosition(entity)?.name === roomName
    )
  )).length;
}

function nearestTradePartner(entity, range = 2.3) {
  let best = null;
  let bestDist = Infinity;
  for (const candidate of game.entities) {
    if (candidate === entity || candidate.knockedUntil > performance.now()) continue;
    if (candidate.role === 'janitor') continue;
    const d = distance(entity, candidate);
    if (d <= range && d < bestDist && candidate.inventory?.length) {
      best = candidate;
      bestDist = d;
    }
  }
  return best;
}
function roomHasOpenSeat(roomName, student) {
  const layout = getRoomSeatLayout(roomName);
  if (!layout || !layout.seats.length) return false;
  return studentsCommittedToRoom(roomName, student) < layout.seats.length;
}

function roomHasSpareSeat(roomName, student) {
  const layout = getRoomSeatLayout(roomName);
  if (!layout || !layout.seats.length) return false;
  const reserved = Math.max(1, LESSON_SPARE_SEATS_PER_ROOM);
  const effectiveCapacity = Math.max(0, layout.seats.length - reserved);
  return studentsCommittedToRoom(roomName, student) < effectiveCapacity;
}

function isLessonEligibleClassroom(roomName) {
  const room = roomByName(roomName);
  if (!room || room.type !== 'classroom') return false;
  if (roomName === 'Staff Room' || roomName === 'Headmaster Office') return false;
  const layout = getRoomSeatLayout(roomName);
  return Boolean(layout && layout.seats.length >= 8);
}

function lessonClassroomCandidates(currentPeriod) {
  // Keep lesson routing constrained to real classrooms so pupils never drift
  // into halls (like the Gym) when they should be in supervised lessons.
  const fallbackClassrooms = rooms
    .filter((room) => isLessonEligibleClassroom(room.name))
    .map((room) => room.name);

  const activeTeacherRooms = game.entities
    .filter((entity) => entity.role === 'teacher' && entity.knockedUntil < performance.now())
    .map((entity) => {
      const currentTeacherRoom = entityRoom(entity);
      const safeTeacherRoom = roomByName(currentTeacherRoom)?.type === 'classroom'
        ? currentTeacherRoom
        : teacherHomeRoom(entity.name);
      return roomByName(safeTeacherRoom)?.type === 'classroom' ? safeTeacherRoom : null;
    })
    .filter(Boolean);

  const candidateSet = new Set([currentPeriod.room, ...activeTeacherRooms]);
  const candidates = [...candidateSet]
    .filter((roomName) => isLessonEligibleClassroom(roomName))
    .sort((a, b) => a.localeCompare(b));

  return candidates.length ? candidates : fallbackClassrooms;
}

function assignFixedClassRosters() {
  // Build deterministic class/tutor rosters so students meet the same classmates each day.
  const students = game.entities.filter((entity) => isStudentCharacter(entity));
  const registrationRosters = {};
  TUTOR_ROOMS.forEach((room) => { registrationRosters[room] = []; });

  for (const student of students) {
    if (student === player) {
      student.tutorRoom = 'Science Lab';
    } else {
      const idx = styleSeedFromName(`${student.name}:tutor`) % TUTOR_ROOMS.length;
      student.tutorRoom = TUTOR_ROOMS[idx];
    }
    registrationRosters[student.tutorRoom] = registrationRosters[student.tutorRoom] || [];
    registrationRosters[student.tutorRoom].push(student.name);
    student.fixedLessonRooms = student.fixedLessonRooms || {};
  }

  const fixedBySubject = {};
  const lessonSubjects = [...new Set(schedule
    .filter((period) => period.mode === 'lesson' && !isRegistrationPeriod(period) && !isAssemblyPeriod(period))
    .map((period) => period.room))];

  for (const subjectRoom of lessonSubjects) {
    const pseudoPeriod = { room: subjectRoom };
    const candidates = lessonClassroomCandidates(pseudoPeriod).slice(0, 6);
    const rosterMap = {};
    candidates.forEach((room) => { rosterMap[room] = []; });

    const ordered = [...students].sort((a, b) => styleSeedFromName(`${a.name}:${subjectRoom}`) - styleSeedFromName(`${b.name}:${subjectRoom}`));
    for (const student of ordered) {
      let bestRoom = candidates[0] || subjectRoom;
      let bestScore = Infinity;
      for (const roomName of candidates) {
        const layout = getRoomSeatLayout(roomName);
        const capacity = Math.max(4, (layout?.seats?.length || 8) - LESSON_SPARE_SEATS_PER_ROOM);
        const occupancy = rosterMap[roomName]?.length || 0;
        // Prefer rooms with spare seats and lower occupancy, with stable deterministic tie-breaks.
        const overflowPenalty = occupancy >= capacity ? 1000 : 0;
        const tieBreaker = (styleSeedFromName(`${student.name}:${roomName}`) % 17) / 100;
        const score = (occupancy / capacity) + overflowPenalty + tieBreaker;
        if (score < bestScore) {
          bestScore = score;
          bestRoom = roomName;
        }
      }
      rosterMap[bestRoom] = rosterMap[bestRoom] || [];
      rosterMap[bestRoom].push(student.name);
      student.fixedLessonRooms[subjectRoom] = bestRoom;
    }

    fixedBySubject[subjectRoom] = rosterMap;
  }

  game.fixedClassRosters = {
    Registration: registrationRosters,
    ...fixedBySubject,
  };
}

function chooseLessonRoomForStudent(student, currentPeriod) {
  if (!student) return currentPeriod.room;
  if (isRegistrationPeriod(currentPeriod)) {
    return student.tutorRoom || currentPeriod.room;
  }
  if (isAssemblyPeriod(currentPeriod)) return 'Assembly Hall';
  if (student.fixedLessonRooms?.[currentPeriod.room]) {
    return student.fixedLessonRooms[currentPeriod.room];
  }
  return currentPeriod.room;
}

function initTutorialRollCallState() {
  const rooms = game.fixedClassRosters?.Registration || {};
  const state = {};
  for (const [roomName, roster] of Object.entries(rooms)) {
    if (!roster.length) continue;
    state[roomName] = { index: 0, waitingForReply: false, nextAt: 0 };
  }
  game.tutorialRollCall = state;
}

function updateTutorialRollCall(now = performance.now()) {
  const rooms = game.fixedClassRosters?.Registration || {};
  if (!Object.keys(rooms).length) return;

  let completedRooms = 0;
  for (const [roomName, roster] of Object.entries(rooms)) {
    if (!roster.length) {
      completedRooms += 1;
      continue;
    }
    const roll = game.tutorialRollCall[roomName] || { index: 0, waitingForReply: false, nextAt: 0 };
    game.tutorialRollCall[roomName] = roll;
    if (roll.index >= roster.length) {
      completedRooms += 1;
      continue;
    }
    if (now < (roll.nextAt || 0)) continue;

    const teacherName = assignedTeacherForRoom(roomName);
    const teacher = game.entities.find((entity) => entity.role === 'teacher' && entity.name === teacherName && entityRoom(entity) === roomName);
    const studentName = roster[roll.index];
    const student = game.entities.find((entity) => entity.name === studentName && entityRoom(entity) === roomName);
    if (!teacher || !student) continue;

    if (!roll.waitingForReply) {
      say(teacher, `${student.name}?`, { durationMs: 2300 });
      announce(`📘 ${teacher.name} calls register in ${roomName}: "${student.name}?"`, { source: teacher, range: 10, force: true });
      roll.waitingForReply = true;
      roll.nextAt = now + 900 + (game.rng() * 450);
    } else {
      const line = CLASS_RESPONSE_LINES[Math.floor(game.rng() * CLASS_RESPONSE_LINES.length)];
      say(student, line, { durationMs: 2100 });
      roll.waitingForReply = false;
      roll.index += 1;
      roll.nextAt = now + 600 + (game.rng() * 400);
    }
  }

  if (!game.registrationTaken && completedRooms === Object.keys(rooms).length && completedRooms > 0) {
    game.registrationTaken = true;
    announce('📘 Tutorial registration complete: every tutor has called the full class list.', { force: true });
  }
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
    const nearStepA = distance(player, fromStep) < STAIR_INTERACT_RADIUS;
    const nearStepB = distance(player, toStep) < STAIR_INTERACT_RADIUS;
    return nearStepA || nearStepB;
  });
  if (nearbyStair) {
    const fromPoint = stairPointForFloor(nearbyStair, nearbyStair.fromFloor);
    const toPoint = stairPointForFloor(nearbyStair, nearbyStair.toFloor);
    const standingOnFrom = currentFloor === nearbyStair.fromFloor && distance(player, fromPoint) < STAIR_INTERACT_RADIUS;
    const destination = standingOnFrom ? toPoint : fromPoint;
    const destinationFloor = standingOnFrom ? nearbyStair.toFloor : nearbyStair.fromFloor;
    const movingUp = floorOrder[destinationFloor] > floorOrder[currentFloor];
    player.x = destination.x;
    player.y = destination.y + (movingUp ? 0.4 : -0.4);
    announce(`🪜 Used ${nearbyStair.label} to ${movingUp ? 'go up' : 'go down'} a floor.`);
    playSfx('stair');
    updateFloorStatus();
    return;
  }

  // Use explicit room doors: interact toggles between corridor and interior.
  const nearbyDoor = nearestDoor(player);
  if (nearbyDoor) {
    const entering = entityRoom(player) !== nearbyDoor.room;
    if (useDoor(player, nearbyDoor)) {
      announce(`${nearbyDoor.icon} Eric ${entering ? 'entered' : 'left'} ${nearbyDoor.room}.`);
      playSfx('door');
      updateFloorStatus();
      return;
    }
  }

  // At home-time gates, Eric can choose an optional extra hour for computer gaming.
  const currentPeriod = schedule[game.periodIndex];
  const nearSchoolGate = player.x >= (schoolExit.x - 3.2) && player.y >= schoolExit.yMin && player.y <= schoolExit.yMax;
  if (nearSchoolGate && currentPeriod.period === 'Home Time' && !game.choseToStayAfterSchool) {
    game.choseToStayAfterSchool = true;
    game.stayingAfterSchoolUntil = game.timeMinutes + 60;
    announce(`🕹️ Eric chose to stay after school until ${formatTime(game.stayingAfterSchoolUntil)} for computer time.`, { force: true });
    return;
  }

  // Use nearby bins to dispose of packaging.
  const nearbyBin = trashCans.find((bin) => distance(player, bin) < 2.1);
  if (nearbyBin && game.playerCarryingTrash) {
    game.playerCarryingTrash = false;
    playSfx('interact');
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
    playSfx('interact');
    announce(`🚰 Eric drinks from ${nearbyFountain.label}. Refreshed and ready.`);
    return;
  }

  // Gym showers reset hygiene to max and can improve charisma with students.
  const nearbyShower = showers.find((shower) => distance(player, shower) < 1.9);
  if (nearbyShower && entityRoom(player) === 'Gym') {
    const hadLowHygiene = game.hygiene < 40;
    game.hygiene = 100;
    game.charisma = Math.min(100, game.charisma + 10);
    updateHygieneHud();
    updateCharismaHud();
    playSfx('interact');
    announce(`🚿 Eric used ${nearbyShower.label}. Hygiene maxed and charisma boosted.`);

    // Students that previously noticed Eric smelling now react to the fresh comeback.
    const nearbyStudents = game.entities.filter((entity) => (
      entity.role !== 'player'
      && entity.role !== 'teacher'
      && game.smelledStudents[entity.name]
      && entity.knockedUntil < performance.now()
      && distance(entity, player) < 6.4
    ));
    if (hadLowHygiene && nearbyStudents.length) {
      const clapbacks = [
        'glad you took a shower, stinker',
        'Welcome back from the bog of stench!',
        'fresh at last — took you long enough',
      ];
      for (const student of nearbyStudents.slice(0, 3)) {
        const line = clapbacks[Math.floor(game.rng() * clapbacks.length)];
        announce(`😅 ${student.name}: "${line}"`, { source: student, range: 8, force: true });
        adjustEricRelationship(student, 4 + (game.charisma * 0.02), 'clean comeback');
        student.ericReputation = Math.min(100, (student.ericReputation || 0) + 4);
        game.smelledStudents[student.name] = false;
      }
    }
    return;
  }

  // Urinals in toilets are explicit interact points and use the action key.
  const nearbyUrinal = urinals.find((urinal) => distance(player, urinal) < 1.7);
  if (nearbyUrinal && entityRoom(player) === 'Toilets') {
    if (game.toiletsBlocked) {
      announce('🚫 Urinals are unusable while toilets are flooded.', { force: true });
      return;
    }
    const previousBladder = game.bladder;
    game.bladder = Math.max(0, game.bladder - 75);
    game.dailyToiletVisits += 1;
    game.toiletDirt = Math.min(TOILET_MAX_DIRT, game.toiletDirt + TOILET_DIRT_PER_USE * 0.8);
    game.warnedNeedToilet = game.bladder >= 75;
    updateBladderHud();
    playSfx('urinal');
    announce(`🚹 Eric used ${nearbyUrinal.label}. Bladder ${Math.round(previousBladder)}% → ${Math.round(game.bladder)}%.`);
    return;
  }

  // Computer terminals support lunchtime games if Eric has traded for one.
  const nearbyPc = computerStations.find((station) => distance(player, station) < 1.7);
  if (nearbyPc && entityRoom(player) === 'Computer Room') {
    const currentPeriod = schedule[game.periodIndex];
    const lunchOrAfterHours = currentPeriod.period === 'Lunch Break' || game.choseToStayAfterSchool;
    if (lunchOrAfterHours && hasVideoGameItem(player)) {
      game.playerComputerStationId = nearbyPc.id;
      game.playerComputerPlayUntil = performance.now() + 12000;
      nearbyPc.use = 'game';
      nearbyPc.userName = 'Eric';
      game.energy = Math.min(100, game.energy + 6);
      updateTodo();
      announce('🎮 Eric loaded a traded video game on the school computer.', { force: true });
      return;
    }

    const meta = computerUseMeta[nearbyPc.use] || computerUseMeta.word;
    const userText = nearbyPc.userName ? ` used by ${nearbyPc.userName}` : ' idle';
    announce(`🖥️ ${meta.icon} ${meta.label}${userText}.`, { force: true });
    if (currentPeriod.period !== 'Lunch Break' && !game.choseToStayAfterSchool && hasVideoGameItem(player)) {
      announce('💡 You have a video game item. Use computers at lunch or during after-school free-play.');
    }
    return;
  }

  // Read blackboard instructions.
  const board = blackboards.find((b) => distance(player, b) < 2.2);
  if (board && board.text) {
    playSfx('interact');
    announce(`📋 Board: "${board.text}"`);
  }


  // Pickup nearby timed collectables; these can later be traded for value.
  const nearbyCollectableIndex = game.collectables.findIndex((item) => distance(player, item) < 1.3);
  if (nearbyCollectableIndex >= 0) {
    const item = game.collectables.splice(nearbyCollectableIndex, 1)[0];
    player.inventory.push(item.name);
    player.money += Math.max(1, Math.round((item.value || 4) * 0.5));
    announce(`🧲 Eric found ${item.icon} ${item.name} and stashed it for trading.`);
    logSchoolHistory(`Eric found ${item.name} near ${entityRoom(player)}.`, player);
    return;
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
      playSfx('interact');
      announce(`🛡️ Found shield letter: ${shield.letter}`);
      updateMission();
      updateTodo();
      break;
    }
  }

  // Eric now answers class questions from the on-screen panel near the board.
  if (game.quizActive && !game.quizActive.resolved && entityRoom(player) === schedule[game.periodIndex].room) {
    showClassQuestionUi(game.quizActive);
    announce('📝 Question panel opened — choose A, B, C, or D.');
  }
}


function spawnCollectables(now = performance.now()) {
  if (now - game.lastCollectableSpawnAt < COLLECTABLE_SPAWN_INTERVAL_MS) return;
  if (game.collectables.length >= MAX_ACTIVE_COLLECTABLES) return;
  game.lastCollectableSpawnAt = now;

  const point = collectableSpawnPoints[Math.floor(game.rng() * collectableSpawnPoints.length)];
  if (!point) return;
  if (game.collectables.some((item) => distance(item, point) < 1.2)) return;
  const template = COLLECTABLE_CATALOG[Math.floor(game.rng() * COLLECTABLE_CATALOG.length)];
  if (!template) return;

  game.collectables.push({
    x: point.x + ((game.rng() - 0.5) * 0.5),
    y: point.y + ((game.rng() - 0.5) * 0.5),
    ...template,
    expiresAt: now + COLLECTABLE_LIFETIME_MS,
  });
}

function updateCollectables(now = performance.now()) {
  spawnCollectables(now);
  game.collectables = game.collectables.filter((item) => item.expiresAt > now);
}

function updateMission() {
  const letters = shields.filter((s) => s.found).map((s) => s.letter);
  game.safeCombo = letters.join('');
  const shieldProgress = `${letters.length}/${shields.length}`;
  const cardProgress = `${game.cardCollectionCount}/256`;
  missionEl.textContent = `🛡️ Shields ${shieldProgress} | 🃏 Card Collection ${cardProgress}`;

  if (letters.length === shields.length && !game.missionComplete) {
    game.missionComplete = true;
    announce(`🏆 You collected all shield letters: ${game.safeCombo}`);
  }
  if (game.cardCollectionCount >= 256) {
    announce('🏆 Full trading card collection completed: all 256 cards!');
  }
}

// -----------------------------------------------------------------------------
// AI systems
// -----------------------------------------------------------------------------
function teacherBoardSpot(periodRoom) {
  // Teachers now run lessons from their own desk/chair station.
  const teacherSeat = getTeacherSeatPosition(periodRoom);
  return { ...teacherSeat, room: periodRoom };
}

function isAssignedTeacherSeatedForPeriod(currentPeriod = schedule[game.periodIndex]) {
  if (!isSupervisedPeriod(currentPeriod)) return true;
  const assignedTeacherName = assignedTeacherForRoom(currentPeriod.room);
  const assignedSeat = getTeacherSeatPosition(currentPeriod.room);
  return game.entities.some((entity) => (
    entity.role === 'teacher'
    && (!assignedTeacherName || entity.name === assignedTeacherName)
    && entityRoom(entity) === currentPeriod.room
    && (
      (entity.isSeated && entity.seatedRoom === currentPeriod.room)
      // Fallback: treat teacher as seated when they are effectively parked at desk.
      || distance(entity, assignedSeat) < 0.72
    )
    && entity.knockedUntil < performance.now()
  ));
}

function assignedTeacherForRoom(roomName) {
  return roomTeacherMap[roomName] || null;
}

function teacherHomeRoom(teacherName) {
  return teacherHomeRoomMap[teacherName] || 'Staff Room';
}

function teachersInRoster() {
  return game.entities.filter((entity) => entity.role === 'teacher');
}

function assignDailyDutyTeacher() {
  const teachers = teachersInRoster();
  if (!teachers.length) return;
  const index = (Math.max(1, game.dayCount) - 1) % teachers.length;
  game.dutyTeacherName = teachers[index].name;
  game.dutyPatrolIndex = -1;
  game.lastDutyPatrolAt = 0;
}

function dinnerLadyEntity() {
  return game.entities.find((entity) => entity.role === 'dinnerLady') || null;
}

function isLunchtimePeriod(period = schedule[game.periodIndex]) {
  return period?.period === 'Lunch Break';
}

function dinnerLadyCanObserve(dinnerLady) {
  if (!dinnerLady || dinnerLady.knockedUntil > performance.now()) return false;
  if (!isLunchtimePeriod()) return false;
  return entityRoom(dinnerLady) === 'Dining Hall' && !isTeacherBackTurned(dinnerLady);
}


function lunchQueueOrder(students, layout) {
  return students
    .slice()
    .sort((a, b) => {
      const aQueued = a.lunchState === 'queue' || a.lunchState === 'beingServed' ? 0 : 1;
      const bQueued = b.lunchState === 'queue' || b.lunchState === 'beingServed' ? 0 : 1;
      if (aQueued !== bQueued) return aQueued - bQueued;
      const aDist = distance(a, layout.queueSlots[0]);
      const bDist = distance(b, layout.queueSlots[0]);
      if (Math.abs(aDist - bDist) > 0.01) return aDist - bDist;
      return a.seatIndex - b.seatIndex;
    });
}

function nearestFreeDiningSeat(layout, eater) {
  if (!layout) return null;
  const occupiedIndices = new Set();
  for (const candidate of game.entities) {
    if (!candidate || candidate === eater) continue;
    const idx = candidate.lunchSeatIndex;
    if (typeof idx === 'number' && idx >= 0 && idx < layout.seats.length) {
      occupiedIndices.add(idx);
    }
  }

  let best = null;
  let bestIndex = -1;
  let bestDist = Infinity;
  for (let i = 0; i < layout.seats.length; i += 1) {
    if (occupiedIndices.has(i)) continue;
    const seat = layout.seats[i];
    const d = distance(eater, seat);
    if (d < bestDist) {
      bestDist = d;
      best = seat;
      bestIndex = i;
    }
  }
  return best ? { seat: best, seatIndex: bestIndex } : null;
}

function calmNearbyStudents(observer, radius = 8.5, movementScale = 0.32) {
  for (const student of game.entities) {
    if (!isStudentCharacter(student) || student === player) continue;
    if (distance(observer, student) > radius) continue;
    student.mood = 'calm';
    student.vx *= movementScale;
    student.vy *= movementScale;
  }
}

function dragStudentOffFieldToHeadmaster(dinnerLady, student) {
  const removedFromHallX = 102.4;
  const removedFromHallY = 82.2;
  student.x = removedFromHallX;
  student.y = removedFromHallY;
  student.vx = 0;
  student.vy = 0;
  student.target = roomCenter('Headmaster Office');
  announce(`🚨 ${dinnerLady.name} removed ${student.name} from the dining hall to the Headmaster.`);
  sendEntityToHeadmaster(student, 'removed from dining hall by dinner lady');
  if (student === player) addLines(25, 'dragged to Headmaster by dinner lady');
}

function dutyTeacherBreakTarget(now = performance.now()) {
  // Duty teacher alternates between field and classrooms to keep break-time supervised.
  const patrolRooms = ['P.E. Field', 'Maths', 'English', 'Science Lab', 'Geography', 'Art Room'];
  if (!game.lastDutyPatrolAt || now - game.lastDutyPatrolAt > 18000) {
    game.dutyPatrolIndex = (game.dutyPatrolIndex + 1) % patrolRooms.length;
    game.lastDutyPatrolAt = now;
  }
  return roomCenter(patrolRooms[game.dutyPatrolIndex]);
}


function nearestComputerStation(entity) {
  let best = null;
  let bestDist = Infinity;
  for (const station of computerStations) {
    const d = distance(entity, station);
    if (d < bestDist) {
      bestDist = d;
      best = station;
    }
  }
  return best;
}

function syncComputerStations() {
  for (const station of computerStations) {
    station.userName = null;
    station.temptationBy = null;
    if (station.use === 'game' || station.use === 'pictures') station.use = 'word';
  }

  // If Eric chose lunch/free-time gaming, keep his station marked as in use.
  if (game.playerComputerPlayUntil > performance.now() && game.playerComputerStationId) {
    const playerStation = computerStations.find((station) => station.id === game.playerComputerStationId);
    if (playerStation) {
      playerStation.use = 'game';
      playerStation.userName = 'Eric';
    }
  }

  for (const entity of game.entities) {
    if (entity.role === 'teacher' || entity.role === 'janitor' || entity.role === 'nurse' || entity.role === 'dinnerLady') continue;
    if (entityRoom(entity) !== 'Computer Room') continue;
    const station = nearestComputerStation(entity);
    if (!station || distance(entity, station) > 2.2) continue;
    station.userName = entity.name;
    if (entity.computerTask) station.use = entity.computerTask;
    if (entity.temptedComputerAt > performance.now() - 1400) station.temptationBy = entity.name;
  }
}

function chooseTarget(entity, currentPeriod) {
  // Janitor idles in his room unless there is a cleanup callout.
  if (entity.role === 'janitor') {
    if (game.janitorTask) return { x: game.janitorTask.x, y: game.janitorTask.y };
    return roomCenter(JANITOR_IDLE_ROOM);
  }

  if (entity.role === 'nurse') {
    const emergencyName = game.medicalEmergency?.patientName;
    const patient = emergencyName
      ? game.entities.find((candidate) => candidate.name === emergencyName)
      : null;
    return patient ? { x: patient.x, y: patient.y } : roomCenter('Medical Bay');
  }

  if (entity.role === 'dinnerLady') {
    // Dinner ladies split roles: one serves at the food bar, one patrols tables.
    if (isLunchtimePeriod(currentPeriod)) {
      const layout = diningHallLayout();
      if (!layout) return roomCenter('Dining Hall');
      const allDinnerLadies = game.entities.filter((candidate) => candidate.role === 'dinnerLady');
      const servingLady = allDinnerLadies[0];
      return entity === servingLady ? layout.servingPoint : (layout.patrolRoute[0] || roomCenter('Dining Hall'));
    }
    return roomCenter('Kitchen');
  }

  // High bladder urgency overrides normal timetable targets.
  if (!game.toiletsBlocked && entity.bladder >= 80) {
    return roomCenter('Toilets');
  }

  // Teachers occasionally step out to the toilet and then return to class.
  if (!game.toiletsBlocked && entity.role === 'teacher' && entity.bladder >= 72) {
    return roomCenter('Toilets');
  }

  const p = entity.personality;
  const shouldAttend = game.rng() < p.diligence;

  if (isStartDayPeriod(currentPeriod)) {
    if (entity.role === 'teacher') {
      const teacherIndex = teachersInRoster().findIndex((teacher) => teacher.name === entity.name);
      return teacherGateLinePosition(Math.max(0, teacherIndex));
    }
    return gateQueuePosition(entity);
  }

  if (currentPeriod.mode === 'lesson') {
    if (isAssemblyPeriod(currentPeriod)) {
      if (entity.role === 'teacher' && entity.name === 'Mr Wacker') return assemblyHeadmasterSpot();
      if (entity.role === 'teacher') return assemblyTeacherLineSpot(Math.max(0, teachersInRoster().findIndex((teacher) => teacher.name === entity.name) - 1), teachersInRoster().length);
      return getSeatPosition('Assembly Hall', entity.seatIndex, entity) || roomCenter('Assembly Hall');
    }
    if (entity.role === 'teacher') return teacherBoardSpot(currentPeriod.room);
    // Students always aim for seats during lessons so classes look orderly.
    return getSeatPosition(currentPeriod.room, entity.seatIndex, entity) || roomCenter(currentPeriod.room);
  }

  if (currentPeriod.mode === 'home') {
    return roomCenter('School Gates');
  }

  // Lunch hall routine: all students head to the dining hall to eat during lunch service.
  if (isLunchtimePeriod(currentPeriod) && isStudentCharacter(entity)) {
    const layout = diningHallLayout();
    return layout?.plateStand || roomCenter('Dining Hall');
  }

  if (entity.role === 'teacher') {
    if (currentPeriod.mode === 'break') {
      return entity.name === game.dutyTeacherName
        ? dutyTeacherBreakTarget()
        : roomCenter('Staff Room');
    }
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
  if (!isSupervisedPeriod(currentPeriod)) return true;
  if (isRegistrationPeriod(currentPeriod)) {
    // Registration uses multiple tutor rooms, so any active tutor roll-call counts as staffed.
    return game.entities.some((entity) => entity.role === 'teacher' && entity.knockedUntil < performance.now());
  }
  // Count attendance by room presence so lessons don't stall when teachers pace near the board.
  return game.entities.some((entity) => (
    entity.role === 'teacher'
    && entityRoom(entity) === currentPeriod.room
    && entity.knockedUntil < performance.now()
  ));
}

function lessonComplianceForPeriod(currentPeriod = schedule[game.periodIndex]) {
  const activeStudents = game.entities.filter((entity) => (
    entity.role !== 'teacher'
    && entity.role !== 'janitor'
    && entity.role !== 'nurse'
    && hasArrivedForCurrentPeriod(entity, currentPeriod)
    && entity.knockedUntil < performance.now()
  ));

  if (!activeStudents.length) {
    return { attendancePercent: 100, seatedPercent: 100, presentCount: 0, seatedCount: 0, total: 0 };
  }

  const presentCount = activeStudents.filter((entity) => entityRoom(entity) === (entity.lessonRoom || currentPeriod.room)).length;
  const seatedCount = activeStudents.filter((entity) => (
    entityRoom(entity) === (entity.lessonRoom || currentPeriod.room)
    && entity.isSeated
    && entity.seatedRoom === (entity.lessonRoom || currentPeriod.room)
  )).length;

  return {
    attendancePercent: (presentCount / activeStudents.length) * 100,
    seatedPercent: (seatedCount / activeStudents.length) * 100,
    presentCount,
    seatedCount,
    total: activeStudents.length,
  };
}

function updateAttendanceHud(currentPeriod = schedule[game.periodIndex]) {
  if (!attendanceEl) return;
  const inLesson = isSupervisedPeriod(currentPeriod);
  if (!inLesson) {
    attendanceEl.textContent = `🎯 Attendance: n/a | Seated: n/a`;
    attendanceEl.title = 'Attendance tracking activates during supervised lesson periods.';
    return;
  }

  const metrics = lessonComplianceForPeriod(currentPeriod);
  const attendanceRounded = Math.round(metrics.attendancePercent);
  const seatedRounded = Math.round(metrics.seatedPercent);
  const statusIcon = attendanceRounded >= TARGET_ATTENDANCE_PERCENT ? '✅' : '⚠️';
  attendanceEl.textContent = `${statusIcon} Attendance: ${attendanceRounded}% | Seated: ${seatedRounded}%`;
  attendanceEl.title = `Present ${metrics.presentCount}/${metrics.total}, seated ${metrics.seatedCount}/${metrics.total}. Target attendance: ${TARGET_ATTENDANCE_PERCENT}%+.`;
}

function schoolDayProgress() {
  // Convert the current timetable position into a stable 0..1 value for day-based systems.
  const elapsedMinsBeforePeriod = schedule
    .slice(0, game.periodIndex)
    .reduce((sum, period) => sum + period.mins, 0);
  const elapsedMins = Math.min(TOTAL_DAY_GAME_MINUTES, elapsedMinsBeforePeriod + game.periodElapsed);
  return Math.max(0, Math.min(1, elapsedMins / TOTAL_DAY_GAME_MINUTES));
}

function updateNpcVitals(entity, dt, isRunning) {
  // `dt` is provided in milliseconds, so convert once to keep stamina math in
  // real-world seconds. Without this conversion NPCs lose almost all energy in
  // moments and appear to crawl for the rest of the day.
  const dtSeconds = dt / 1000;
  const deltaMins = (dt / 1000) * game.timeScale;

  // Mr Mop and dinner ladies are service NPCs and should always stay responsive.
  if (entity.role === 'janitor' || entity.role === 'dinnerLady') {
    entity.energy = 100;
  }
  // NPC bladder rises over time, slightly quicker while running.
  entity.bladder = Math.min(100, entity.bladder + deltaMins * (0.34 + (isRunning ? 0.2 : 0)));

  if (!game.toiletsBlocked && entityRoom(entity) === 'Toilets' && entity.bladder >= 15) {
    entity.bladder = 0;
    game.toiletDirt = Math.min(TOILET_MAX_DIRT, game.toiletDirt + TOILET_DIRT_PER_USE * 0.55);
  }

  if (entity.bladder >= 100) {
    entity.bladder = 24;
    entity.hygiene = 0;
    if (entity.role !== 'teacher' && entity.role !== 'janitor') {
      entity.target = roomCenter('Headmaster Office');
      entity.mood = 'shamed';
    }
    if (distance(entity, player) < 8.5) {
      announce(`😬 ${entity.name} had an accident, got shunned, and was sent to the office.`, { force: true });
    }
  }

  // School-day tuned stamina: normal walking causes light drain so pupils tire by lunch.
  const baseDrainPerSecond = NPC_BASE_DRAIN_PER_SECOND;
  const runningExtraDrainPerSecond = NPC_RUNNING_EXTRA_DRAIN_PER_SECOND;
  const recoverPerSecond = NPC_LUNCH_RECOVER_PER_SECOND;
  const period = schedule[game.periodIndex];
  const isLunch = period.period === 'Lunch Break';
  const inFoodZone = entityRoom(entity) === 'P.E. Field' || entityRoom(entity) === 'Reception';
  const canRecoverFromMeal = period.mode === 'break' && isLunch && inFoodZone;
  const studentSeatedRecovery = entity.role !== 'teacher' && entity.role !== 'janitor' && entity.role !== 'nurse' && entity.role !== 'dinnerLady'
    && entity.isSeated
    && !isLunch;

  if (canRecoverFromMeal) {
    entity.energy = entity.role === "janitor" || entity.role === "dinnerLady"
      ? 100
      : Math.min(100, entity.energy + dtSeconds * recoverPerSecond);
    return;
  }

  const drainRate = baseDrainPerSecond + (isRunning ? runningExtraDrainPerSecond : 0);
  // Apply seated recovery against passive drain so resting pupils gain energy gradually.
  const netDrainPerSecond = studentSeatedRecovery
    ? (drainRate - NPC_SEATED_RECOVER_PER_SECOND)
    : drainRate;
  entity.energy = entity.role === "janitor" || entity.role === "dinnerLady"
    ? 100
    : Math.max(16, Math.min(100, entity.energy - (dtSeconds * netDrainPerSecond)));

  // Keep end-of-day fatigue believable: students should usually finish around ~30%.
  // This softly nudges energy toward a line from 100 at the start of day to 30 at home time.
  const dayProgress = schoolDayProgress();
  const baselineEnergy = 100 - ((100 - NPC_END_OF_DAY_ENERGY_TARGET) * dayProgress);
  if (entity.role === "janitor" || entity.role === "dinnerLady") {
    entity.energy = 100;
  } else {
    entity.energy = Math.max(16, Math.min(entity.energy, baselineEnergy));
  }

  const emotionDrift = entity.mood === 'furious' || entity.mood === 'angry' ? -0.9 : 0.35;
  entity.emotion = Math.max(0, Math.min(100, entity.emotion + (emotionDrift * dtSeconds)));
}


function queueJanitorTask(task) {
  // Single active janitor task keeps routing deterministic and cheap.
  if (game.janitorTask) return;
  game.janitorTask = {
    type: task.type,
    x: task.x,
    y: task.y,
    createdAt: performance.now(),
    room: task.room || roomAtPosition(task)?.name || 'Corridor',
  };
  if (task.type === 'sick') {
    announce('🤢 A student was sick on the floor. Mr Mop is hurrying over to clean it.');
  }
  if (task.type === 'flood') {
    announce('🌊 Toilet flood alert: bathrooms are closed until Mr Mop clears the blockage.', { force: true });
  }
}

function scheduleWeeklySickEvent() {
  if (game.dayCount !== game.weeklySickScheduledDay) return;
  const student = game.entities.find((entity) => entity.role !== 'teacher' && entity.role !== 'janitor' && entity !== player);
  if (!student) return;
  if (game.litter.some((item) => item.kind === 'sick')) return;

  const mess = {
    x: student.x,
    y: student.y,
    offender: student,
    warned: true,
    kind: 'sick',
    droppedAt: performance.now(),
  };
  game.litter.push(mess);
  queueJanitorTask({ type: 'sick', x: mess.x, y: mess.y, room: entityRoom(student) });
  game.weeklySickScheduledDay += WEEKLY_SICK_DAY_INTERVAL;
}

function updateJanitorSystems(dt) {
  const now = performance.now();

  // Flood windows auto-clear as a safety net if pathing delays the janitor.
  if (game.toiletsBlocked && game.toiletFloodUntil && now >= game.toiletFloodUntil) {
    game.toiletsBlocked = false;
    game.toiletFloodUntil = 0;
    announce('✅ Toilets reopened after flood cleanup.');
  }

  // Any litter older than 20 seconds gets escalated to the janitor.
  const staleLitter = game.litter.find((item) => now - (item.droppedAt || now) >= LITTER_CLEANUP_DELAY_MS);
  if (staleLitter) {
    queueJanitorTask({ type: staleLitter.kind === 'sick' ? 'sick' : 'litter', x: staleLitter.x, y: staleLitter.y });
  }

  // Toilets grow dirtier with use and get cleaned by the janitor.
  if (game.toiletDirt >= 45) {
    const toilets = roomByName('Toilets');
    queueJanitorTask({ type: 'toilet', x: toilets.x + toilets.w / 2, y: toilets.y + toilets.h / 2, room: 'Toilets' });
  }

  const janitor = game.entities.find((entity) => entity.role === 'janitor');
  if (!janitor || !game.janitorTask) return;

  // If routeing stalls, let Mr Mop teleport to the task so litter never lingers forever.
  const taskAge = now - (game.janitorTask.createdAt || now);
  if (taskAge > 7000 && distance(janitor, game.janitorTask) > 8.5) {
    teleportEntityToTarget(janitor, game.janitorTask, 'janitor-task-teleport');
  }

  // Let him "brush" when close and resolve the current cleanup target.
  if (distance(janitor, game.janitorTask) < 1.5) {
    janitor.writingUntil = now + 520;
    if (game.janitorTask.type === 'toilet') {
      game.toiletDirt = Math.max(0, game.toiletDirt - 70);
      announce('🧼 Mr Mop scrubbed the toilets clean.');
    } else if (game.janitorTask.type === 'flood') {
      game.toiletsBlocked = false;
      game.toiletFloodUntil = 0;
      game.toiletDirt = Math.max(8, game.toiletDirt - 45);
      announce('🛠️ Mr Mop cleared the toilet blockage and reopened the bathrooms.', { force: true });
    } else {
      game.litter = game.litter.filter((item) => distance(item, game.janitorTask) > 1.8);
      announce(game.janitorTask.type === 'sick' ? '🧽 Mr Mop cleaned the sick mess.' : '🧹 Mr Mop brushed up old litter.');
    }
    game.janitorTask = null;
  }
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
  const supervised = isSupervisedPeriod(current);
  const teacherPresent = isTeacherPresentForPeriod(current);
  const assignedTeacherName = assignedTeacherForRoom(current.room);
  const now = performance.now();
  const headmaster = game.entities.find((entity) => entity.role === 'teacher' && entity.name === 'Mr Wacker');
  // Deliver any deferred LLM-only dialogue once responses arrive in cache.
  flushDeferredLlmDialogue(now);

  if (isAssemblyPeriod(current) && headmaster && now >= game.assemblyNextSpeechAt) {
    let thought = randomHeadmasterAssemblyThought();
    let safety = 0;
    while (game.assemblyUsedThoughts.has(thought) && safety < 8) {
      thought = randomHeadmasterAssemblyThought();
      safety += 1;
    }
    game.assemblyUsedThoughts.add(thought);
    say(headmaster, thought, { force: true, durationMs: 4200 });
    announce(`🧑‍🏫 Headmaster thought: ${thought}`, { force: true });
    game.assemblyNextSpeechAt = now + 8500;
  }

  if (isAssemblyPeriod(current) && headmaster && now >= game.assemblyHymnAt) {
    say(headmaster, '🎵 Hymn time! Voices up, hearts steady, no mumbling in row three!', { force: true, durationMs: 4200 });
    for (const singer of game.entities) {
      if (!isStudentCharacter(singer) && singer.role !== 'teacher') continue;
      if (entityRoom(singer) !== 'Assembly Hall') continue;
      if (game.rng() < 0.28) say(singer, '🎶 La-la-laaa...', { durationMs: 2400, force: true });
    }
    game.assemblyHymnAt = now + 18000;
  }

  if (supervised) {
    if (now > game.lessonQuietUntil) {
      // Noise ramps back in after a teacher warning, so class hush feels temporary.
      game.lessonNoiseLevel = Math.min(1, game.lessonNoiseLevel + dt * 0.00011);
    } else {
      game.lessonNoiseLevel = Math.max(0, game.lessonNoiseLevel - dt * 0.0018);
    }
  } else {
    game.lessonNoiseLevel = Math.min(1, game.lessonNoiseLevel + dt * 0.0005);
  }

  if (isRegistrationPeriod(current)) {
    updateTutorialRollCall(now);
  }

  maybeStartClassQuestion(current, now);
  updateClassQuestionSystem(now);
  // Emergent social simulation gives NPCs evolving bonds, rivalries, and group behaviour.
  updateEmergentSocialLife(now, current);

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

    const inLesson = isSupervisedPeriod(current);
    const dtSeconds = dt / 1000;
    const isStudent = entity.role !== 'teacher' && entity.role !== 'janitor' && entity.role !== 'nurse' && entity.role !== 'dinnerLady';
    const isOutside = ['P.E. Field', 'School Gates', 'Bike Sheds'].includes(entityRoom(entity));
    const lunchDutyLady = dinnerLadyEntity();
    const dinnerLadyWatchingField = dinnerLadyCanObserve(lunchDutyLady);


    if (isLunchtimePeriod(current) && isStudent) {
      const layout = diningHallLayout();
      if (layout) {
        // Lunch routine: collect plate, queue for serving, then sit at a long table to eat.
        if (entity.lunchState === 'idle') {
          entity.lunchState = 'toPlate';
          entity.target = layout.plateStand;
        }

        if (entity.lunchState === 'toPlate') {
          entity.target = layout.plateStand;
          if (distance(entity, layout.plateStand) < 1.05) {
            entity.hasLunchPlate = true;
            entity.lunchState = 'queue';
          }
        }

        const lunchStudents = game.entities.filter((candidate) => (
          candidate !== player
          && candidate.role !== 'teacher'
          && candidate.role !== 'janitor'
          && candidate.role !== 'nurse'
          && candidate.role !== 'dinnerLady'
          && candidate.arrivedForDay
          && entityRoom(candidate) === 'Dining Hall'
          && (candidate.lunchState === 'queue' || candidate.lunchState === 'beingServed' || candidate.lunchState === 'toPlate')
        ));
        const queueOrder = lunchQueueOrder(lunchStudents, layout);
        for (let i = 0; i < queueOrder.length; i += 1) {
          queueOrder[i].lunchQueueIndex = i;
          if (queueOrder[i].lunchState === 'queue') {
            queueOrder[i].target = layout.queueSlots[Math.min(i, layout.queueSlots.length - 1)];
          }
        }

        if (entity.lunchState === 'queue') {
          const frontSlot = layout.queueSlots[0];
          const atFront = entity.lunchQueueIndex === 0 && distance(entity, frontSlot) < 0.9;
          if (atFront) {
            entity.lunchState = 'beingServed';
            entity.lunchServedAt = now + layout.serviceDurationMs;
          }
        }

        if (entity.lunchState === 'beingServed') {
          entity.target = layout.queueSlots[0];
          if (now >= (entity.lunchServedAt || 0)) {
            entity.queuedForLunch = true;
            entity.lunchState = 'toSeat';
            const freeSeat = nearestFreeDiningSeat(layout, entity);
            if (freeSeat) {
              entity.lunchSeatIndex = freeSeat.seatIndex;
              entity.target = freeSeat.seat;
            }
          }
        }

        if (entity.lunchState === 'toSeat') {
          const seat = layout.seats[entity.lunchSeatIndex] || nearestFreeDiningSeat(layout, entity)?.seat;
          if (seat) {
            entity.target = seat;
            if (distance(entity, seat) < 0.75) {
              entity.x = seat.x;
              entity.y = seat.y;
              entity.isSeated = true;
              entity.seatedRoom = 'Dining Hall';
              entity.lunchState = 'eating';
              entity.lunchEatUntil = now + (6200 + (game.rng() * 3400));
            }
          } else {
            entity.target = roomCenter('Dining Hall');
          }
        }

        if (entity.lunchState === 'eating') {
          const seat = layout.seats[entity.lunchSeatIndex];
          if (seat) {
            entity.x = seat.x;
            entity.y = seat.y;
            entity.target = seat;
          }
          entity.isSeated = true;
          entity.seatedRoom = 'Dining Hall';
          if (now >= (entity.lunchEatUntil || 0)) {
            entity.lunchState = 'done';
            entity.hasLunchPlate = false;
            entity.target = roomCenter('P.E. Field');
          }
        }
      }
    }

    if (isStudent && entity.displacedFromSeatUntil && performance.now() < entity.displacedFromSeatUntil) {
      entity.target = entity.displacedSeatPos || { x: entity.x, y: entity.y };
      entity.vx = 0;
      entity.vy = 0;
      entity.isSeated = true;
      updateNpcVitals(entity, dt, false);
      continue;
    }

    if (isStudent && entity.displacedFromSeatUntil && performance.now() >= entity.displacedFromSeatUntil) {
      const roomName = entity.displacedSeatRoom || entity.lessonRoom || current.room;
      const seatPos = entity.displacedSeatPos || getSeatPosition(roomName, entity.seatIndex, entity);
      const playerTookSeat = seatPos && player.isSeated && player.seatedRoom === roomName && distance(player, seatPos) < 0.72;
      if (playerTookSeat) {
        if (entity.retaliateForSeatLoss) {
          say(entity, '😡 Move! That is my seat!', { durationMs: 2400 });
          if (distance(entity, player) < 1.7) meleeAttack(entity);
          else entity.target = { x: player.x, y: player.y };
        } else {
          entity.target = nearestFreeSeatInRoom(roomName, entity) || roomCenter(roomName);
          say(entity, '😟 Fine... I will sit somewhere else.', { durationMs: 2200 });
        }
      } else if (seatPos) {
        entity.target = seatPos;
      }
      entity.displacedFromSeatUntil = 0;
      entity.displacedSeatPos = null;
      entity.displacedSeatRoom = null;
      entity.shouldReclaimSeat = false;
      entity.retaliateForSeatLoss = false;
    }

    // Keep students in supervised, staffed classrooms instead of empty rooms.
    if (inLesson && isStudent) {
      if (isAssemblyPeriod(current)) {
        entity.lessonRoom = 'Assembly Hall';
      } else {
        entity.lessonRoom = chooseLessonRoomForStudent(entity, current);
      }
      // Registration keeps Eric's desk free most mornings; if not free, player can choose how to react.
      const reserveEricSeat = isRegistrationPeriod(current) && game.ericSeatReservedToday;
      const assignedSeat = getSeatPosition(entity.lessonRoom, entity.seatIndex, entity);
      const usesEricSeat = isEricAssignedSeat(entity.lessonRoom, entity.seatIndex);
      if (reserveEricSeat && usesEricSeat && entity !== player) {
        entity.target = nearestFreeSeatInRoom(entity.lessonRoom, entity) || roomCenter(entity.lessonRoom);
      } else {
        // Prefer deterministic seat assignments so pupils stop oscillating between nearby chairs.
        entity.target = assignedSeat
          || nearestFreeSeatInRoom(entity.lessonRoom, entity)
          || roomCenter(entity.lessonRoom);
      }
    } else if (inLesson && entity.role === 'teacher') {
      entity.lessonRoom = null;
      if (isAssemblyPeriod(current)) {
        if (entity.name === 'Mr Wacker') {
          entity.target = assemblyHeadmasterSpot();
        } else {
          const allTeachers = teachersInRoster();
          const lineOrder = allTeachers.filter((teacher) => teacher.name !== 'Mr Wacker');
          const lineIndex = Math.max(0, lineOrder.findIndex((teacher) => teacher.name === entity.name));
          entity.target = assemblyTeacherLineSpot(lineIndex, allTeachers.length);
        }
      } else {
        // Dedicated teacher handles the active lesson; others return to their own classrooms.
        const isAssignedTeacher = !assignedTeacherName || entity.name === assignedTeacherName;
        const destinationRoom = isAssignedTeacher ? current.room : teacherHomeRoom(entity.name);
        entity.target = teacherBoardSpot(destinationRoom);
      }
    } else if (entity.role === 'nurse' || entity.role === 'dinnerLady') {
      entity.lessonRoom = null;
      entity.target = chooseTarget(entity, current);
    } else if (current.mode === 'break' && entity.role === 'teacher') {
      // One rotating duty teacher patrols outside + classrooms; all others stay in staff room.
      entity.lessonRoom = null;
      entity.target = entity.name === game.dutyTeacherName
        ? dutyTeacherBreakTarget()
        : roomCenter('Staff Room');
    } else if (!entity.target || game.rng() < 0.01) {
      entity.lessonRoom = null;
      entity.target = chooseTarget(entity, current);
    }

    // General student misbehaviour: keep rare and mostly outside lessons.
    if (isStudent && !inLesson && supervised && game.rng() < 0.0016) {
      entity.mood = 'angry';
      entity.target = roomCenter(game.rng() < 0.5 ? 'P.E. Field' : 'Ground Corridor');
      announce(`😈 ${entity.name} started misbehaving in ${current.period}.`);
    }

    // In class students periodically attempt teacher prompts and can daydream.
    const iqFactor = (entity.traits?.intelligence || 50) / 100;
    const witFactor = (entity.traits?.wit || 50) / 100;
    if (inLesson && isStudent && entityRoom(entity) === current.room && now > game.lessonQuietUntil && game.rng() < (0.00072 + (game.lessonNoiseLevel * (0.0022 + (iqFactor * 0.0032))))) {
      if (game.rng() < (0.45 + (iqFactor * 0.28) + (witFactor * 0.12))) {
        ensureDialogueSetup(entity);
        const responseLine = contextualResponseFor(entity, assignedTeacherEntityForPeriod(current));
        const spokenAttempt = game.quizActive && !game.quizActive.resolved
          ? (entity.role === 'swot' && game.rng() < 0.75 ? game.quizActive.answer : randomFunnyWrongAnswer())
          : responseLine;
        say(entity, spokenAttempt);
        announce(`📚 ${entity.name} calls out: "${spokenAttempt}"`, { source: entity, range: 7.5 });
        if (game.quizActive && !game.quizActive.resolved && now > game.quizActive.playerWindowUntil && game.rng() < (entity.role === 'swot' ? 0.38 : 0.07)) {
          resolveClassQuestionAttempt(game.quizActive, entity, spokenAttempt, entity.role === 'swot' && normalizeAnswerText(spokenAttempt) === game.quizActive.answer);
        }
        entity.emotion = Math.min(100, entity.emotion + 1.2);
      } else {
        ensureDialogueSetup(entity);
        const daydreams = entity.dialogue.thoughts || ['☁️ Looking out the window...'];
        const daydream = pickFreshLine(entity, daydreams, 'thought');
        think(entity, daydream || daydreams[0], 3400);
      }
    }


    // Computer lesson behaviour: pupils can be tempted to skive, then get corrected by staff.
    if (inLesson && current.room === 'Computer Room' && isStudent && entityRoom(entity) === 'Computer Room') {
      if (!entity.computerTask || game.rng() < 0.01) {
        const productive = ['spreadsheet', 'word', 'database'];
        entity.computerTask = productive[Math.floor(game.rng() * productive.length)];
      }

      if (!entity.temptedComputerUse && game.rng() < 0.0018) {
        entity.temptedComputerUse = game.rng() < 0.52 ? 'game' : 'pictures';
        entity.temptedComputerAt = now;
        think(entity, entity.temptedComputerUse === 'game' ? '🎮 Maybe just one quick game...' : '🖼️ I could sneak a picture search...', 2400);
      }

      if (entity.temptedComputerUse && now - entity.temptedComputerAt > 1800) {
        entity.computerTask = entity.temptedComputerUse;
        entity.temptedComputerUse = null;
      }

      const teacherInRoom = game.entities.find((candidate) => candidate.role === 'teacher' && entityRoom(candidate) === 'Computer Room');
      const skiving = entity.computerTask === 'game' || entity.computerTask === 'pictures';
      if (teacherInRoom && skiving && distance(teacherInRoom, entity) < 8.2 && game.rng() < 0.08) {
        say(teacherInRoom, '🧑‍🏫 Back to work please — this is ICT, not arcade club.', { durationMs: 3000 });
        say(entity, '😬 Sorry, switching back now!', { durationMs: 2600 });
        entity.computerTask = game.rng() < 0.5 ? 'word' : 'spreadsheet';
      }
    }


    // Relationship-driven social reactions with Eric: friendships and rivalries feel distinct.
    if (isStudent && distance(entity, player) < 2.4 && game.rng() < 0.0022) {
      const relation = entity.relationships?.Eric ?? 0;
      if (relation >= 45) {
        const friendlyLines = ['🤝 Need cover? I did not see anything.', '😄 Eric, that prank was bold!', '🫶 I will save you a seat.'];
        say(entity, friendlyLines[Math.floor(game.rng() * friendlyLines.length)], { durationMs: 3000 });
      } else if (relation <= -45) {
        const hostileLines = ['😒 Keep away from me, Eric.', '📣 Sir, Eric is at it again!', '🙄 You are trouble, mate.'];
        say(entity, hostileLines[Math.floor(game.rng() * hostileLines.length)], { durationMs: 3000 });
      }
    }

    // Students form friendships and enemies from trait chemistry.
    if (isStudent && game.rng() < 0.0014) {
      const peer = game.entities.find((candidate) => (
        candidate !== entity
        && candidate.role !== 'teacher'
        && candidate.role !== 'janitor'
        && distance(candidate, entity) < 2.3
      ));
      if (peer) {
        const sharedVibe = ((entity.traits.friendly + entity.traits.funny + entity.traits.honor) - (peer.traits.aggression + peer.traits.sadism)) / 120;
        const chemistry = sharedVibe + ((entity.traits.wit - peer.traits.wit) / 300);
        if (chemistry > 0.35 && game.rng() < 0.5) {
          entity.friends = entity.friends || {};
          entity.friends[peer.name] = clampScore((entity.friends[peer.name] || 35) + 9, 0, 100);
        } else if (chemistry < -0.2 && game.rng() < 0.45) {
          entity.enemies = entity.enemies || {};
          entity.enemies[peer.name] = clampScore((entity.enemies[peer.name] || 20) + 8, 0, 100);
        }
      }
    }

    // Students keep chatting while walking corridors/transition routes,
    // and only really settle once inside their assigned classroom.
    const expectedRoomNow = entity.role === 'teacher'
      ? (assignedTeacherName && entity.name === assignedTeacherName ? current.room : teacherHomeRoom(entity.name))
      : (inLesson ? (entity.lessonRoom || current.room) : current.room);
    const inAssignedClassroom = inLesson && isStudent && entityRoom(entity) === expectedRoomNow;
    const walkingToClass = inLesson && isStudent && !inAssignedClassroom;
    if ((current.mode === 'transition' || current.mode === 'break' || current.mode === 'home' || walkingToClass) && isStudent && game.rng() < 0.0045) {
      ensureDialogueSetup(entity);
      const hallwayChatter = entity.dialogue.hallwayChatter || ['😆 Wait up, I am coming too!'];
      const line = pickFreshLine(entity, hallwayChatter, 'speech');
      say(entity, line || hallwayChatter[0], { durationMs: 3600 });
    }

    // If a student wanders into the wrong classroom during lesson, they make an excuse and leave.
    const inAnyClassroom = roomAtPosition(entity)?.type === 'classroom';
    if (walkingToClass && inAnyClassroom && entityRoom(entity) !== expectedRoomNow && (now - (entity.lastWrongRoomExcuseAt || 0)) > 7000) {
      entity.lastWrongRoomExcuseAt = now;
      const excuses = ['😅 Sorry, wrong class — I need to get to my lesson.', '🙋 Oops, wrong room. I am heading to the right one now.', '📚 Excuse me, I should be in another class.'];
      say(entity, excuses[Math.floor(game.rng() * excuses.length)], { durationMs: 2600 });
      const roomNow = roomAtPosition(entity);
      const wrongRoomDoor = roomDoorway(roomNow);
      // Explicitly route out through the current room door first to avoid corner pinning.
      entity.target = (wrongRoomDoor && distance(entity, wrongRoomDoor) > 0.95)
        ? wrongRoomDoor
        : (getSeatPosition(expectedRoomNow, entity.seatIndex, entity)
          || roomCenter(expectedRoomNow)
          || entity.target);
    }

    // Teacher occasionally hushes the class, then students slowly get noisy again.
    if (inLesson && entity.role === 'teacher' && entityRoom(entity) === current.room && now > game.lessonQuietUntil && game.lessonNoiseLevel > 0.38 && game.rng() < 0.0013) {
      ensureDialogueSetup(entity);
      const quietCalls = [
        `🤨 ${entity.name}: posture check — settle down.`,
        `🧑‍🏫 ${entity.name}: eyes front, voices low.`,
        `🔕 ${entity.name}: volume down, or everyone gets lines.`,
      ];
      say(entity, quietCalls[Math.floor(game.rng() * quietCalls.length)], { durationMs: 3400 });
      game.lessonQuietUntil = now + 9000;
      game.lessonNoiseLevel = 0.04;
    }

    // Witty teacher comeback when a student asks a silly question.
    if (inLesson && isStudent && entityRoom(entity) === current.room && now > game.lessonQuietUntil && game.rng() < 0.00024) {
      const sillyQuestions = ['🙃 Sir, can we do homework in our dreams?', '😅 Miss, is zero afraid of minus numbers?', '🤔 If I eat my notes, do I absorb the lesson?', '🧪 If we mix maths and music, do we get algebra beats?', '📏 Can I measure effort with a ruler and hand that in?', '🛰️ If I answer in space-voice, is it still correct?', '🍟 Is lunch technically a science experiment?', '🎭 If I act confident, do I get confidence marks?', '🦆 Is a duck in uniform allowed in assembly?', '📚 If I highlight everything, does that count as revision?', '🧠 Can my future self come sit this test for me?', '⏰ Can we have a two-minute break every two minutes?'];
      say(entity, sillyQuestions[Math.floor(game.rng() * sillyQuestions.length)], { durationMs: 3600 });
      const classTeacher = game.entities.find((candidate) => (
        candidate.role === 'teacher'
        && entityRoom(candidate) === current.room
        && candidate.knockedUntil < now
      ));
      if (classTeacher) {
        classTeacher.speech = null;
        say(classTeacher, ['😏 Nice try. If that worked, I would eat the exam keys.', '🧠 Creative, but knowledge still needs actual study.', '😂 Brilliant joke. Now give me the real answer.', '📘 Funny. Write that in your comedy notebook, then answer properly.', '🪑 Stand-up career later, seat-work now.', '🎯 Good energy — aim it at the actual question.', '🧮 If jokes solved equations, you would be top set already.', '⏱️ Ten out of ten for timing, zero for accuracy so far.', '📝 Excellent imagination. I also need excellent handwriting and a real answer.', '🔍 I admire the chaos. I still need evidence and working out.', '🧑‍🏫 Gold star for confidence, now earn one for correctness.', '🎓 Keep the wit, lose the waffle. Answer the task.'][Math.floor(game.rng() * 12)], { durationMs: 3900 });
      }
    }

    // Angelface can slip out through the gates unnoticed and re-enter later.
    if (entity.name === 'Angelface' && entityRoom(entity) === 'School Gates' && game.rng() < 0.003) {
      entity.target = { x: schoolExit.x + 2.6, y: 92 };
      if (entity.x > schoolExit.x + 1.8) {
        entity.x = 92;
        entity.y = 88;
        entity.target = roomCenter('P.E. Field');
        announce('😎 Angelface sneaked out and later strolled back in unnoticed.');
        logSchoolHistory('Angelface slipped out of school gates and still got away with it.', entity);
      }
    }

    // Teacher discipline: if they catch player in wrong room, assign lines.
    if (entity.role === 'teacher' && distance(entity, player) < 1.8 && entityRoom(player) !== current.room && supervised && teacherPresent && !isTeacherBackTurned(entity)) {
      addLines(40, `${entity.name} caught you bunking ${current.period}`);
    }

    // Swot tattles if player is misbehaving nearby.
    if (entity.profile.tattles && distance(entity, player) < 2 && game.rng() < (0.0012 + ((entity.traits?.honor || 40) / 50000)) && game.lines > 0) {
      addLines(10, `${entity.name} tattled`);
      announce(`📣 ${entity.name}: "Sir! Eric is being bad!"`, { source: entity, range: 7.5 });
    }

    // Bully behaviour is period-aware so mornings stay mostly calm.
    if (entity.role === 'bully') {
      const supervisionSuppression = dinnerLadyWatchingField && entityRoom(entity) === 'Dining Hall' ? 0.22 : 1;
      if (game.rng() < bullyFightChance(current) * supervisionSuppression) {
        meleeAttack(entity);
      }
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

    // Break-time social bubbles make playground time feel alive.
    if (current.mode === 'break' && isStudent && (!dinnerLadyWatchingField || entityRoom(entity) !== 'Dining Hall') && game.rng() < 0.007) {
      ensureDialogueSetup(entity);
      const recent = randomHistorySnippet();
      if (recent && game.rng() < 0.52) {
        say(entity, `🗞 ${recent.text}`);
      } else if (game.rng() < 0.45) {
        const question = pickFreshLine(entity, entity.dialogue.questions, 'speech') || entity.dialogue.questions[0];
        say(entity, question);
      } else {
        const chat = ['😄 Nice pass!', '🤝 Meet by the canteen.', '😲 Did you see that punch?', "🍟 I'm starving.", '🏃 Race you to the field!', '😂 That lesson was chaos!', '🙌 Bell finally rang!'];
        say(entity, pickFreshLine(entity, chat, 'speech') || chat[0]);
      }
      entity.emotion = Math.min(100, entity.emotion + 1.8);
    }

    // Students and teachers can swap pocket items during breaks and corridor transitions.
    if ((current.mode === 'break' || (!inLesson && !supervised)) && game.rng() < 0.0042) {
      const partner = nearestTradePartner(entity, 1.85);
      if (partner) tryTrade(entity, partner);
    }

    // Weather drives break-time choices and social reactions.
    if (current.mode === 'break' && !isLunchtimePeriod(current) && isStudent && game.rng() < 0.0045) {
      if (game.weather === 'rain') {
        entity.target = roomCenter('Assembly Hall');
        if (isOutside) think(entity, '🌧️ No thanks, staying inside today.');
      } else if (game.weather === 'snow') {
        entity.target = roomCenter('P.E. Field');
        if (entityRoom(entity) === 'P.E. Field' && game.rng() < 0.2) say(entity, '❄️ Snowball fight! 😆');
      } else if (game.weather === 'sunny') {
        entity.target = roomCenter('P.E. Field');
        if (entityRoom(entity) === 'P.E. Field' && game.rng() < 0.2) say(entity, '⚽ Pass it! 😎');
      } else if (game.weather === 'windy') {
        entity.target = roomCenter('School Gates');
        if (isOutside && game.rng() < 0.16) {
          say(entity, '💨 Run! Run! 😄');
          entity.vx += (game.rng() - 0.5) * 0.45;
          entity.vy += (game.rng() - 0.5) * 0.22;
        }
      }
    }

    // Students can buy food/drink at vending machines and then carry packaging.
    if (entity.role !== 'teacher' && entity.role !== 'janitor' && entity.role !== 'dinnerLady' && !entity.carryingTrash && current.mode === 'break' && game.rng() < 0.0018) {
      entity.carryingTrash = true;
      entity.target = nearestPoint(entity, vendingMachines);
    }

    // Most students bin litter; some occasionally drop it and get told off.
    if (entity.role !== 'teacher' && entity.role !== 'janitor' && entity.role !== 'dinnerLady' && entity.carryingTrash && !inLesson) {
      const nearestBin = nearestPoint(entity, trashCans);
      const littering = game.rng() < 0.001;
      if (littering) {
        entity.carryingTrash = false;
        entity.assignedWaste = { x: entity.x, y: entity.y, offender: entity, warned: false, kind: 'rubbish', droppedAt: performance.now() };
        game.litter.push(entity.assignedWaste);
      } else if (nearestBin && distance(entity, nearestBin) < 1.5) {
        entity.carryingTrash = false;
        entity.assignedWaste = null;
      } else {
        entity.target = nearestBin;
      }
    }

    if (entity.role === 'dinnerLady') {
      // Dinner ladies split lunch duty: one serves from the bar, the other patrols tables.
      if (isLunchtimePeriod(current) && entityRoom(entity) === 'Dining Hall') {
        const layout = diningHallLayout();
        const allDinnerLadies = game.entities.filter((candidate) => candidate.role === 'dinnerLady');
        const servingLady = allDinnerLadies[0];
        const isServingLady = entity === servingLady;

        if (layout) {
          if (isServingLady) {
            entity.target = layout.servingPoint;
          } else {
            entity.patrolIndex = typeof entity.patrolIndex === 'number' ? entity.patrolIndex : 0;
            if (!entity.target || distance(entity, entity.target) < 1.05) {
              entity.patrolIndex = (entity.patrolIndex + 1) % layout.patrolRoute.length;
              entity.target = layout.patrolRoute[entity.patrolIndex];
            }
          }
        }
        // Briefly looking away creates small windows where fights can flare back up.
        if (entity.writingUntil < performance.now() && game.rng() < 0.0012) {
          entity.writingUntil = performance.now() + 1400;
        }

        if (performance.now() - game.dinnerLadyLastWhistleAt > 11000 && game.rng() < 0.0052) {
          game.dinnerLadyLastWhistleAt = performance.now();
          say(entity, '📯 Calm down, you lot — spread out and no fighting!', { durationMs: 3200 });
          calmNearbyStudents(entity, 10.5, 0.2);
          game.lessonQuietUntil = performance.now() + 3600;
          game.lessonNoiseLevel = Math.max(0, game.lessonNoiseLevel - 0.35);
        }



        if (layout && isServingLady && game.rng() < 0.0065) {
          const servingStudent = game.entities.find((candidate) => (
            isStudentCharacter(candidate)
            && candidate.lunchState === 'beingServed'
            && entityRoom(candidate) === 'Dining Hall'
            && distance(candidate, layout.queueSlots[0]) < 1.1
          ));
          if (servingStudent && game.rng() < 0.45) {
            say(entity, `🍛 Next! ${servingStudent.name}, tray up please.`, { durationMs: 1800 });
          }
        }
        // Close-range intervention: drag one rowdy pupil to the Headmaster Office.
        const rowdy = game.entities.find((candidate) => (
          candidate !== entity
          && isStudentCharacter(candidate)
          && entityRoom(candidate) === 'Dining Hall'
          && candidate.knockedUntil < performance.now()
          && (candidate.role === 'bully' || candidate.mood === 'angry' || Math.abs(candidate.vx) + Math.abs(candidate.vy) > 0.42)
          && distance(entity, candidate) < 1.7
        ));

        if (rowdy && game.rng() < 0.02) {
          dragStudentOffFieldToHeadmaster(entity, rowdy);
          continue;
        }

        if (dinnerLadyWatchingField) {
          calmNearbyStudents(entity, 7.8, 0.42);
        }
      }
    }

    if (entity.role === 'teacher') {
      const seenLitter = game.litter.find((item) => item.kind !== 'sick' && !item.warned && distance(entity, item) < 2.1 && item.offender);
      if (seenLitter) {
        seenLitter.warned = true;
        seenLitter.offender.carryingTrash = true;
        seenLitter.offender.target = nearestPoint(seenLitter.offender, trashCans);
        seenLitter.offender.litterWarnUntil = performance.now() + 4000;
        // Teacher makes pupil pick it up immediately, then walk it to a bin.
        game.litter = game.litter.filter((item) => item !== seenLitter);
        announce(`🧑‍🏫 ${entity.name}: "Pick that litter up and use the bin!"`, { source: entity, range: 8 });
      }
    }

    const desiredFloor = roomAtPosition(entity.target)?.floor || entityFloor(entity);
    const nearStair = isNearStairStep(entity, 1.55) || isNearStairStep(entity.target, 1.95);
    // Stair congestion gets its own timer so we can recover from periodic pile-ups.
    entity.stairJamSeconds = nearStair
      ? (entity.stairJamSeconds + dtSeconds)
      : Math.max(0, entity.stairJamSeconds - (dtSeconds * 0.75));

    if (tryUseStairs(entity, desiredFloor, { repositionOnStairJam: true })) {
      entity.vx = 0;
      entity.vy = 0;
      updateNpcVitals(entity, dt, false);
      continue;
    }

    // NPCs also use doorway transitions instead of clipping through room walls.
    const npcDoor = nearestDoor(entity, 1.3);
    if (npcDoor) {
      const targetRoom = roomAtPosition(entity.target);
      const currentlyInside = entityRoom(entity) === npcDoor.room;
      const shouldEnter = targetRoom?.name === npcDoor.room && !currentlyInside;
      const shouldExit = targetRoom?.name !== npcDoor.room && currentlyInside;
      if (shouldEnter || shouldExit) {
        useDoor(entity, npcDoor);
      }
    }

    const expectedRoom = entity.role === 'teacher'
      ? (assignedTeacherName && entity.name === assignedTeacherName ? current.room : teacherHomeRoom(entity.name))
      : (inLesson ? (entity.lessonRoom || current.room) : current.room);
    const studentInCurrentClass = entity.role !== 'teacher' && entityRoom(entity) === expectedRoom;

    const routedTarget = routeWaypoint(entity, entity.target);
    let dx = routedTarget.x - entity.x;
    let dy = routedTarget.y - entity.y;

    if (isStartDayPeriod(current)) {
      const field = roomByName('P.E. Field');
      if (field) {
        const dividerX = field.x + morningQueue.dividerInsetFromFieldLeft;
        // Keep morning queues split by role to match the field divider visuals.
        if (isStudentCharacter(entity)) {
          entity.x = Math.max(dividerX + 0.6, entity.x);
        } else if (entity.role === 'teacher') {
          entity.x = Math.min(dividerX - 0.6, entity.x);
        }
      }
    }

    // Lightweight separation avoids visual clumping, but we skip it for seated pupils
    // so classroom rows stay stable and students don't drift toward the blackboard.
    // Doorway/stair choke points allow temporary stacking so flows do not deadlock.
    const crowdChokePoint = isNearDoorway(entity, 2.4) || isNearDoorway(routedTarget, 2.4) || nearStair;
    const canPhaseThroughCrowd = entity.phaseThroughUntil > performance.now() || crowdChokePoint;
    if (!(inLesson && studentInCurrentClass) && !canPhaseThroughCrowd) {
      for (const other of game.entities) {
        if (other === entity || other.knockedUntil > performance.now()) continue;
        const gapX = entity.x - other.x;
        const gapY = entity.y - other.y;
        const gap = Math.hypot(gapX, gapY) || 0.001;

        // Teachers get deterministic pathing: they move through crowds while students
        // are displaced, instead of staff being deflected into walls/doorway loops.
        if (entity.role === 'teacher') {
          // Staff can phase through crowds/chairs so they reliably reach desks.
          if (other.role !== 'teacher') pushStudentAsideForTeacher(entity, other, dt / 1000);
          continue;
        }

        if (gap < 1.45) {
          // Teachers keep priority: students yield more, teachers yield less.
          let push = ((1.45 - gap) / 1.45) * 0.46;
          if (entity.role !== 'teacher' && other.role === 'teacher') push *= 2.35;
          if (entity.role === 'teacher' && other.role !== 'teacher') push *= 0.28;
          dx += (gapX / gap) * push;
          dy += (gapY / gap) * push;
        }
      }
    }

    const len = Math.hypot(dx, dy) || 1;

    // During gate lineup, lock pupils/teachers still once they reach their slot.
    if (isStartDayPeriod(current) && len < 0.52) {
      entity.vx = 0;
      entity.vy = 0;
      entity.running = false;
      constrain(entity);
      updateNpcVitals(entity, dt, false);
      continue;
    }

    // Eric always reclaims his reserved seat if someone is in it.
    if (inLesson && entity === player) {
      const ericSeat = getSeatPosition(expectedRoom, player.seatIndex, player);
      const intruder = ericSeatOccupant(expectedRoom);
      if (ericSeat && intruder && distance(player, ericSeat) < 1.45 && distance(player, intruder) < 1.55) {
        meleeAttack(player);
      }
    }

    // During lessons all teachers should be seated in their designated classroom,
    // not just the currently assigned teacher in the active period room.
    const seatedTarget = inLesson && entityRoom(entity) === expectedRoom;
    const lunchSeatTarget = isLunchtimePeriod(current) && isStudent && entity.lunchState === 'eating' && entityRoom(entity) === 'Dining Hall';
    const wasSeated = entity.isSeated && (entity.seatedRoom === expectedRoom || entity.seatedRoom === 'Dining Hall');
    // Add a small hysteresis window: sitting is easy to maintain, harder to flip off.
    entity.isSeated = (seatedTarget || lunchSeatTarget) && (len < 0.4 || (wasSeated && len < 0.85));

    // Assembly-specific settle pass: lock teachers at their final standing/seated marker
    // to stop micro path corrections that look like hopping on the spot.
    if (inLesson && isAssemblyPeriod(current) && entity.role === 'teacher' && entityRoom(entity) === 'Assembly Hall') {
      const roster = teachersInRoster();
      const index = Math.max(0, roster.filter((teacher) => teacher.name !== 'Mr Wacker').findIndex((teacher) => teacher.name === entity.name));
      const settleSpot = entity.name === 'Mr Wacker'
        ? assemblyHeadmasterSpot()
        : assemblyTeacherLineSpot(index, roster.length);
      if (distance(entity, settleSpot) < 0.9) {
        entity.x = settleSpot.x;
        entity.y = settleSpot.y;
        entity.target = settleSpot;
        entity.isSeated = true;
      }
    }

    // Keep lessons visually correct: students sit once they are at their desk tile.
    if (seatedTarget && entity.role !== 'teacher') {
      const seatTarget = getSeatPosition(expectedRoom, entity.seatIndex, entity) || entity.target;
      if (seatTarget && distance(entity, seatTarget) < 0.72) {
        entity.x = seatTarget.x;
        entity.y = seatTarget.y;
        entity.isSeated = true;
      }
    }
    entity.seatedRoom = entity.isSeated ? (lunchSeatTarget ? 'Dining Hall' : expectedRoom) : null;
    const lateForClass = entity.role === 'teacher'
      ? (inLesson && entityRoom(entity) !== expectedRoom)
      : (inLesson && entityRoom(entity) !== expectedRoom);
    const canRun = entity.energy > 20;
    entity.running = lateForClass && canRun;
    const bellRushBoost = (!inLesson && isStudent && now < (entity.bellRushUntil || 0)) ? 1.35 : 1;
    const runBoost = (entity.running ? 1.45 : 1) * bellRushBoost;
    // Teachers are intentionally quicker than students to keep lessons moving.
    const hallwayBoost = entity.role === 'teacher' ? 3.1 : 3.3;
    // Staff get an extra catch-up boost so lessons do not appear to start without a teacher.
    const staffCatchupBoost = entity.role === 'teacher' && lateForClass ? 1.35 : 1;
    const speed = entity.personality.speed * (entity.energy / 100) * hallwayBoost * runBoost * staffCatchupBoost;

    entity.vx = entity.isSeated ? 0 : (dx / len) * speed;
    entity.vy = entity.isSeated ? 0 : (dy / len) * speed;

    moveEntityWithCollision(entity, entity.vx * (dt / 1000), entity.vy * (dt / 1000));

    constrain(entity);

    // Anti-stuck recovery: if a teacher is late and barely moving for several
    // seconds, snap to a clean waypoint toward their expected room.
    const moved = Math.hypot(entity.x - entity.lastX, entity.y - entity.lastY);
    entity.lastX = entity.x;
    entity.lastY = entity.y;
    const farFromAssignedTarget = distance(entity, entity.target) > 1.6;
    entity.stuckSeconds = (lateForClass && farFromAssignedTarget && moved < 0.06)
      ? (entity.stuckSeconds + dtSeconds)
      : Math.max(0, entity.stuckSeconds - (dtSeconds * 0.5));

    // If routing fails for too long, teleport straight to destination.
    if (entity.stuckSeconds > 3.2) {
      const rescueTarget = entity.role === 'teacher'
        ? (getTeacherSeatPosition(expectedRoom) || entity.target)
        : (inLesson
          ? (getSeatPosition(expectedRoom, entity.seatIndex, entity) || entity.target)
          : entity.target);
      teleportEntityToTarget(entity, rescueTarget, 'stuck');
      entity.isSeated = inLesson;
      entity.seatedRoom = inLesson ? expectedRoom : null;
    }

    // Extra stair safety net: if someone lingers around stair trigger points for ages,
    // skip the corridor jam and place them directly at their class destination.
    if (entity.stairJamSeconds > 4.5) {
      const classRescueTarget = entity.role === 'teacher'
        ? (getTeacherSeatPosition(expectedRoom) || roomCenter(expectedRoom) || entity.target)
        : (inLesson
          ? (getSeatPosition(expectedRoom, entity.seatIndex, entity) || roomCenter(expectedRoom) || entity.target)
          : entity.target);
      teleportEntityToTarget(entity, classRescueTarget, 'stair-stuck');
      entity.target = classRescueTarget;
      entity.stairJamSeconds = 0;
      entity.isSeated = inLesson && Boolean(classRescueTarget);
      entity.seatedRoom = entity.isSeated ? expectedRoom : null;
    }

    // Generic doorway jam recovery for all NPCs. If movement stalls in a choke-point,
    // refresh pathing and briefly allow overlap so queues can flow through one-tile doors.
    const farFromGoal = distance(entity, entity.target) > 1.6;
    const doorwayChoke = isNearDoorway(entity) || isNearDoorway(routedTarget, 2.2);
    if (farFromGoal && doorwayChoke) {
      entity.jamSeconds = moved < 0.05 ? (entity.jamSeconds + (dt / 1000)) : Math.max(0, entity.jamSeconds - (dt / 1400));
      if (entity.jamSeconds > 1.15) resetEntityPathing(entity, entity.target);

      // If a student keeps shuddering in a doorway while trying to leave a room,
      // snap them just outside that room's door so corridor flow does not freeze.
      if (isStudent && entity.jamSeconds > 2.35 && moved < 0.04) {
        teleportEntityOutsideCurrentDoor(entity, entity.target);
      }
    } else {
      entity.jamSeconds = 0;
    }

    constrain(entity);
    updateNpcVitals(entity, dt, entity.running);

    if (distance(entity, entity.target) < 0.9) {
      entity.target = null;
      entity.jamSeconds = 0;
      entity.phaseThroughUntil = 0;
    }

    resolvePersistentOverlap(entity, current, dtSeconds);

    // Throttled board prompts: only the assigned teacher in the active lesson room speaks.
    const boardCooldownMs = 55000;
    const canCallOutBoard = entity.role === 'teacher'
      && entity.name === assignedTeacherName
      && entityRoom(entity) === current.room
      && (isSupervisedPeriod(current))
      && (performance.now() - game.lastBoardCalloutAt > boardCooldownMs);
    if (canCallOutBoard && game.rng() < 0.0011) {
      const board = blackboards.find((b) => b.room === current.room);
      if (board) {
        setBoardText(board, lessonTasks[Math.floor(game.rng() * lessonTasks.length)]);
        game.lastBoardCalloutAt = performance.now();
        announce(`🧑‍🏫 ${entity.name}: "Quiet! Copy the board."`, { source: entity, range: 8 });
      }
    }

    // Teachers near boards animate as writing during lessons.
    const boardHere = blackboards.find((b) => b.room === entityRoom(entity));
    if (entity.role === 'teacher' && boardHere && distance(entity, boardHere) < 2.2 && supervised) {
      entity.writingUntil = performance.now() + 450;
      entity.facing = boardHere.x >= entity.x ? 1 : -1;
    }
  }

  syncComputerStations();
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
          game.litter.push({ x: entity.x, y: entity.y, offender: pellet.owner, warned: false, kind: 'rubbish', droppedAt: performance.now() });
          if (pellet.owner === player) {
            const delta = relationshipDeltaForEricInteraction(entity, 'insult');
            adjustEricRelationship(entity, delta, 'hit-by-rubbish');
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
        game.litter.push({ x: Math.max(0, Math.min(WORLD.w, pellet.x)), y: Math.max(0, Math.min(WORLD.h, pellet.y)), offender: pellet.owner, warned: false, kind: 'rubbish', droppedAt: performance.now() });
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
  const teacherReadyForLesson = isAssignedTeacherSeatedForPeriod(current);
  const periodWaiting = (isSupervisedPeriod(current))
    && (!teacherPresent || !teacherReadyForLesson);

  // Lessons wait briefly for the teacher to arrive and sit, then continue to avoid soft-locks.
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
    announce(`⏱️ ${current.period} resumed after waiting for teacher to get seated.`);
  }
  game.timeMinutes += deltaMins;

  if (isRegistrationPeriod(current) && !game.ericSeatReservedToday && game.periodElapsed < 2.5) {
    const blocker = ericSeatOccupant(current.room);
    if (blocker && !game.ericSeatBlockedWarned) {
      game.ericSeatBlockedWarned = true;
      announce(`🪑 ${blocker.name} is in Eric's seat. Stop by your desk and choose: move them or sit elsewhere.`);
    }
  }

  if (game.periodElapsed >= current.mins) {
    if (current.period === 'Home Time' && game.choseToStayAfterSchool && game.timeMinutes < game.stayingAfterSchoolUntil) {
      // Optional after-school free-play keeps Home Time active for one extra in-game hour.
      game.periodElapsed = Math.min(current.mins, game.periodElapsed);
    } else if (game.periodIndex === schedule.length - 1) {
      // Keep home-time active until player exits via gates.
      game.periodElapsed = current.mins;
    } else {
      // Ensure Eric always gets a fresh destination after each bell.
      let nextIndex = game.periodIndex + 1;
      while (nextIndex < schedule.length && schedule[nextIndex].room === current.room) {
        nextIndex += 1;
      }
      setPeriod(Math.min(nextIndex, schedule.length - 1));
    }
  }

  // Late checks are throttled to avoid line spam and keep simulation smooth.
  game.lastLateTick += dt;
  if (game.lastLateTick > 2000) {
    const monitored = isSupervisedPeriod(current);
    const graceWindow = game.periodElapsed < 4;
    // One late penalty per period prevents feed spam and "mystery lines" stacking.
    const teacherBackTurned = isAssignedTeacherBackTurnedForPeriod(current);
    if (entityRoom(player) !== current.room && monitored && teacherPresent && !teacherBackTurned && !graceWindow && !game.latePenaltyGiven) {
      addLines(10, `late for ${current.period}`);
      game.latePenaltyGiven = true;
    }
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

  clockEl.textContent = `🕘 ${formatTime(game.timeMinutes)}`;
  if (dayLabelEl) dayLabelEl.textContent = `📅 Day: ${weekdayLabelForDay()}`;
  const waitingLabel = !periodWaiting
    ? ''
    : (!teacherPresent ? ' (waiting for teacher to arrive)' : ' (waiting for teacher to sit)');
  periodEl.textContent = `🔔 Period: ${current.period}${waitingLabel}`;
  roomTargetEl.textContent = `📍 Target: ${current.room}`;
  if (current.period === 'Home Time' && game.choseToStayAfterSchool && game.timeMinutes < game.stayingAfterSchoolUntil) {
    periodEl.textContent = `🔔 Period: Home Time (Free play until ${formatTime(game.stayingAfterSchoolUntil)})`;
    roomTargetEl.textContent = '📍 Target: Computer Room (optional)';
  }
  updateAttendanceHud(current);
  updateFloorStatus();
}

function checkSchoolExit() {
  // Leaving via the gate triggers immediate discipline and a forced return.
  const current = schedule[game.periodIndex];
  if (player.x >= schoolExit.x && player.y >= schoolExit.yMin && player.y <= schoolExit.yMax) {
    if (current.mode === 'home' || current.mode === 'end') {
      if (game.choseToStayAfterSchool && game.timeMinutes < game.stayingAfterSchoolUntil) {
        announce(`🕹️ Eric decides to stay for extra computer time until ${formatTime(game.stayingAfterSchoolUntil)}.`, { force: true });
        player.x = schoolExit.x - 2.2;
        player.y = 90;
        return;
      }
      announce('✅ Eric leaves at home time. School day complete.');
      game.dayCount += 1;
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

function screenToWorld(screenX, screenY) {
  // Convert rendered canvas coordinates back to world units for hover hit-testing.
  return {
    x: CAMERA.x + (screenX / canvas.width) * CAMERA.w,
    y: CAMERA.y + (screenY / canvas.height) * CAMERA.h,
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
      : room.floor === 'ground'
        ? { a: '#67aa71', b: '#4f905a' }
        : { a: '#9f8f64', b: '#8a7a55' };

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
    const baseA = room.floor === 'upper' ? '#c8b7f4' : room.floor === 'middle' ? '#bcd2f1' : room.floor === 'ground' ? '#cbe9ce' : '#dfd2b0';
    const baseB = room.floor === 'upper' ? '#b59ee9' : room.floor === 'middle' ? '#a9c1e4' : room.floor === 'ground' ? '#b6dcb9' : '#c7ba98';
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

function updateWeatherFx(dt) {
  // Keep weather particles bounded so rendering stays lightweight.
  const spawnCount = game.weather === 'rain' ? 3 : game.weather === 'snow' ? 2 : game.weather === 'windy' ? 1 : 0;
  for (let i = 0; i < spawnCount; i += 1) {
    game.weatherFx.push({ x: game.rng() * WORLD.w, y: CAMERA.y - 2 + game.rng() * 3, life: 6000 + game.rng() * 3000 });
  }

  const speed = game.weather === 'rain' ? 0.05 : game.weather === 'snow' ? 0.018 : 0.03;
  const drift = game.weather === 'windy' ? 0.04 : game.weather === 'snow' ? 0.01 : 0.005;
  for (const particle of game.weatherFx) {
    particle.y += dt * speed;
    particle.x += (game.rng() - 0.45) * drift * dt;
    particle.life -= dt;
  }
  game.weatherFx = game.weatherFx.filter((particle) => particle.life > 0 && particle.y < WORLD.h + 3);
}

function drawTrees(sx, sy) {
  const windSway = game.weather === 'windy' ? Math.sin(performance.now() / 120) * 2.8 : 0;
  for (const tree of trees) {
    const p = worldToScreen(tree.x, tree.y);
    ctx.fillStyle = '#6b4f3a';
    ctx.fillRect(p.sx - 2, p.sy - 3, 4, 10);
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(p.sx + windSway, p.sy - 9, Math.max(5, sx * 0.42), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWeatherOverlay() {
  const skyTint = game.weather === 'rain' ? 'rgba(90,110,150,0.22)'
    : game.weather === 'snow' ? 'rgba(230,240,255,0.2)'
      : game.weather === 'windy' ? 'rgba(210,228,255,0.1)'
        : 'rgba(255,230,140,0.08)';
  ctx.fillStyle = skyTint;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sx = canvas.width / CAMERA.w;
  const sy = canvas.height / CAMERA.h;
  for (const particle of game.weatherFx) {
    const px = (particle.x - CAMERA.x) * sx;
    const py = (particle.y - CAMERA.y) * sy;
    if (game.weather === 'rain') {
      ctx.strokeStyle = 'rgba(194,224,255,0.72)';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 2, py + 8);
      ctx.stroke();
    } else if (game.weather === 'snow') {
      ctx.fillStyle = 'rgba(245,250,255,0.9)';
      ctx.fillRect(px, py, 2, 2);
    } else if (game.weather === 'windy') {
      ctx.strokeStyle = 'rgba(235,245,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(px - 5, py);
      ctx.lineTo(px + 7, py);
      ctx.stroke();
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

  // Restore floor separators so every level boundary is visible in the game window.
  const floorBreaks = [15, 50, 76, 110];
  for (const y of floorBreaks) {
    const row = worldToScreen(0, y);
    // Keep the very top edge clean while drawing the in-world floor boundaries.
    if (row.sy <= 0) continue;
    ctx.fillStyle = 'rgba(22, 30, 48, 0.5)';
    ctx.fillRect(0, row.sy - 1, canvas.width, 2);
  }

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
          // Desk footprint is larger and alternates subtle trim colors for variety.
          const altDeskShade = (seat.row + seat.col) % 3;
          ctx.fillStyle = altDeskShade === 0 ? '#8b5e3c' : altDeskShade === 1 ? '#93633f' : '#7f5539';
          ctx.fillRect(seatPos.sx - 6, seatPos.sy - 6, 12, 5);
          ctx.fillStyle = '#d8b68a';
          ctx.fillRect(seatPos.sx - 5, seatPos.sy - 5, 10, 1);
          // Desk legs.
          ctx.fillStyle = '#5f3d2a';
          ctx.fillRect(seatPos.sx - 6, seatPos.sy - 1, 2, 4);
          ctx.fillRect(seatPos.sx + 4, seatPos.sy - 1, 2, 4);
          // Chair and backrest behind desk.
          ctx.fillStyle = '#435b7a';
          ctx.fillRect(seatPos.sx - 4, seatPos.sy + 3, 8, 2);
          ctx.fillRect(seatPos.sx - 4, seatPos.sy + 1, 2, 2);
          ctx.fillRect(seatPos.sx + 2, seatPos.sy + 1, 2, 2);
        }

        // Teacher furniture is always present so every room can run lessons.
        const teacherDesk = worldToScreen(layout.teacherDesk.x, layout.teacherDesk.y);
        const teacherChair = worldToScreen(layout.teacherSeat.x, layout.teacherSeat.y);
        // Wider teacher desk stands out visually from pupil desks.
        ctx.fillStyle = '#7a4a2a';
        ctx.fillRect(teacherDesk.sx - 8, teacherDesk.sy - 5, 16, 5);
        ctx.fillStyle = '#4f2f1c';
        ctx.fillRect(teacherDesk.sx - 8, teacherDesk.sy, 2, 3);
        ctx.fillRect(teacherDesk.sx + 6, teacherDesk.sy, 2, 3);
        // Teacher chair tucked behind desk for seated lesson state.
        ctx.fillStyle = '#2f4868';
        ctx.fillRect(teacherChair.sx - 4, teacherChair.sy + 1, 8, 2);
        ctx.fillRect(teacherChair.sx - 4, teacherChair.sy - 1, 2, 2);
        ctx.fillRect(teacherChair.sx + 2, teacherChair.sy - 1, 2, 2);
      }
    }

    if (room.name === 'Dining Hall') {
      const layout = diningHallLayout();
      if (layout) {
        const plate = worldToScreen(layout.plateStand.x, layout.plateStand.y);
        const serve = worldToScreen(layout.servingPoint.x, layout.servingPoint.y);
        // Plate stand + serving bar make lunch flow readable for players.
        fillDitherRect(plate.sx - 10, plate.sy - 8, 20, 10, '#f8f1d3', '#e9d8a6', 2);
        ctx.fillStyle = '#495057';
        ctx.fillRect(plate.sx - 6, plate.sy - 5, 12, 2);
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i += 1) ctx.fillRect(plate.sx - 6 + (i * 3), plate.sy - 3, 2, 1);
        fillDitherRect(serve.sx - 20, serve.sy - 8, 40, 11, '#ffd6a5', '#f4a261', 3);
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(serve.sx - 20, serve.sy + 2, 40, 2);

        // Queue lane markers help communicate where students line up.
        for (const slot of layout.queueSlots) {
          const q = worldToScreen(slot.x, slot.y);
          ctx.strokeStyle = 'rgba(255,255,255,0.35)';
          ctx.strokeRect(q.sx - 5, q.sy - 4, 10, 8);
        }

        // Long tables + paired chairs for seated lunch behaviour.
        for (let i = 0; i < layout.seats.length; i += 2) {
          const a = layout.seats[i];
          const b = layout.seats[i + 1];
          if (!a || !b) continue;
          const table = worldToScreen(a.tableX, a.tableY);
          ctx.fillStyle = '#8d6e63';
          ctx.fillRect(table.sx - 10, table.sy - 4, 20, 8);
          ctx.fillStyle = '#6d4c41';
          ctx.fillRect(table.sx - 9, table.sy - 3, 18, 1);

          const leftChair = worldToScreen(a.x, a.y);
          const rightChair = worldToScreen(b.x, b.y);
          ctx.fillStyle = '#5c6b73';
          ctx.fillRect(leftChair.sx - 3, leftChair.sy - 3, 6, 5);
          ctx.fillRect(rightChair.sx - 3, rightChair.sy - 3, 6, 5);
        }
      }
    }

    // Door markers make room transitions clear and communicate where E can be used.
    const door = roomDoors.find((d) => d.room === room.name);
    if (door) {
      const doorPos = worldToScreen(door.x, door.y);
      // Taller door sprites read better at zoom and improve interaction affordance.
      fillDitherRect(doorPos.sx - 8, doorPos.sy - 10, 16, 20, '#835637', '#6a432a', 2);
      ctx.fillStyle = '#d3a15b';
      ctx.fillRect(doorPos.sx - 3, doorPos.sy - 8, 6, 14);
      ctx.fillStyle = '#2a1b12';
      ctx.fillRect(doorPos.sx + 1, doorPos.sy + 1, 2, 2);
      ctx.fillStyle = '#fff1d0';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('E', doorPos.sx - 2, doorPos.sy + 18);
    }

    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX, drawY, drawW, drawH);

    ctx.fillStyle = room.type === 'outdoor' ? PALETTE.cream : PALETTE.plum;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(room.name.toUpperCase(), drawX + 6, drawY + 12);
  }

  drawTrees(sx, sy);

  // Morning queue divider in the field (students right, teachers left).
  const field = roomByName('P.E. Field');
  if (field) {
    const dividerX = field.x + morningQueue.dividerInsetFromFieldLeft;
    const dividerTop = worldToScreen(dividerX, field.y + 0.8);
    const dividerBottom = worldToScreen(dividerX, field.y + field.h - 0.8);
    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(dividerTop.sx - 1, dividerTop.sy, 2, dividerBottom.sy - dividerTop.sy);
  }

  // Exit gate warning so players clearly see where escaping gets blocked.
  const gateTop = worldToScreen(schoolExit.x, schoolExit.yMin);
  const gateBottom = worldToScreen(schoolExit.x, schoolExit.yMax);
  ctx.fillStyle = '#ff4d4d';
  ctx.fillRect(gateTop.sx - 2, gateTop.sy, 4, gateBottom.sy - gateTop.sy);
  ctx.fillStyle = '#fff1d0';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('EXIT', gateTop.sx - 10, gateTop.sy - 4);

  // Stair markers are larger/wider with clear up/down icons for faster reading.
  for (const stair of stairs) {
    const points = [stair.fromY, stair.toY];
    for (const y of points) {
      const pos = worldToScreen(stair.x, y);
      const towardArrow = y === stair.fromY
        ? (stair.toY > stair.fromY ? '↓' : '↑')
        : (stair.fromY > stair.toY ? '↓' : '↑');
      const directionalStairIcon = towardArrow === '↑' ? '🪜↑' : '🪜↓';
      fillDitherRect(pos.sx - 19, pos.sy - 11, 38, 22, '#f4d06f', '#ffbf3c', 4);
      ctx.fillStyle = '#8f5a00';
      for (let i = 0; i < 6; i += 1) ctx.fillRect(pos.sx - 16 + i * 6, pos.sy - 9, 2, 18);
      ctx.fillStyle = PALETTE.ink;
      ctx.font = 'bold 7px monospace';
      ctx.fillText('STAIR', pos.sx - 17, pos.sy - 13);
      ctx.font = 'bold 9px monospace';
      ctx.fillText(directionalStairIcon, pos.sx - 4, pos.sy - 13);
      ctx.font = 'bold 7px monospace';
      ctx.fillText('E', pos.sx - 2, pos.sy + 16);
    }
  }

  // Keep analog time in the play window and place weather beside it for quick at-a-glance info.
  const clockPanelX = 6;
  const clockPanelY = 6;
  const clockPanelSize = 52;
  const clockCenterX = clockPanelX + (clockPanelSize / 2);
  const clockCenterY = clockPanelY + (clockPanelSize / 2);
  const totalMinutes = game.timeMinutes % (24 * 60);
  const minute = totalMinutes % 60;
  const hour = (Math.floor(totalMinutes / 60) % 12) + (minute / 60);
  const minuteAngleRad = ((minute * 6) - 90) * (Math.PI / 180);
  const hourAngleRad = ((hour * 30) - 90) * (Math.PI / 180);

  fillDitherRect(clockPanelX, clockPanelY, clockPanelSize, clockPanelSize, '#ddefff', '#bdd6f7', 3);
  ctx.strokeStyle = '#365d91';
  ctx.strokeRect(clockPanelX, clockPanelY, clockPanelSize, clockPanelSize);
  ctx.fillStyle = '#f8fbff';
  ctx.beginPath();
  ctx.arc(clockCenterX, clockCenterY, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#22406a';
  ctx.beginPath();
  ctx.arc(clockCenterX, clockCenterY, 17, 0, Math.PI * 2);
  ctx.stroke();

  // 12/3/6/9 markers keep the tiny dial intuitive without visual clutter.
  ctx.fillStyle = '#2c4260';
  ctx.fillRect(clockCenterX - 1, clockCenterY - 14, 2, 3);
  ctx.fillRect(clockCenterX + 11, clockCenterY - 1, 3, 2);
  ctx.fillRect(clockCenterX - 1, clockCenterY + 11, 2, 3);
  ctx.fillRect(clockCenterX - 14, clockCenterY - 1, 3, 2);

  ctx.strokeStyle = '#27496d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(clockCenterX, clockCenterY);
  ctx.lineTo(clockCenterX + Math.cos(hourAngleRad) * 8.5, clockCenterY + Math.sin(hourAngleRad) * 8.5);
  ctx.stroke();

  ctx.strokeStyle = '#406f9f';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(clockCenterX, clockCenterY);
  ctx.lineTo(clockCenterX + Math.cos(minuteAngleRad) * 12.5, clockCenterY + Math.sin(minuteAngleRad) * 12.5);
  ctx.stroke();

  ctx.fillStyle = '#1f3d5b';
  ctx.beginPath();
  ctx.arc(clockCenterX, clockCenterY, 1.8, 0, Math.PI * 2);
  ctx.fill();

  const weatherMeta = weatherModes[game.weather] || weatherModes.sunny;
  const weatherPanelX = clockPanelX + clockPanelSize + 6;
  const weatherPanelY = clockPanelY;
  const weatherPanelW = 96;
  const weatherPanelH = clockPanelSize;
  fillDitherRect(weatherPanelX, weatherPanelY, weatherPanelW, weatherPanelH, '#1f2f4d', '#294165', 3);
  ctx.strokeStyle = '#5f8fbe';
  ctx.strokeRect(weatherPanelX, weatherPanelY, weatherPanelW, weatherPanelH);
  ctx.fillStyle = '#d9ebff';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('WEATHER', weatherPanelX + 8, weatherPanelY + 12);
  ctx.font = 'bold 16px monospace';
  ctx.fillText(weatherMeta.icon, weatherPanelX + 8, weatherPanelY + 32);
  ctx.font = 'bold 9px monospace';
  ctx.fillText(weatherMeta.label.toUpperCase(), weatherPanelX + 28, weatherPanelY + 32);

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


  // Locker banks provide visual wayfinding on each floor corridor.
  for (const locker of lockers) {
    const p = worldToScreen(locker.x, locker.y);
    fillDitherRect(p.sx - 6, p.sy - 8, 12, 16, '#8b99a8', '#6f7f8e', 2);
    ctx.fillStyle = '#d8e1e8';
    ctx.fillRect(p.sx - 4, p.sy - 4, 8, 8);
    ctx.fillStyle = '#2a3540';
    ctx.font = 'bold 6px monospace';
    ctx.fillText(locker.assignedTo ? 'L' : '-', p.sx - 2, p.sy + 2);
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

  for (const urinal of urinals) {
    const p = worldToScreen(urinal.x, urinal.y);
    fillDitherRect(p.sx - 6, p.sy - 9, 12, 14, '#d6deea', '#b8c2d2', 2);
    ctx.fillStyle = '#52647a';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('U', p.sx - 2, p.sy);
  }

  for (const shower of showers) {
    const p = worldToScreen(shower.x, shower.y);
    fillDitherRect(p.sx - 8, p.sy - 10, 16, 18, '#8ecae6', '#5da9d6', 3);
    ctx.fillStyle = '#e3f6ff';
    ctx.fillRect(p.sx - 2, p.sy - 7, 4, 10);
    ctx.fillStyle = '#1d3557';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('🚿', p.sx - 5, p.sy - 12);
  }

  for (const waste of game.litter) {
    const p = worldToScreen(waste.x, waste.y);
    ctx.fillStyle = waste.kind === 'sick' ? '#8ac926' : '#f4a261';
    ctx.fillRect(p.sx - 3, p.sy - 2, 6, 4);
  }

  for (const board of blackboards) {
    const p = worldToScreen(board.x, board.y);
    const bx = p.sx - (BOARD_DRAW.width / 2);
    const by = p.sy - (BOARD_DRAW.height / 2);
    fillDitherRect(bx, by, BOARD_DRAW.width, BOARD_DRAW.height, '#194b31', '#23633f', 3);
    ctx.strokeStyle = '#93d5a9';
    ctx.strokeRect(bx, by, BOARD_DRAW.width, BOARD_DRAW.height);
    if (board.text) {
      ctx.fillStyle = PALETTE.chalk;
      ctx.font = '7px monospace';
      const lines = boardLinesForText(visibleBoardText(board));
      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, bx + 3, by + 8 + (lineIndex * BOARD_DRAW.lineHeight));
      });
    }
  }


  // Computer room terminals display live student activity (work vs skiving).
  for (const station of computerStations) {
    const p = worldToScreen(station.x, station.y);
    const meta = computerUseMeta[station.use] || computerUseMeta.word;
    ctx.fillStyle = '#6c757d';
    ctx.fillRect(p.sx - 7, p.sy - 4, 14, 8);
    ctx.fillStyle = '#343a40';
    ctx.fillRect(p.sx - 6, p.sy - 9, 12, 7);
    ctx.fillStyle = meta.color;
    ctx.fillRect(p.sx - 5, p.sy - 8, 10, 5);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 6px monospace';
    ctx.fillText(meta.icon, p.sx - 4, p.sy - 4);

    if (station.temptationBy) {
      ctx.fillStyle = '#ffb703';
      ctx.font = 'bold 6px monospace';
      ctx.fillText('?', p.sx + 5, p.sy - 10);
    }
  }

  // Themed classroom props visually communicate each room's speciality.
  for (const prop of classroomProps) {
    if (performance.now() < prop.hiddenUntil) continue;
    const p = worldToScreen(prop.x, prop.y);
    const scale = Math.max(1, prop.size || 1);
    const w = 8 + (scale * 4);
    const h = 6 + (scale * 3);
    ctx.fillStyle = prop.color;
    fillDitherRect(p.sx - (w / 2), p.sy - (h / 2), w, h, prop.color, '#ffffff22', 2 + scale);
    ctx.strokeStyle = '#3d3d3d';
    ctx.strokeRect(p.sx - (w / 2), p.sy - (h / 2), w, h);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `${6 + scale}px monospace`;
    ctx.fillText(prop.icon, p.sx - (2 + scale), p.sy + 2);
  }

  // Timed collectible loot rotates in/out around the school for trading routes.
  for (const item of game.collectables) {
    const p = worldToScreen(item.x, item.y);
    fillDitherRect(p.sx - 6, p.sy - 6, 12, 12, item.tint || '#ffe066', '#ffffff66', 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '8px monospace';
    ctx.fillText(item.icon || '✦', p.sx - 3, p.sy + 3);
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

  drawWeatherOverlay();
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
    ensureDialogueSetup(entity);
    if (!entity.posture) entity.posture = entity.dialogueProfile?.posture || 'upright';
    const px = Math.floor((entity.x - CAMERA.x) * sx);
    const py = Math.floor((entity.y - CAMERA.y) * sy);

    // Larger sprites for readability at scroll scale.
    const body =
      entity.role === 'player' ? '#ffca3a'
      : entity.role === 'teacher' ? '#4cc9f0'
      : entity.role === 'janitor' ? '#f8f9fa'
      : entity.role === 'nurse' ? '#ff8fab'
      : entity.role === 'dinnerLady' ? '#ffcad4'
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

      const strikeDir = entity.facing >= 0 ? 1 : -1;
      const appearance = entity.appearance || {};
      const useUniform = isStudentCharacter(entity);
      const headW = Math.max(8, appearance.headWidth || 10);
      const headH = Math.max(5, appearance.headHeight || 6);
      const bodyW = Math.max(11, appearance.bodyWidth || 14);
      const armW = Math.max(1, appearance.armWidth || 3);
      const armL = Math.max(6, appearance.armLength || 8);
      const legW = Math.max(2, appearance.legWidth || 5);
      const legL = Math.max(6, appearance.legLength || 8);
      const heightShift = appearance.heightOffset || 0;
      const skinTone = appearance.skinTone || '#ffd7b5';
      const hairColor = appearance.hairColor || '#513b2f';

      // Head + facial variation per student personality profile.
      ctx.fillStyle = skinTone;
      ctx.fillRect(px - Math.floor(headW / 2), py - 24 + bob - heightShift, headW, headH);
      ctx.fillStyle = hairColor;
      ctx.fillRect(px - Math.floor(headW / 2), py - 24 + bob - heightShift, headW, 2);
      // Ears and nose shapes make pupils less identical.
      const earSize = appearance.earSize || 1;
      ctx.fillStyle = skinTone;
      ctx.fillRect(px - Math.floor(headW / 2) - 1, py - 21 + bob - heightShift, earSize, 2);
      ctx.fillRect(px + Math.floor(headW / 2), py - 21 + bob - heightShift, earSize, 2);
      ctx.fillStyle = '#6d4c41';
      const noseX = appearance.noseType === 'long' ? px : px - 1;
      const noseH = appearance.noseType === 'button' ? 1 : appearance.noseType === 'long' ? 2 : 1;
      ctx.fillRect(noseX, py - 20 + bob - heightShift, 1, noseH);
      // Eyes: white + iris color + black pupil pixels; blink every ~10s randomly.
      const eyeSpread = appearance.eyeSpread || 1;
      if (now >= (entity.nextBlinkAt || 0)) {
        entity.blinkUntil = now + 130;
        entity.nextBlinkAt = now + (8000 + game.rng() * 4000);
      }
      const isBlinking = now < (entity.blinkUntil || 0);
      const eyeY = py - 22 + bob - heightShift;
      if (isBlinking) {
        ctx.fillStyle = '#2f2f2f';
        ctx.fillRect(px - eyeSpread - 2, eyeY, 3, 1);
        ctx.fillRect(px + eyeSpread - 1, eyeY, 3, 1);
      } else {
        // Left eye triplet.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px - eyeSpread - 2, eyeY, 1, 1);
        ctx.fillStyle = appearance.eyeColor || '#1d3557';
        ctx.fillRect(px - eyeSpread - 1, eyeY, 1, 1);
        ctx.fillStyle = '#000000';
        ctx.fillRect(px - eyeSpread, eyeY, 1, 1);
        // Right eye triplet.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + eyeSpread - 1, eyeY, 1, 1);
        ctx.fillStyle = appearance.eyeColor || '#1d3557';
        ctx.fillRect(px + eyeSpread, eyeY, 1, 1);
        ctx.fillStyle = '#000000';
        ctx.fillRect(px + eyeSpread + 1, eyeY, 1, 1);
      }
      if (appearance.acne) {
        ctx.fillStyle = '#d98f8f';
        ctx.fillRect(px - 3, py - 20 + bob - heightShift, 1, 1);
      }

      // Mouth opens while speaking to make dialogue readable from sprites.
      const isSpeaking = Boolean(entity.speech && entity.speech.until > now);
      ctx.fillStyle = '#4a1e1e';
      if (isSpeaking) ctx.fillRect(px - 1, py - 18 + bob - heightShift, 2, 2);
      else ctx.fillRect(px - 1, py - 18 + bob - heightShift, 2, 1);

      // School uniform: white shirt + blue tie + black trousers/shoes for students.
      ctx.fillStyle = useUniform ? '#f8f9fa' : body;
      ctx.fillRect(px - Math.floor(bodyW / 2), py - 18 + bob - heightShift, bodyW, 12);
      if (useUniform) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px - 2, py - 18 + bob - heightShift, 4, 4);
        ctx.fillStyle = '#2b59c3';
        ctx.fillRect(px - 1, py - 14 + bob - heightShift, 2, 4);
      }

      // Arms reflect skinny/thick build while keeping animation timing.
      ctx.fillStyle = skinTone;
      const rightArmX = strikeDir > 0 ? px + Math.floor(bodyW / 2) + punchReach : px + Math.floor(bodyW / 2);
      const leftArmX = strikeDir < 0 ? px - Math.floor(bodyW / 2) - armW - punchReach : px - Math.floor(bodyW / 2) - armW;
      // Assembly flourish: the headmaster waves both arms while speaking from the podium.
      const isHeadmasterAssemblySpeech = entity.name === 'Mr Wacker' && entityRoom(entity) === 'Assembly Hall' && isSpeaking;
      const speechWave = isHeadmasterAssemblySpeech ? Math.sin(now / 95) * 3.8 : 0;
      const leftArmYOffset = py - 17 + armKick + (strikeDir < 0 ? punchLift : 0) - (isWriting ? writingFrame : 0) - heightShift - speechWave;
      const rightArmYOffset = py - 17 - armKick + (strikeDir > 0 ? punchLift : 0) + (isWriting ? writingFrame : 0) - heightShift + speechWave;
      ctx.fillRect(leftArmX, leftArmYOffset, armW, armL);
      ctx.fillRect(rightArmX, rightArmYOffset, armW, armL);
      if (isWriting && entity.role === 'teacher') {
        ctx.fillStyle = '#f8f9fa';
        const chalkX = strikeDir > 0 ? px + 14 : px - 14;
        ctx.fillRect(chalkX, py - 15, 3, 2);
      }

      // Legs vary by profile; student trousers remain black to enforce uniform.
      ctx.fillStyle = useUniform ? '#111827' : '#1f2a44';
      if (seated) {
        ctx.fillRect(px - Math.floor(bodyW / 2), py - 8 - heightShift, 6, 3);
        ctx.fillRect(px + Math.floor(bodyW / 2) - 6, py - 8 - heightShift, 6, 3);
        ctx.fillRect(px - Math.floor(bodyW / 2), py - 5 - heightShift, legW, 6);
        ctx.fillRect(px + Math.floor(bodyW / 2) - legW, py - 5 - heightShift, legW, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(px - Math.floor(bodyW / 2), py + 1 - heightShift, legW, 2);
        ctx.fillRect(px + Math.floor(bodyW / 2) - legW, py + 1 - heightShift, legW, 2);
      } else {
        ctx.fillRect(px - legW - 1, py - 6 + legKick - heightShift, legW, legL);
        ctx.fillRect(px + 1, py - 6 - legKick - heightShift, legW, legL);
        ctx.fillStyle = '#000000';
        ctx.fillRect(px - legW - 1, py + 2 + legKick + (legL - 8) - heightShift, legW, 2);
        ctx.fillRect(px + 1, py + 2 - legKick + (legL - 8) - heightShift, legW, 2);
      }

      // Teachers are rendered larger and more formal than students.
      if (entity.role === 'teacher') {
        const attire = entity.profile.attire || 'staff';
        const backTurned = isWriting;

        // Broad shoulders + taller coat silhouette to read clearly at distance.
        ctx.fillStyle = attire === 'scienceCoat' ? '#f8f9fa' : attire === 'flash' ? '#f4d35e' : attire === 'plainBlueDress' ? '#4f86f7' : attire === 'oldBrown' ? '#8d6e63' : '#1e2438';
        ctx.fillRect(px - 9, py - 21 + bob, 18, 15);

        // Back-turned board-writing frame: no face/tie visible, jacket seam instead.
        if (backTurned) {
          ctx.fillStyle = '#2a334d';
          ctx.fillRect(px - 1, py - 20 + bob, 2, 13);
          ctx.fillStyle = '#5b4636';
          ctx.fillRect(px - 5, py - 24 + bob, 10, 2);
        } else {
          // Formal tie/collar motif helps identify staff quickly.
          ctx.fillStyle = '#fefefe';
          ctx.fillRect(px - 2, py - 19 + bob, 4, 4);
          ctx.fillStyle = '#c1121f';
          ctx.fillRect(px - 1, py - 15 + bob, 2, 4);
        }

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


      if (entity.role === 'dinnerLady') {
        // Dinner lady: apron silhouette + whistle so role reads instantly.
        ctx.fillStyle = '#f8bbd0';
        ctx.fillRect(px - 9, py - 21 + bob, 18, 15);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px - 6, py - 17 + bob, 12, 10);
        ctx.fillStyle = '#7b2cbf';
        ctx.fillRect(px - 1, py - 14 + bob, 2, 2);
      }

      if (entity.role === 'janitor') {
        // Janitor outfit: white overalls + blue jeans + spiky hair + moustache.
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(px - 9, py - 21 + bob, 18, 10);
        ctx.fillStyle = '#3a86ff';
        ctx.fillRect(px - 8, py - 11 + bob, 16, 5);
        ctx.fillStyle = '#2f1b12';
        ctx.fillRect(px - 4, py - 17 + bob, 8, 1);
        ctx.fillRect(px - 7, py - 26 + bob, 2, 3);
        ctx.fillRect(px - 3, py - 27 + bob, 2, 4);
        ctx.fillRect(px + 1, py - 27 + bob, 2, 4);
        ctx.fillRect(px + 5, py - 26 + bob, 2, 3);

        if (game.janitorTask) {
          const brushX = entity.facing >= 0 ? px + 11 : px - 13;
          ctx.fillStyle = '#8d6e63';
          ctx.fillRect(brushX, py - 16 + bob, 2, 11);
          ctx.fillStyle = '#f2cc8f';
          ctx.fillRect(brushX - 2, py - 6 + bob, 6, 2);
        }
      }
    }

    // Mood marker remains concise and readable.
    if (!knocked) {
      ctx.fillStyle = PALETTE.chalk;
      ctx.font = '10px monospace';
      const moodGlyph = entity.mood === 'angry' ? '!' : entity.mood === 'furious' ? '*' : '.';
      const postureGlyph = entity.posture === 'swagger' ? '↗' : entity.posture === 'slouched' ? '↘' : entity.posture === 'stiff' ? '|' : '·';
      ctx.fillText(`${moodGlyph}${postureGlyph}`, px - 4, py - 26);
    }

    const nowBubble = performance.now();
    if (entity.speech && entity.speech.until > nowBubble) {
      const lines = wrapBubbleText(entity.speech.text, 180);
      drawRoundedBubble(px, py - 42, lines, {
        paddingX: 8,
        paddingY: 5,
        lineHeight: 11,
        radius: 8,
        fillColor: 'rgba(255,255,255,0.97)',
        strokeColor: '#1f2937',
        shadowColor: 'rgba(10,12,28,0.35)',
        shadowBlur: 6,
        textColor: '#0f1426',
        font: '9px monospace',
      });
    }
    if (entity.thought && entity.thought.until > nowBubble) {
      const lines = wrapBubbleText(entity.thought.text, 160);
      drawRoundedBubble(px, py - 60, lines, {
        paddingX: 8,
        paddingY: 4,
        lineHeight: 10,
        radius: 9,
        fillColor: 'rgba(232,244,255,0.97)',
        strokeColor: '#3a86ff',
        shadowColor: 'rgba(30,80,130,0.25)',
        shadowBlur: 5,
        textColor: '#1d3557',
        font: '8px monospace',
        tailOffsetX: 12,
        bubblyTail: true,
      });
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

function refreshMiniMapNpcSnapshot() {
  const now = performance.now();
  if (now - game.miniMapLastRefreshAt < 350) return;

  // Snapshotting reduces mini-map draw cost while still showing movement frequently.
  game.miniMapNpcSnapshot = game.entities
    .filter((entity) => entity !== player && hasArrivedForCurrentPeriod(entity))
    .map((entity) => ({
      x: entity.x,
      y: entity.y,
      role: entity.role,
      seated: Boolean(entity.isSeated),
    }));
  game.miniMapLastRefreshAt = now;
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
  refreshMiniMapNpcSnapshot();

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

  // Student/teacher markers are refreshed periodically via snapshot cache.
  for (const npc of game.miniMapNpcSnapshot) {
    if (npc.role === 'teacher') {
      ctx.fillStyle = '#8ec5ff';
      ctx.fillRect(mapX + npc.x * scaleX - 1.8, mapY + npc.y * scaleY - 1.8, 3.6, 3.6);
      continue;
    }
    if (npc.role === 'dinnerLady') {
      ctx.fillStyle = '#ffcad4';
      ctx.fillRect(mapX + npc.x * scaleX - 1.8, mapY + npc.y * scaleY - 1.8, 3.6, 3.6);
      continue;
    }
    ctx.fillStyle = npc.seated ? '#9ae6b4' : '#ffd166';
    ctx.beginPath();
    ctx.arc(mapX + npc.x * scaleX, mapY + npc.y * scaleY, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#d9ecff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('MINI MAP', mapX + 6, mapY + 12);
  ctx.font = '8px monospace';
  ctx.fillText('● Class ■ Shield ● Toilet ○ You • Students ■ Teachers ■ Dinner Lady', mapX + 6, mapY + mapH - 6);
}


function drawAnalogClockWidget() {
  if (!clockHandHourEl || !clockHandMinuteEl) return;
  const totalMinutes = game.timeMinutes % (24 * 60);
  const minute = totalMinutes % 60;
  const hour = (Math.floor(totalMinutes / 60) % 12) + (minute / 60);
  const minuteAngle = minute * 6;
  const hourAngle = hour * 30;
  clockHandMinuteEl.style.transform = `rotate(${minuteAngle}deg)`;
  clockHandHourEl.style.transform = `rotate(${hourAngle}deg)`;
}

function updateBellRingSfx(now = performance.now()) {
  if (now > (game.bellRingingUntil || 0)) return;
  if (!game.lastBellToneAt || now - game.lastBellToneAt > 560) {
    playSfx('bell');
    game.lastBellToneAt = now;
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

function canvasPointerToInternal(event) {
  const rect = canvas.getBoundingClientRect();
  // Pointer coordinates are in CSS pixels; convert them to canvas buffer pixels.
  // This keeps hover/click hitboxes accurate even when the canvas is scaled.
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    mouseX: (event.clientX - rect.left) * scaleX,
    mouseY: (event.clientY - rect.top) * scaleY,
    wrapX: event.clientX - rect.left,
    wrapY: event.clientY - rect.top,
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

function positionTooltip(pointer, topOffset = 118, maxWidth = 260) {
  // Shared placement keeps entity + world tooltips inside the visible game panel.
  const wrap = canvas.parentElement.getBoundingClientRect();
  const left = Math.min(pointer.wrapX + 16, wrap.width - maxWidth);
  const top = Math.max(8, pointer.wrapY - topOffset);
  entityTooltipEl.style.left = `${left}px`;
  entityTooltipEl.style.top = `${top}px`;
}


function positionClassQuestionPanel(roomName) {
  if (!classQuestionPanelEl) return;
  const board = blackboards.find((entry) => entry.room === roomName);
  if (!board) {
    classQuestionPanelEl.style.left = '';
    classQuestionPanelEl.style.right = '0.8rem';
    return;
  }
  const boardPos = worldToScreen(board.x, board.y);
  const wrap = canvas.parentElement.getBoundingClientRect();
  const panelWidth = 340;
  const preferredLeft = Math.min(Math.max(8, (boardPos.sx / canvas.width) * wrap.width + 22), wrap.width - panelWidth - 8);
  classQuestionPanelEl.style.left = `${preferredLeft}px`;
  classQuestionPanelEl.style.right = 'auto';
  classQuestionPanelEl.style.top = '0.8rem';
}

function tooltipBar(value, color) {
  const clamped = Math.max(0, Math.min(100, Math.round(value || 0)));
  return `<span class="tooltip-meter"><span style="width:${clamped}%;background:${color};"></span></span>${clamped}%`;
}

function findHoveredWorldTargetAtScreen(mouseX, mouseY) {
  const world = screenToWorld(mouseX, mouseY);

  // Room detection gives players immediate orientation feedback anywhere on the map.
  const room = rooms.find((candidate) => (
    world.x >= candidate.x && world.x <= candidate.x + candidate.w
    && world.y >= candidate.y && world.y <= candidate.y + candidate.h
  ));

  const pointTargets = [];
  const addPoints = (points, labelBuilder, hitRadius = 1.1) => {
    for (const point of points) {
      pointTargets.push({
        x: point.x,
        y: point.y,
        hitRadius,
        title: labelBuilder(point),
      });
    }
  };

  // Keep item labels short and descriptive to avoid clutter while moving the mouse.
  addPoints(vendingMachines, (point) => `🥤 ${point.label}`);
  addPoints(trashCans, (point) => `🗑️ ${point.label}`);
  addPoints(lockers, (point) => `🗄️ Locker ${point.id}${point.assignedTo ? ` (${point.assignedTo})` : ''}`, 0.9);
  addPoints(waterFountains, (point) => `⛲ ${point.label}`);
  addPoints(urinals, (point) => `🚻 ${point.label}`, 0.95);
  addPoints(showers, (point) => `🚿 ${point.label}`, 0.95);
  addPoints(roomDoors, (point) => `🚪 Door to ${point.room}`);
  addPoints(stairs, (point) => `🪜 ${point.label}`);
  addPoints(blackboards, (point) => `🧑‍🏫 ${point.room} blackboard`);

  for (const prop of classroomProps) {
    if ((prop.hiddenUntil || 0) > game.timeMinutes) continue;
    pointTargets.push({ x: prop.x, y: prop.y, hitRadius: 0.9, title: `${prop.icon} ${prop.kind}` });
  }

  for (const item of game.collectables || []) {
    if (item.collected) continue;
    pointTargets.push({ x: item.x, y: item.y, hitRadius: 0.9, title: `${item.icon || '📦'} ${item.name || item.kind || 'Collectable item'}` });
  }

  let closestPoint = null;
  for (const target of pointTargets) {
    const dx = world.x - target.x;
    const dy = world.y - target.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= target.hitRadius && (!closestPoint || distance < closestPoint.distance)) {
      closestPoint = { ...target, distance };
    }
  }

  if (closestPoint) {
    return {
      heading: closestPoint.title,
      details: room ? `📍 ${room.name}` : '📍 School grounds',
    };
  }

  if (room) {
    return {
      heading: `🗺️ ${room.name}`,
      details: `Floor: ${room.floor} • ${room.type}`,
    };
  }

  return null;
}

function updateEntityTooltip(event) {
  const pointer = canvasPointerToInternal(event);
  const hovered = findHoveredEntityAtScreen(pointer.mouseX, pointer.mouseY);

  if (hovered) {
    game.hoveredEntity = hovered;
    const role = hovered.role === 'player' ? 'You' : hovered.role === 'dinnerLady' ? 'Dinner lady' : hovered.role;
    const room = entityRoom(hovered);
    const pocketItems = (hovered.inventory || []).slice(0, 3).join(', ');
    const moreItems = (hovered.inventory || []).length > 3 ? ` +${hovered.inventory.length - 3}` : '';
    const relationText = hovered.role === 'player' ? 'self' : relationshipLabel(hovered.relationships?.Eric || 0);
    const socialTag = hovered.socialProfile?.cliqueId ? ` | 🧑‍🤝‍🧑 ${hovered.socialProfile.cliqueId}` : '';
    const quirkTag = hovered.socialProfile?.evolvingQuirks?.length ? hovered.socialProfile.evolvingQuirks.slice(-1)[0] : 'settling in';
    entityTooltipEl.innerHTML = `${hovered.name} (${role})<br>📍 ${room} | 🤝 ${relationText}${socialTag}<br>⚡ Energy ${tooltipBar(hovered.energy, '#ffd166')}<br>🚻 Bladder ${tooltipBar(hovered.bladder, '#ff9f1c')}<br>🧼 Hygiene ${tooltipBar(hovered.hygiene || 0, '#72efdd')}<br>❤️ HP ${tooltipBar(hovered.hp, '#ef476f')}<br>🧠 Mood: ${Math.round(hovered.emotion || 0)} | 🦚 Pride: ${Math.round(hovered.pride || 0)}<br>💷 £${Math.round(hovered.money || 0)} | 🤝 Trade ${Math.round(hovered.traits?.trading || 0)} | 🗣️ Barter ${Math.round(hovered.traits?.barter || 0)}<br>🧬 Social quirk: ${quirkTag}<br>📝 Notes: ${hovered.title || hovered.profile?.title || 'No public notes yet'}<br>🎒 ${pocketItems || 'nothing useful'}${moreItems}`;
    positionTooltip(pointer, 118, 260);
    entityTooltipEl.hidden = false;
    return;
  }

  const worldTarget = findHoveredWorldTargetAtScreen(pointer.mouseX, pointer.mouseY);
  if (!worldTarget) {
    hideEntityTooltip();
    return;
  }

  game.hoveredEntity = null;
  entityTooltipEl.innerHTML = `<strong>${worldTarget.heading}</strong><br>${worldTarget.details}`;
  positionTooltip(pointer, 64, 230);
  entityTooltipEl.hidden = false;
}

const studentInteractions = [
  { id: 'trade', icon: '🤝', label: 'Offer a fair trade', action: 'trade', baseDelta: 3, lines: ['Fancy a swap?', 'Trade you something useful?', 'Want to exchange items?'] },
  { id: 'haggle', icon: '💬', label: 'Try to haggle a better deal', action: 'haggle', baseDelta: 1, lines: ['Come on, I can sweeten this deal.', 'Let me talk you into this swap.', 'Surely that is worth a better bargain?'] },
  { id: 'card-battle', icon: '🃏', label: 'Challenge to trump card battle', action: 'card-battle', baseDelta: 2, lines: ['Fancy a card duel?', 'Let us battle cards.', 'Trump card showdown?'] },
  { id: 'mug-cards', icon: '🕶️', label: 'Mug them for their cards', action: 'mug-cards', baseDelta: -20, lines: ['Hand over your cards.', 'Give me your deck. Now.', 'I am taking your cards.'] },
  { id: 'compliment', icon: '✨', label: 'Compliment their style', baseDelta: 7, lines: ['Sharp look today.', 'You owned that lesson.', 'Top form, genuinely.'] },
  { id: 'joke', icon: '😄', label: 'Crack a joke', baseDelta: 5, lines: ['Quick one before the bell?', 'Detention would laugh at this.', 'Chaos needs better punchlines.'] },
  { id: 'study', icon: '📚', label: 'Ask for study tips', baseDelta: 4, lines: ['Got a revision cheat code?', 'How do you lock this into memory?', 'Any fast method for this topic?'] },
  { id: 'gossip', icon: '🗣️', label: 'Share spicy gossip', baseDelta: 0, lines: ['Fresh rumour drop?', 'Staff room tea update?', 'Heard who got roasted in maths?'] },
  { id: 'tease', icon: '🙃', label: 'Light teasing', baseDelta: -2, lines: ['That sprint was in slow motion.', 'Pop quiz still chasing you?', 'Stealth level: cafeteria tray.'] },
  { id: 'insult', icon: '😬', label: 'Throw an insult', baseDelta: -8, lines: ['You peak at average.', 'Your chat needs patch notes.', 'Even homework has more spark.'] },
];

const staffInteractions = [
  { id: 'greet', icon: '👋', label: 'Give a polite greeting', baseDelta: 3, lines: ['Good day, sir.', 'Morning miss.', 'Ready for lesson, sir.'] },
  { id: 'ask-help', icon: '🧭', label: 'Ask for directions', baseDelta: 2, lines: ['Which room should I head to?', 'Can you point me to my class?', 'I am lost between floors.'] },
  { id: 'apologise', icon: '🙏', label: 'Apologise for behavior', baseDelta: 4, lines: ['Sorry for earlier, sir.', 'I will do better this lesson.', 'No trouble from me now.'] },
  { id: 'challenge', icon: '😏', label: 'Challenge authority', baseDelta: -6, lines: ['Rules are a bit much, no?', 'You cannot watch every corridor.', 'I am not convinced by that line.'] },
];

function interactionOptionsFor(target) {
  if (!target || target.role === 'player') return [];
  if (target.role === 'teacher' || target.role === 'janitor' || target.role === 'nurse' || target.role === 'dinnerLady') return staffInteractions;
  return studentInteractions;
}

function playTrumpCardBattle(target) {
  const myCards = (player.dailyCards || []);
  const theirCards = (target.dailyCards || []);
  if (!myCards.length) {
    announce('🃏 Eric has no daily cards in hand. Trade or wait for tomorrow.');
    return false;
  }
  if (!theirCards.length) {
    announce(`🃏 ${target.name} did not bring cards today.`);
    return false;
  }

  const myCard = myCards[Math.floor(game.rng() * myCards.length)];
  const theirCard = theirCards[Math.floor(game.rng() * theirCards.length)];
  const stat = ['strength', 'defense'][Math.floor(game.rng() * 2)];
  const myScore = myCard[stat] + ((player.traits?.luck || 50) / 20);
  const theirScore = theirCard[stat] + ((target.traits?.luck || 50) / 20);

  announce(`🃏 Duel: Eric plays ${myCard.name} (${stat} ${myCard[stat]}) vs ${target.name}'s ${theirCard.name} (${stat} ${theirCard[stat]}).`, { force: true });
  if (myScore >= theirScore) {
    target.dailyCards = theirCards.filter((card) => card.id !== theirCard.id);
    player.dailyCards.push(theirCard);
    updateCardCollectionFromCards([theirCard]);
    adjustEricRelationship(target, 2, 'card-win');
    announce(`🏆 Eric won and took ${theirCard.name}!`, { force: true });
  } else {
    player.dailyCards = myCards.filter((card) => card.id !== myCard.id);
    target.dailyCards.push(myCard);
    adjustEricRelationship(target, -4, 'card-loss');
    announce(`💥 Eric lost and handed over ${myCard.name}.`, { force: true });
  }
  updateMission();
  return true;
}

function mugCardsFromTarget(target) {
  const theirCards = target.dailyCards || [];
  if (!theirCards.length) {
    announce(`🕶️ ${target.name} has no cards to steal.`);
    return false;
  }
  const stolen = theirCards.splice(0, Math.min(2, theirCards.length));
  player.dailyCards = player.dailyCards || [];
  player.dailyCards.push(...stolen);
  updateCardCollectionFromCards(stolen);
  target.refusesEricUntilDay = game.dayCount + 3 + Math.floor(game.rng() * 4);
  target.relationships = target.relationships || {};
  target.relationships.Eric = -100;
  target.ericReputation = Math.max(-100, (target.ericReputation || 0) - 35);
  announce(`🚨 Eric mugged ${target.name} and stole ${stolen.length} card(s). They refuse to speak for days.`, { force: true });
  updateMission();
  return true;
}

function calculateStudentInteractionDelta(target, option) {
  const traits = target.traits || {};
  const warmth = ((traits.friendly || 50) - 50) / 10;
  const humor = ((traits.funny || 50) - 50) / 14;
  const temper = ((traits.aggression || 50) - 50) / 11;
  const honor = ((traits.honor || 50) - 50) / 16;
  const charismaBonus = (game.charisma - 50) / 7;
  let delta = option.baseDelta + charismaBonus + warmth + honor;

  if (option.id === 'joke') delta += humor - (traits.wisdom || 50) / 36;
  if (option.id === 'gossip') delta += (traits.wit || 50) / 30 - honor - temper;
  if (option.id === 'tease') delta += humor - temper * 2;
  if (option.id === 'insult') delta -= temper + warmth;

  const variance = (game.rng() * 5) - 2.5;
  return Math.round(delta + variance);
}


function interactionCooldownRemainingHours(target, optionId) {
  if (!target || !optionId) return 0;
  const targetKey = target.name || 'npc';
  const memory = game.lastInteractionAtByTarget[targetKey] || {};
  const lastAt = memory[optionId];
  if (typeof lastAt !== 'number') return 0;
  const elapsed = game.timeMinutes - lastAt;
  return Math.max(0, INTERACTION_COOLDOWN_HOURS - elapsed);
}

function openInteractionPanelFor(target) {
  if (!target || target.role === 'player') return;
  game.selectedInteractionTarget = target;
  interactionPanelEl.hidden = false;
  interactionTitleEl.textContent = `Talk to ${target.name}`;
  if ((target.refusesEricUntilDay || 0) > game.dayCount) {
    interactionMetaEl.textContent = `${target.name} is still upset and refuses to talk until a later day.`;
    interactionOptionsEl.innerHTML = '<p>🙅 They are ignoring Eric after past betrayal.</p>';
    return;
  }
  interactionMetaEl.textContent = `Relationship: ${relationshipLabel(target.relationships?.Eric || 0)} • Reputation: ${Math.round(target.ericReputation || 0)} • Cards: ${(target.dailyCards || []).length}`;
  interactionOptionsEl.innerHTML = '';

  const options = interactionOptionsFor(target);
  if (!options.length) {
    interactionOptionsEl.innerHTML = '<p>⚠️ No interactions available right now.</p>';
    return;
  }

  // Button list is generated from a single data table for fast UI updates.
  for (const option of options) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = `Try: ${option.label}. Outcome depends on ${target.name}'s traits and your charisma.`;
    btn.textContent = `${option.icon} ${option.label}`;
    const remainingHours = interactionCooldownRemainingHours(target, option.id);
    if (remainingHours > 0) {
      btn.disabled = true;
      btn.title = `${option.label} available again in ${remainingHours.toFixed(1)} in-game hours.`;
      btn.textContent = `${option.icon} ${option.label} (cooldown ${remainingHours.toFixed(1)}h)`;
    }
    btn.onclick = () => {
      const cooldownLeft = interactionCooldownRemainingHours(target, option.id);
      if (cooldownLeft > 0) {
        announce(`⏳ ${target.name} shrugs: "Not yet. Try again in ${cooldownLeft.toFixed(1)} in-game hours."`);
        return;
      }
      const line = option.lines[Math.floor(game.rng() * option.lines.length)];
      announce(`🗨️ Eric to ${target.name}: "${line}"`);
      game.lastInteractionAtByTarget[target.name] = game.lastInteractionAtByTarget[target.name] || {};
      game.lastInteractionAtByTarget[target.name][option.id] = game.timeMinutes;

      if (option.action === 'trade') {
        attemptInteractionTrade(target, { haggle: false });
      } else if (option.action === 'haggle') {
        attemptInteractionTrade(target, { haggle: true });
      } else if (option.action === 'card-battle') {
        playTrumpCardBattle(target);
      } else if (option.action === 'mug-cards') {
        mugCardsFromTarget(target);
      } else {
        const delta = calculateStudentInteractionDelta(target, option);
        adjustEricRelationship(target, delta, `social:${option.id}`);
        target.ericReputation = Math.max(-100, Math.min(100, (target.ericReputation || 0) + delta));
        if (delta >= 4) announce(`🙂 ${target.name}: "Fair play, Eric."`, { source: target, range: 8, force: true });
        else if (delta <= -4) announce(`😠 ${target.name}: "Not cool, Eric."`, { source: target, range: 8, force: true });
        else announce(`😐 ${target.name}: "Hmm... maybe."`, { source: target, range: 8, force: true });
      }

      interactionMetaEl.textContent = `Relationship: ${relationshipLabel(target.relationships?.Eric || 0)} • Reputation: ${Math.round(target.ericReputation || 0)} • Cards: ${(target.dailyCards || []).length}`;
    };
    interactionOptionsEl.appendChild(btn);
  }
}

function onCanvasClick(event) {
  const pointer = canvasPointerToInternal(event);
  const clicked = findHoveredEntityAtScreen(pointer.mouseX, pointer.mouseY);
  if (!clicked) {
    interactionPanelEl.hidden = true;
    game.selectedInteractionTarget = null;
    return;
  }
  if (distance(player, clicked) > 5.5) {
    announce('💬 Move closer to chat with that person.');
    return;
  }
  openInteractionPanelFor(clicked);
}

// -----------------------------------------------------------------------------
// Main loop
// -----------------------------------------------------------------------------
let last = performance.now();
function loop(now) {
  const dt = Math.min(32, now - last);
  last = now;

  if (!game.paused) {
    updateBellRingSfx(now);
    handleInput(dt);

    if (!game.autoMode) game.idleMs += dt;
    if (!game.autoMode && game.idleMs > 8000) {
      game.autoMode = true;
      updateAutoStatus();
      announce('🤖 Auto mode enabled (idle detected).');
      updateTodo();
    }

    moveEntityWithCollision(player, player.vx * dt * 0.011, player.vy * dt * 0.011);
    constrain(player);
    recoverPlayerIfWallStuck(dt);

    // Update animation time for all entities so movement reads like retro sprites.
    for (const entity of game.entities) {
      if (!hasArrivedForCurrentPeriod(entity)) continue;
      const moveMagnitude = Math.abs(entity.vx) + Math.abs(entity.vy);
      // Keep walk cycle readable: slightly slower leg animation while movement speed is higher.
      entity.animPhase += dt * (0.0027 + moveMagnitude * 0.0042);
    }

    updateAI(dt);
    updateCollectables(now);
    updateWeatherFx(dt);
    updateBoardWriting(dt);
    updatePellets(dt);
    scheduleWeeklySickEvent();
    updateMedicalSystem();
    updateJanitorSystems(dt);
    updateSchedule(dt);
    checkSchoolExit();
    updateBladder(dt);
    maybeShameEric(now);
    updateHygieneSocialAura(now);
    if (game.headmasterDetentionUntil > 0 && now >= game.headmasterDetentionUntil && !game.headmasterDismissAnnounced) {
      game.headmasterDismissAnnounced = true;
      game.headmasterDetentionUntil = 0;
      announce('🧑‍🏫 Headmaster: "Now get out of my sight and back to class!"', { force: true });
    }
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

if (filterActionsEl) {
  filterActionsEl.addEventListener('change', () => {
    game.eventFilters.action = filterActionsEl.checked;
    renderEventFeed();
  });
}
if (filterSpeechEl) {
  filterSpeechEl.addEventListener('change', () => {
    game.eventFilters.speech = filterSpeechEl.checked;
    renderEventFeed();
  });
}
if (filterThoughtsEl) {
  filterThoughtsEl.addEventListener('change', () => {
    game.eventFilters.thought = filterThoughtsEl.checked;
    renderEventFeed();
  });
}
if (filterWorldEl) {
  filterWorldEl.addEventListener('change', () => {
    game.eventFilters.world = filterWorldEl.checked;
    renderEventFeed();
  });
}

toggleNamesBtn.onclick = () => {
  game.showNpcNames = !game.showNpcNames;
  updateNameToggleButton();
};

canvas.addEventListener('mousemove', updateEntityTooltip);
canvas.addEventListener('mouseleave', hideEntityTooltip);
canvas.addEventListener('click', onCanvasClick);
closeInteractionPanelBtn.onclick = () => {
  interactionPanelEl.hidden = true;
  game.selectedInteractionTarget = null;
};

function startGameFromSplash() {
  applyStartupOptions();
  if (startOverlayEl) startOverlayEl.hidden = true;
  assignDailyDutyTeacher();
  announce('Welcome! Follow bells, survive staff, and uncover every shield letter.');
  if (llmModeEnabled()) {
    primeLlmSessionContext();
    announce(`🤖 LLM mode active via ${llmProviderLabel()}. Dialogue cache warming in background.`, { force: true, feedType: 'world' });
  }
  if (game.dutyTeacherName) {
    announce(`🧑‍🏫 Break duty today: ${game.dutyTeacherName} patrols the field and classrooms.`, { force: true });
  }
  updateMission();
  updateAutoStatus();
  updateCharismaHud();
  updateBladderHud();
  updateHygieneHud();
  updateWeatherHud();
  updateTodo();
  updateNameToggleButton();
  renderEventFeed();
  requestAnimationFrame(loop);
}


if (llmDebugClearBtn) {
  llmDebugClearBtn.addEventListener('click', () => {
    game.llm.debugLog = [];
    renderLlmDebugLog();
    pushLlmDebug('🧹 LLM debug log cleared by player.');
  });
}

if (startGameBtn) startGameBtn.addEventListener('click', startGameFromSplash);

if (optLlmEnabledEl) {
  optLlmEnabledEl.checked = game.llm.enabled;
  optLlmEnabledEl.addEventListener('change', () => {
    game.llm.enabled = Boolean(optLlmEnabledEl.checked);
    applyLlmUiState();
    persistLlmSettings();
    setLlmStatus(game.llm.enabled
      ? (game.llm.noFallback
        ? '🤖 LLM mode enabled (no fallback). NPC dialogue waits for model replies.'
        : '🤖 LLM mode enabled. First lines may use fallback text while cache warms up.')
      : 'ℹ️ LLM mode disabled. Using original built-in text.');
    if (game.llm.enabled) {
      pushLlmDebug(`🟢 LLM enabled with ${llmProviderLabel()}.`);
      primeLlmSessionContext();
    } else {
      pushLlmDebug('⚪ LLM disabled; deterministic fallback text active.', 'warn');
    }
  });
}

if (optLlmNsfwEl) {
  optLlmNsfwEl.checked = Boolean(game.llm.nsfw);
  optLlmNsfwEl.addEventListener('change', () => {
    // Cache is prompt-dependent; clear so new tone takes effect immediately.
    game.llm.nsfw = Boolean(optLlmNsfwEl.checked);
    game.llm.cache.clear();
    persistLlmSettings();
    setLlmStatus(game.llm.nsfw
      ? '🔞 NSFW prompt style enabled for local AI responses.'
      : '🧼 NSFW prompt style disabled. Using classroom-safe tone guidance.');
  });
}


if (optLlmNoFallbackEl) {
  optLlmNoFallbackEl.checked = Boolean(game.llm.noFallback);
  optLlmNoFallbackEl.addEventListener('change', () => {
    // No-fallback mode uses deferred LLM delivery so we clear cache to avoid mixed behaviour.
    game.llm.noFallback = Boolean(optLlmNoFallbackEl.checked);
    game.llm.cache.clear();
    persistLlmSettings();
    setLlmStatus(game.llm.noFallback
      ? '🧵 No-fallback mode enabled. Dialogue waits for LLM replies.'
      : '🧩 Fallback mode enabled. Built-in lines are used when cache misses.');
  });
}

if (optLlmSourceEl) {
  optLlmSourceEl.value = game.llm.source;
  optLlmSourceEl.addEventListener('change', () => {
    game.llm.source = optLlmSourceEl.value === 'remote' ? 'remote' : 'local';
    game.llm.cache.clear();
    game.llm.sessionPrimedForProvider = '';
    applyLlmUiState();
    persistLlmSettings();
    setLlmStatus(`🧭 LLM source set to ${game.llm.source}. Cache refreshed.`);
  });
}

if (optLlmModelEl) {
  if (game.llm.selectedModel) optLlmModelEl.value = game.llm.selectedModel;
  optLlmModelEl.addEventListener('change', () => {
    const selected = String(optLlmModelEl.value || '').trim();
    if (selected && selected !== game.llm.selectedModel) {
      game.llm.selectedModel = selected;
      if (optLlmManualModelEl && !optLlmManualModelEl.value.trim()) {
        optLlmManualModelEl.value = selected;
      }
      if (!game.llm.manualModelName) game.llm.manualModelName = selected;
      game.llm.cache.clear();
      game.llm.sessionPrimedForProvider = '';
      persistLlmSettings();
      setLlmStatus(`✅ Local model set to ${selected}. Cache reset for fresh responses.`);
    }
  });
}

if (optLlmLocalEndpointEl) {
  optLlmLocalEndpointEl.value = game.llm.localEndpoint;
  optLlmLocalEndpointEl.addEventListener('change', () => {
    game.llm.localEndpoint = normalizeLocalEndpoint(optLlmLocalEndpointEl.value || game.llm.localEndpoint);
    optLlmLocalEndpointEl.value = game.llm.localEndpoint;
    game.llm.cache.clear();
    game.llm.sessionPrimedForProvider = '';
    persistLlmSettings();
    setLlmStatus(`🔌 Local endpoint set to ${game.llm.localEndpoint}. Use refresh to load models.`);
  });
}

if (optLlmManualModelEl) {
  optLlmManualModelEl.value = game.llm.manualModelName || game.llm.selectedModel || '';
  optLlmManualModelEl.addEventListener('change', () => {
    const typed = sanitizeLlmLine(optLlmManualModelEl.value || '', '');
    game.llm.manualModelName = typed;
    if (typed && !game.llm.availableModels.includes(typed)) {
      game.llm.availableModels = [typed, ...game.llm.availableModels];
      updateLlmModelSelect(game.llm.availableModels);
    }
    if (typed) game.llm.selectedModel = typed;
    game.llm.cache.clear();
    game.llm.sessionPrimedForProvider = '';
    persistLlmSettings();
    setLlmStatus(typed
      ? `⌨️ Manual Ollama model set to ${typed}.`
      : 'ℹ️ Manual model cleared. Dropdown selection will be used.');
  });
}

if (optLlmRemoteProviderEl) {
  optLlmRemoteProviderEl.value = game.llm.remoteProvider;
  optLlmRemoteProviderEl.addEventListener('change', () => {
    game.llm.remoteProvider = optLlmRemoteProviderEl.value === 'grok' ? 'grok' : 'openai';
    if (optLlmRemoteModelEl && !optLlmRemoteModelEl.value.trim()) {
      optLlmRemoteModelEl.value = game.llm.remoteProvider === 'grok' ? 'grok-2-latest' : 'gpt-4.1-mini';
    }
    game.llm.remoteModel = String(optLlmRemoteModelEl?.value || '').trim() || (game.llm.remoteProvider === 'grok' ? 'grok-2-latest' : 'gpt-4.1-mini');
    game.llm.cache.clear();
    game.llm.sessionPrimedForProvider = '';
    applyLlmUiState();
    persistLlmSettings();
    setLlmStatus(`☁️ Remote provider set to ${game.llm.remoteProvider.toUpperCase()}.`);
  });
}

if (optLlmRemoteModelEl) {
  optLlmRemoteModelEl.value = game.llm.remoteModel || 'gpt-4.1-mini';
  optLlmRemoteModelEl.addEventListener('change', () => {
    game.llm.remoteModel = String(optLlmRemoteModelEl.value || '').trim();
    game.llm.cache.clear();
    game.llm.sessionPrimedForProvider = '';
    persistLlmSettings();
    setLlmStatus(`🧾 Remote model set to ${game.llm.remoteModel || 'default'}.`);
  });
}

if (optLlmRemoteTokenEl) {
  optLlmRemoteTokenEl.value = game.llm.remoteToken;
  optLlmRemoteTokenEl.addEventListener('change', () => {
    game.llm.remoteToken = String(optLlmRemoteTokenEl.value || '').trim();
    game.llm.cache.clear();
    game.llm.sessionPrimedForProvider = '';
    updateLlmTokenUi();
    persistLlmSettings();
    setLlmStatus('🔐 Remote token updated and saved in this browser.');
  });
}

if (optLlmRefreshModelsEl) {
  optLlmRefreshModelsEl.addEventListener('click', () => refreshOllamaModels());
}

if (optLlmImportModelsEl) {
  optLlmImportModelsEl.addEventListener('click', importManualOllamaModels);
}

if (optLlmOpenAiAuthEl) {
  optLlmOpenAiAuthEl.addEventListener('click', startOpenAiOauth);
}

if (optLlmClearTokenEl) {
  optLlmClearTokenEl.addEventListener('click', () => {
    game.llm.remoteToken = '';
    if (optLlmRemoteTokenEl) optLlmRemoteTokenEl.value = '';
    game.llm.cache.clear();
    game.llm.sessionPrimedForProvider = '';
    updateLlmTokenUi();
    persistLlmSettings();
    setLlmStatus('🧹 Cleared saved remote token.');
  });
}

handleOpenAiOauthCallback();
if (Array.isArray(game.llm.manualModels) && game.llm.manualModels.length) {
  game.llm.availableModels = game.llm.manualModels.slice();
  updateLlmModelSelect(game.llm.availableModels);
}
if (optLlmManualModelEl) {
  optLlmManualModelEl.value = game.llm.manualModelName || game.llm.selectedModel || '';
}
applyLlmUiState();
refreshOllamaModels({ silent: true });

// Lightweight debug hooks help automated validation without changing gameplay UI.
window.__skoolDazeDebug = {
  getState: () => ({
    time: game.timeMinutes,
    period: schedule[game.periodIndex].period,
    targetRoom: schedule[game.periodIndex].room,
    playerRoom: entityRoom(player),
    playerSeated: player.isSeated,
    lines: game.lines,
    collectables: game.collectables.map((c) => ({ name: c.name, x: c.x, y: c.y })),
    // Teacher status is exposed for automated movement/seating validation.
    assignedTeacher: assignedTeacherForRoom(schedule[game.periodIndex].room),
    teachers: game.entities
      .filter((entity) => entity.role === 'teacher')
      .map((entity) => ({
        name: entity.name,
        room: entityRoom(entity),
        seated: entity.isSeated,
        seatedRoom: entity.seatedRoom,
        targetRoom: entity.target ? (roomAtPosition(entity.target)?.name || null) : null,
        targetX: entity.target ? Number(entity.target.x.toFixed(2)) : null,
        targetY: entity.target ? Number(entity.target.y.toFixed(2)) : null,
        x: Number(entity.x.toFixed(2)),
        y: Number(entity.y.toFixed(2)),
      })),
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
  // Test hook: place Eric directly for automated stuck-recovery checks.
  setPlayerPosition: (x, y) => {
    if (Number.isFinite(x) && Number.isFinite(y)) {
      player.x = x;
      player.y = y;
      player.vx = 0;
      player.vy = 0;
    }
  },
};
