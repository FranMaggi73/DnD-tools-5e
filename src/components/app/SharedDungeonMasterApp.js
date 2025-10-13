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

      // Generar link público
      const battleLink = `https://dnd5etools.netlify.app/battle/${battleId}`;

      const newState = {
        ...shareState,
        battleId,
        shareEnabled: true,
        battleLink
      };

      // IMPORTANTE: actualizamos el estado global para que el UI muestre el link
      setState(newState);

      // Log para debug rápido
      console.log('Shared battle created:', battleId, 'link:', battleLink);

      return newState;
    } catch (err) {
      console.error('Error sharing battle:', err);
      setError(err);
      return shareState;
    }
  };

  // Si shareEnabled o battleId cambian, aseguramos que haya link guardado
  useEffect(() => {
    if (state.shareEnabled && state.battleId && !state.battleLink) {
      shareBattle(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.shareEnabled, state.battleId]);

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
