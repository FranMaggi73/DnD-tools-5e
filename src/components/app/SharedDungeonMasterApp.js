import React, { useEffect, useState } from 'react';
import { saveBattle, generateBattleId } from '../../firebase/BattleManager';
import DungeonMasterApp from './DungeonMasterApp';

export default function SharedDungeonMasterApp({ state, setState }) {
  const [error, setError] = useState(null);

  const shareBattle = async (shareState) => {
    try {
      // Generar ID si no existe
      const battleId = shareState.battleId || generateBattleId();

      // Preparar datos
      const battleData = {
        battleId,
        round: shareState.round,
        creatures: shareState.creatures,
        activeCreature: shareState.activeCreature,
        timestamp: Date.now()
      };

      // Guardar en Firebase
      await saveBattle(battleId, battleData);

      return {
        ...shareState,
        battleId,
        shareEnabled: true
      };
    } catch (err) {
      console.error('Error sharing battle:', err);
      setError(err);
      return shareState;
    }
  };

  // Inicializar batalla compartida
  useEffect(() => {
    if (state.shareEnabled && state.battleId) {
      shareBattle(state);
    }
  }, []);

  // Auto-guardar cuando cambian datos importantes
  useEffect(() => {
    if (state.shareEnabled && state.battleId) {
      const saveData = async () => {
        try {
          await saveBattle(state.battleId, {
            battleId: state.battleId,
            round: state.round,
            creatures: state.creatures,
            activeCreature: state.activeCreature,
            timestamp: Date.now(),
          });
        } catch (err) {
          console.error('Error auto-saving:', err);
        }
      };

      // Debounce para evitar demasiadas escrituras
      const timeoutId = setTimeout(saveData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [state.round, state.creatures, state.activeCreature, state.shareEnabled, state.battleId]);

  return (
    <DungeonMasterApp
      state={state}
      setState={setState}
      shareBattle={shareBattle}
      onlineError={error}
    />
  );
}
