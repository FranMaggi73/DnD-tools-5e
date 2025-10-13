import React, { useState } from 'react';
import OnlinePlayerApp from './OnlinePlayerApp';
import { newBattleState } from '../../state/BattleManager';

export default function PlayerAppWrapper({ battleId }) {
  const [state, setState] = useState(newBattleState());

  return (
    <OnlinePlayerApp
      battleId={battleId}
      state={state}
      setState={setState}
    />
  );
}