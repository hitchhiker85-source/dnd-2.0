import { describe, expect, it } from 'vitest';
import {
  createCombatState,
  getCurrentActor,
  applyHpDelta,
  sortInitiative,
  advanceTurn,
  createEncounter,
} from './combat';

describe('combat logic', () => {
  it('creates an encounter with initiative sorted and round zero', () => {
    const state = createEncounter([
      { id: 'pc-1', name: 'Aria', type: 'pc', initiative: 15, hp: 18, maxHp: 18, ac: 16 },
      { id: 'monster-1', name: 'Goblin', type: 'npc', initiative: 12, hp: 8, maxHp: 8, ac: 13 },
      { id: 'pc-2', name: 'Bram', type: 'pc', initiative: 18, hp: 14, maxHp: 14, ac: 15 },
    ]);

    expect(state.round).toBe(1);
    expect(state.initiativeOrder.map((actor) => actor.name)).toEqual(['Bram', 'Aria', 'Goblin']);
    expect(getCurrentActor(state)).toEqual('Bram');
  });

  it('applies hp changes and advances the turn correctly', () => {
    const state = createCombatState({
      round: 1,
      currentIndex: 0,
      initiativeOrder: [
        { id: 'pc-1', name: 'Aria', type: 'pc', initiative: 15, hp: 12, maxHp: 18, ac: 16 },
        { id: 'monster-1', name: 'Goblin', type: 'npc', initiative: 12, hp: 8, maxHp: 8, ac: 13 },
      ],
    });

    const afterDamage = applyHpDelta(state, 'monster-1', -3);
    expect(afterDamage.initiativeOrder[1].hp).toBe(5);

    const next = advanceTurn(afterDamage);
    expect(next.currentIndex).toBe(1);
    expect(next.round).toBe(1);
  });

  it('sorts initiative values and keeps the highest value first', () => {
    const state = createCombatState({
      initiativeOrder: [
        { id: 'pc-1', name: 'Aria', type: 'pc', initiative: 10, hp: 12, maxHp: 18, ac: 16 },
        { id: 'pc-2', name: 'Bram', type: 'pc', initiative: 18, hp: 14, maxHp: 14, ac: 15 },
        { id: 'pc-3', name: 'Vera', type: 'pc', initiative: 14, hp: 10, maxHp: 10, ac: 12 },
      ],
    });

    const sorted = sortInitiative(state.initiativeOrder);
    expect(sorted.map((actor) => actor.name)).toEqual(['Bram', 'Vera', 'Aria']);
  });
});
