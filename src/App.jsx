import { useMemo, useState } from 'react';
import { advanceTurn, applyHpDelta, createEncounter, getCurrentActor } from './lib/combat';
import { generateDmSummary } from './lib/aiDm';

const initialActors = [
  { id: 'pc-1', name: 'Aria', type: 'pc', initiative: 15, hp: 18, maxHp: 18, ac: 16, x: 120, y: 180, token: 'circle' },
  { id: 'pc-2', name: 'Bram', type: 'pc', initiative: 18, hp: 14, maxHp: 14, ac: 15, x: 220, y: 240, token: 'square' },
  { id: 'monster-1', name: 'Goblin', type: 'npc', initiative: 12, hp: 8, maxHp: 8, ac: 13, x: 420, y: 180, token: 'diamond' },
  { id: 'monster-2', name: 'Skeleton', type: 'npc', initiative: 9, hp: 11, maxHp: 11, ac: 12, x: 500, y: 260, token: 'triangle' },
];

const tokenStyles = {
  circle: { borderRadius: '999px' },
  square: { borderRadius: '8px' },
  diamond: { transform: 'rotate(45deg)', borderRadius: '8px' },
  triangle: { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius: 0 },
};

export default function App() {
  const [encounter, setEncounter] = useState(() => createEncounter(initialActors));
  const [draggedId, setDraggedId] = useState(null);

  const currentActorName = getCurrentActor(encounter);
  const dmSummary = useMemo(() => generateDmSummary(encounter), [encounter]);

  const currentActor = useMemo(
    () => encounter.initiativeOrder.find((actor) => actor.name === currentActorName) ?? encounter.initiativeOrder[0],
    [encounter, currentActorName]
  );

  const handleTurnAdvance = () => {
    setEncounter((prev) => advanceTurn(prev));
  };

  const handleHpChange = (actorId, delta) => {
    setEncounter((prev) => applyHpDelta(prev, actorId, delta));
  };

  const handleTokenDrag = (actorId, event) => {
    if (!event || !event.currentTarget?.parentElement) return;
    const board = event.currentTarget.parentElement;
    const rect = board.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left - 22, 0), rect.width - 44);
    const y = Math.min(Math.max(event.clientY - rect.top - 22, 0), rect.height - 44);

    setEncounter((prev) => ({
      ...prev,
      initiativeOrder: prev.initiativeOrder.map((actor) =>
        actor.id === actorId ? { ...actor, x, y } : actor
      ),
    }));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Party Table</h1>
        <div className="turn-panel">
          <span className="label">Round</span>
          <strong>{encounter.round}</strong>
        </div>
        <div className="turn-panel">
          <span className="label">Current turn</span>
          <strong>{currentActorName ?? 'No actors'}</strong>
        </div>
        {currentActor && (
          <div className="turn-panel current">
            <span className="label">Initiative</span>
            <strong>{currentActor.initiative}</strong>
          </div>
        )}

        <button className="primary" onClick={handleTurnAdvance}>Next turn</button>

        <div className="actor-list">
          {encounter.initiativeOrder.map((actor, index) => (
            <div
              key={actor.id}
              className={`actor-card ${index === encounter.currentIndex ? 'active' : ''}`}
            >
              <div>
                <strong>{actor.name}</strong>
                <div className="meta">{actor.type.toUpperCase()} • Init {actor.initiative}</div>
              </div>
              <div className="hp-row">
                <button onClick={() => handleHpChange(actor.id, -1)}>-</button>
                <span>{actor.hp}/{actor.maxHp} HP</span>
                <button onClick={() => handleHpChange(actor.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="battle-map-panel">
        <div className="dm-panel">
          <div>
            <span className="label">AI DM</span>
            <h2>{dmSummary.title}</h2>
          </div>
          <p>{dmSummary.narration}</p>
          <div className="action-row">
            {dmSummary.actions.map((action) => (
              <span key={action} className="action-pill">{action}</span>
            ))}
          </div>
        </div>

        <div className="battle-board">
          {encounter.initiativeOrder.map((actor) => (
            <div
              key={actor.id}
              draggable
              onDragStart={(event) => {
                setDraggedId(actor.id);
                event.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedId) {
                  handleTokenDrag(actor.id, event);
                }
              }}
              onDrag={(event) => handleTokenDrag(actor.id, event)}
              className="token"
              style={{
                left: actor.x,
                top: actor.y,
                background: actor.type === 'pc' ? '#7dd3fc' : '#fca5a5',
                ...tokenStyles[actor.token],
              }}
              title={`${actor.name} (${actor.hp}/${actor.maxHp} HP)`}
            >
              <span>{actor.name[0]}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
