import { ref, set, onValue, remove, update, off } from 'firebase/database';
import { database } from './config';

export async function saveBattle(battleId, battleData) {
  const battleRef = ref(database, `battles/${battleId}`);
  await set(battleRef, {
    ...battleData,
    timestamp: Date.now()
  });
  return battleId;
}

export function subscribeToBattle(battleId, callback) {
  const battleRef = ref(database, `battles/${battleId}`);
  
  onValue(battleRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    }
  });
  
  return () => off(battleRef);
}

export async function deleteBattle(battleId) {
  const battleRef = ref(database, `battles/${battleId}`);
  await remove(battleRef);
}

export async function updateBattle(battleId, updates) {
  const battleRef = ref(database, `battles/${battleId}`);
  await update(battleRef, {
    ...updates,
    timestamp: Date.now()
  });
}

export function generateBattleId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}