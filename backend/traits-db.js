/*
  Simple backend-style trait database loaded before game.js.
  This keeps balancing data separate from gameplay code so traits can be tuned centrally.
*/
window.TRAIT_BACKEND_DB = {
  version: 'v1.0',
  traitKeys: [
    'aggression', 'funny', 'friendly', 'mood', 'wit', 'intelligence', 'speed', 'skill', 'luck',
    'bladderSize', 'boneStrength', 'immuneSystem', 'intelect', 'wisdom', 'honor', 'strength',
    'sadism', 'masochism', 'discipline',
  ],
  weightClasses: ['overweight', 'slim', 'skinny', 'normal', 'chubby', 'obese'],
  roleBias: {
    bully: { aggression: 24, strength: 14, sadism: 18, friendly: -12, honor: -14, discipline: -16 },
    swot: { intelligence: 20, wisdom: 15, funny: -4, aggression: -18, discipline: 20, honor: 12 },
    hero: { friendly: 15, honor: 14, wit: 8, aggression: -4, strength: 8 },
    weird: { funny: 16, luck: 10, mood: 12, discipline: -12, wit: 10 },
    teacher: { intelligence: 22, wisdom: 20, discipline: 26, honor: 14, aggression: 8, skill: 10 },
    janitor: { wisdom: 10, friendly: 8, discipline: 16, aggression: -8, bladderSize: 6 },
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
    };
  }),
};
