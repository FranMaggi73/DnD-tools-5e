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
        timestamp: Date.now(),
      };

      // Guardar en Firebase
      await saveBattle(battleId, battleData);

      return {
        ...shareState,
        battleId,
        shareEnabled: true,
      };
    } catch (err) {
      console.error('Error sharing battle:', err);
      setError(err);
      return shareState;
    }
  };

  // Inicializar batalla compartida al activar share
  useEffect(() => {
    if (state.shareEnabled && !state.battleId) {
      // Primera vez que se activa share, crear battleId
      shareBattle(state).then((newState) => {
        if (newState.battleId !== state.battleId) {
          setState(newState);
        }
      });
    }
  }, [state.shareEnabled]);

  // Auto-guardar cuando cambian datos importantes
  useEffect(() => {
    if (state.shareEnabled && !state.battleId) {
      const localBattleId = generateBattleId();
      const updatedState = { ...state, battleId: localBattleId };

      // Setear inmediatamente para que el link aparezca en UI
      setState(updatedState);

      // Luego guardar en Firebase asincrónicamente
      shareBattle(updatedState)
        .then((savedState) => {
          // Asegurarse de aplicar el nuevo estado si hay cambios
          if (savedState.battleId !== state.battleId) {
            setState(savedState);
          }
        })
        .catch((err) => {
          console.error('Error while sharing battle:', err);
          setError(err);
        });
    }
    console.log('SharedDungeonMasterApp battleId:', state.battleId);
  }, [state.shareEnabled]);

  return (
    <DungeonMasterApp
      state={state}
      setState={setState}
      shareBattle={shareBattle}
      onlineError={error}
    />
  );
}
