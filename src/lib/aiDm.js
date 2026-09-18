export function generateDmSummary(state) {
  if (!state?.initiativeOrder?.length) {
    return {
      title: 'No encounter active',
      narration: 'The party waits in silence. No enemies are in sight, and the room remains still.',
      actions: ['Take a breather', 'Scout ahead', 'Set the next objective'],
    };
  }

  const current = state.initiativeOrder[state.currentIndex % state.initiativeOrder.length];
  const allyCount = state.initiativeOrder.filter((actor) => actor.type === 'pc').length;
  const enemyCount = state.initiativeOrder.filter((actor) => actor.type !== 'pc').length;

  const dangerLevel = enemyCount > allyCount ? 'dire' : enemyCount === allyCount ? 'balanced' : 'favorable';
  const healthSummary = state.initiativeOrder
    .filter((actor) => actor.type === 'pc')
    .map((actor) => `${actor.name} ${actor.hp}/${actor.maxHp}`)
    .join(', ');

  const actionMap = {
    dire: ['Skulk behind cover', 'Use the environment', 'Call for a tactical retreat'],
    balanced: ['Press the attack', 'Use a group maneuver', 'Lean on the party healer'],
    favorable: ['Finish the weakened foe', 'Push the advantage', 'Hold the line for the next round'],
  };

  return {
    title: `${current.name}'s turn`,
    narration: `${current.name} acts with initiative ${current.initiative}. The encounter is ${dangerLevel}, and the party stands at ${healthSummary}. The room narrows as the next move sets the tone for the fight.`,
    actions: actionMap[dangerLevel] ?? actionMap.balanced,
  };
}
