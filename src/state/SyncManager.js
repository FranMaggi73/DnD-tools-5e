import { saveBattle, generateBattleId } from '../firebase/BattleManager';

export async function share(state) {
  const { battleId } = state;
  
  // Generar ID si no existe
  const id = battleId || generateBattleId();
  
  // Preparar datos para Firebase
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
    
    return {
      ...state,
      battleId: id,
      shareEnabled: true
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