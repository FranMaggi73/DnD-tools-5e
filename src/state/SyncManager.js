// syncmanager.js
import { saveBattle, generateBattleId } from '../firebase/BattleManager';

export async function share(state) {
  const { battleId } = state;

  // Generar ID si no existe
  const id = battleId || generateBattleId();

  const battleData = {
    battleId: id,
    round: state.round,
    creatures: state.creatures,
    activeCreature: state.activeCreature,
    timestamp: Date.now()
  };

  try {
    // Guardar en Firebase
    await saveBattle(id, battleData);

    // Generar link público
    const battleLink = `https://dnd5etools.netlify.app/battle/${id}`;

    return {
      ...state,
      battleId: id,
      shareEnabled: true,
      battleLink
    };
  } catch (error) {
    console.error('Error saving battle to Firebase:', error);
    return {
      ...state,
      errors: [...(state.errors || []), 'Error sharing battle. Please try again.']
    };
  }
}

export function handleShareError(state, error) {
  if (error) {
    return {
      ...state,
      errors: [...(state.errors || []), 'Error sharing battle. Please check your connection.']
    };
  }
  return state;
}
