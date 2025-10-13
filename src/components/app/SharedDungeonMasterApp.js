import React, { useEffect, useState, useRef } from 'react';
import { saveBattle, generateBattleId } from '../../firebase/BattleManager';
import DungeonMasterApp from './DungeonMasterApp';

export default function SharedDungeonMasterApp({ state, setState }) {
  const [error, setError] = useState(null);
  const stateRef = useRef(state);

  // Mantener la referencia actualizada del state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Generar battleId automáticamente si shareEnabled está activo y no hay battleId
  useEffect(() => {
    if (!state.shareEnabled) return;

    if (!state.battleId) {
      const newId = generateBattleId();
      setState((prev) => ({ ...prev, battleId: newId }));
    }
  }, [state.shareEnabled, setState]);

  // Auto-guardar en Firebase cada vez que cambian datos importantes
  useEffect(() => {
    if (!state.shareEnabled || !state.battleId) return;

    const saveLater = async () => {
      try {
        await saveBattle(state.battleId, {
          battleId: state.battleId,
          round: state.round,
          creatures: state.creatures,
          activeCreature: state.activeCreature,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error('Auto-save error:', err);
        setError(err);
      }
    };

    const id = setTimeout(saveLater, 1000); // debounce 1s
    return () => clearTimeout(id);
  }, [state.round, state.creatures, state.activeCreature, state.shareEnabled, state.battleId]);

  // DEBUG: verificar battleId en cada render
  console.log('SharedDungeonMasterApp render state.battleId =', state.battleId);

  // Wrapper de shareBattle para compatibilidad con DungeonMasterApp
  const shareBattle = async (s) => {
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
      setError(err);
      return s;
    }
  };

  return (
    <DungeonMasterApp
      state={state}
      setState={setState}
      shareBattle={shareBattle}
      onlineError={error}
    />
  );
}
