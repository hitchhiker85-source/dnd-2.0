import { describe, expect, it } from 'vitest';
import { generateDmSummary } from './aiDm';

describe('AI DM summary', () => {
  it('produces a current-turn summary with initiative and danger level', () => {
    const summary = generateDmSummary({
      currentIndex: 1,
      initiativeOrder: [
        { id: 'pc-1', name: 'Aria', type: 'pc', initiative: 15, hp: 18, maxHp: 18 },
        { id: 'monster-1', name: 'Goblin', type: 'npc', initiative: 12, hp: 8, maxHp: 8 },
      ],
    });

    expect(summary.title).toContain('Goblin');
    expect(summary.narration).toContain('initiative 12');
    expect(summary.actions.length).toBeGreaterThan(0);
  });
});
