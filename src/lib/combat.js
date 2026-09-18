export function normalizeActor(actor) {
  return {
    id: actor.id,
    name: actor.name,
    type: actor.type ?? 'npc',
    initiative: Number(actor.initiative ?? 0),
    hp: Number(actor.hp ?? 0),
    maxHp: Number(actor.maxHp ?? actor.hp ?? 0),
    ac: Number(actor.ac ?? 10),
    x: actor.x ?? 0,
    y: actor.y ?? 0,
    token: actor.token ?? 'circle',
  };
}

export function sortInitiative(actors) {
  return [...actors].sort((a, b) => b.initiative - a.initiative || a.name.localeCompare(b.name));
}

export function createCombatState(initialState = {}) {
  const initiativeOrder = sortInitiative((initialState.initiativeOrder ?? []).map(normalizeActor));
  return {
    round: Number(initialState.round ?? 1),
    currentIndex: Number(initialState.currentIndex ?? 0),
    initiativeOrder,
    turnCount: Number(initialState.turnCount ?? 0),
  };
}

export function createEncounter(actors) {
  const state = createCombatState({
    initiativeOrder: actors,
    round: 1,
    currentIndex: 0,
  });
  return state;
}

export function getCurrentActor(state) {
  const actors = state.initiativeOrder ?? [];
  if (!actors.length) return null;
  const current = actors[state.currentIndex % actors.length];
  return current?.name ?? null;
}

export function applyHpDelta(state, actorId, delta) {
  const initiativeOrder = state.initiativeOrder.map((actor) => {
    if (actor.id !== actorId) return actor;
    return {
      ...actor,
      hp: Math.max(0, Math.min(actor.maxHp, actor.hp + delta)),
    };
  });

  return {
    ...state,
    initiativeOrder,
  };
}

export function advanceTurn(state) {
  const actors = state.initiativeOrder ?? [];
  if (!actors.length) {
    return { ...state, currentIndex: 0 };
  }

  const nextIndex = (state.currentIndex + 1) % actors.length;
  const nextRound = nextIndex === 0 ? state.round + 1 : state.round;

  return {
    ...state,
    currentIndex: nextIndex,
    round: nextRound,
    turnCount: state.turnCount + 1,
  };
}
