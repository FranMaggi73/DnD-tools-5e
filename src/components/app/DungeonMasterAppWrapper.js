import React, {
  useState,
  Suspense,
  lazy,
  useMemo,
} from 'react';
import DungeonMasterApp from './DungeonMasterApp';
import {
  newBattleState,
} from '../../state/BattleManager';
import Loading from './Loading';

const SharedDungeonMasterApp = lazy(async () => {
  try {
    return await import('./SharedDungeonMasterApp');
  } catch {
    return { default: DungeonMasterApp };
  }
});

export default function DungeonMasterAppWrapper() {
  const initialState = useMemo(() => (newBattleState()), []);
  const [state, setState] = useState(initialState);

  return (
    <DungeonMasterApp
      shareBattle={(sharedState) => sharedState}
      state={state}
      setState={setState}
    />
  );
}
