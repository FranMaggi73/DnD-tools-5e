// src/components/app/DungeonMasterAppWrapper.js
import React, {
  useState,
  Suspense,
  lazy,
  useMemo,
} from 'react';
import { newBattleState } from '../../state/BattleManager';
import Loading from './Loading';

const SharedDungeonMasterApp = lazy(async () => {
  try {
    return await import('./SharedDungeonMasterApp');
  } catch {
    // Si lazy falla por alguna razón, exportamos un fallback mínimo
    // pero idealmente no debería pasar en dev.
    return { default: (props) => <div>Unable to load shared DM app</div> };
  }
});

export default function DungeonMasterAppWrapper() {
  const initialState = useMemo(() => (newBattleState()), []);
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
