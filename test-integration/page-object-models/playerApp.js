/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { screen } from '@testing-library/react';
import DndBattleTracker from './dndBattleTracker';

export default class PlayerApp extends DndBattleTracker {
  static waitForOnline() {
    return screen.findByText('Player Session random-battle-id');
  }
}
