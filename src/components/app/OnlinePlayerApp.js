import React, { useEffect, useState } from 'react';
import { subscribeToBattle } from '../../firebase/BattleManager';
import { newBattleState } from '../../state/BattleManager';
import PlayerApp from './PlayerApp';

export default function OnlinePlayerApp({ battleId, state, setState }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [battleData, setBattleData] = useState(newBattleState());

  useEffect(() => {
    let unsubscribe;

    try {
      // Suscribirse a cambios en tiempo real
      unsubscribe = subscribeToBattle(battleId, (data) => {
        console.log('Battle data updated:', data);
        setBattleData(data);
        setLoading(false);
      });
    } catch (err) {
      console.error('Error subscribing to battle:', err);
      setError(err);
      setLoading(false);
    }

    // Cleanup: desuscribirse al desmontar
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [battleId]);

  return (
    <PlayerApp
      battleId={battleId}
      getLoading={loading}
      syncLoading={false}
      getError={error}
      syncError={null}
      getData={{ getDndbattletracker: battleData }}
      syncData={null}
      state={state}
      setState={setState}
    />
  );
}
