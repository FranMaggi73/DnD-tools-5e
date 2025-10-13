import React, { useEffect, useState, useRef } from 'react';
import { saveBattle, generateBattleId } from '../../firebase/BattleManager';
import DungeonMasterApp from './DungeonMasterApp';

export default function SharedDungeonMasterApp({ state, setState }) {
  const [error, setError] = useState(null);
  const stateRef = useRef(state);

  // Mantener la referencia al state actual para usar dentro de async
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Un único effect que se encarga de crear localmente el battleId y
  // luego sincronizarlo con Firebase (sin race).
  useEffect(() => {
    if (!state?.shareEnabled || !state?.battleId) return;

    const saveLater = async () => {
      try {
        await saveBattle(state.battleId, {
          battleId: state.battleId,
          round: state.round,
          creatures: state.creatures,
          activeCreature: state.activeCreature,
          timestamp: Date.now(),
        });
        // opcional: console.log('auto-saved', state.battleId);
      } catch (err) {
        console.error('Auto-save error:', err);
      }
    };

    const id = setTimeout(saveLater, 1000); // debounce 1s
    return () => clearTimeout(id);
  }, [state.round, state.creatures, state.activeCreature, state.shareEnabled, state.battleId]);

  // DEBUG: Estado en cada render
  console.log('SharedDungeonMasterApp render state.battleId =', state.battleId);

  return (
    <DungeonMasterApp
      state={state}
      setState={setState}
      shareBattle={async (s) => {
        // wrapper ligero por compatibilidad con la interfaz anterior
        const id = s.battleId || generateBattleId();
        const toSave = {
          battleId: id,
          round: s.round,
          creatures: s.creatures,
          activeCreature: s.activeCreature,
          timestamp: Date.now(),
        };
        try {
          await saveBattle(id, toSave);
          return { ...s, battleId: id, shareEnabled: true };
        } catch (err) {
          console.error('shareBattle wrapper error:', err);
          return s;
        }
      }}
      onlineError={error}
    />
  );
}
