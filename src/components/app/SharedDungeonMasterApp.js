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
    if (!state.shareEnabled) return;

    // Si ya hay battleId, no hace nada
    if (state.battleId) {
      console.log('SharedDungeonMasterApp: already has battleId', state.battleId);
      return;
    }

    // Generar ID localmente para mostrar link inmediatamente
    const localBattleId = generateBattleId();
    console.log('SharedDungeonMasterApp: generating localBattleId', localBattleId);

    // Mergear el nuevo battleId en el state (usar updater funcional para evitar stale state)
    setState((prev) => ({ ...(prev || {}), battleId: localBattleId, shareEnabled: true }));

    // Guardar en Firebase sin bloquear la UI
    (async () => {
      try {
        const s = stateRef.current || {};
        const battleData = {
          battleId: localBattleId,
          round: s.round,
          creatures: s.creatures,
          activeCreature: s.activeCreature,
          timestamp: Date.now(),
        };
        await saveBattle(localBattleId, battleData);

        // Asegurarnos de que el state remoto esté aplicado (merge)
        setState((prev) => ({ ...(prev || {}), battleId: localBattleId, shareEnabled: true }));
        console.log('SharedDungeonMasterApp: saved to Firebase', localBattleId);
      } catch (err) {
        console.error('SharedDungeonMasterApp: error saving to Firebase', err);
        setError(err);
      }
    })();
  }, [state.shareEnabled, setState]);

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
