import React, { useState, useMemo, Suspense, lazy } from 'react';
import { newBattleState } from '../../state/BattleManager';
import Loading from './Loading';

const SharedDungeonMasterApp = lazy(() => import('./SharedDungeonMasterApp'));

export default function DungeonMasterAppWrapper() {
  const initialState = useMemo(() => newBattleState(), []);
  const [state, setState] = useState(initialState);

  return (
    <Suspense fallback={<Loading />}>
      <SharedDungeonMasterApp
        state={state}
        setState={setState}
      />
    </Suspense>
  );
}
