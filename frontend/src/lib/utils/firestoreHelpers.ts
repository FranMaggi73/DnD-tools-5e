// frontend/src/lib/utils/firestoreHelpers.ts
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  type Query,
  type Unsubscribe,
  getDocs
} from 'firebase/firestore';
import { app } from '$lib/firebase';
import type { Character, Combatant, Note } from '$lib/types';

const db = getFirestore(app);

// ===========================
// HELPERS PARA PERSONAJES
// ===========================

/**
 * Listener en tiempo real para personajes de una campaña
 */
export function subscribeToCharacters(
  campaignId: string,
  onUpdate: (characters: Character[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const charactersRef = collection(db, 'characters');
  const charactersQuery = query(
    charactersRef,
    where('campaignId', '==', campaignId)
  );

  return onSnapshot(
    charactersQuery,
    (snapshot) => {
      const characters = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Character[];
      onUpdate(characters);
    },
    (error) => {
      console.error('Error en listener de personajes:', error);
      onError?.(error);
    }
  );
}

/**
 * Obtener personajes de una campaña (sin listener)
 */
export async function getCharacters(campaignId: string): Promise<Character[]> {
  const charactersRef = collection(db, 'characters');
  const charactersQuery = query(
    charactersRef,
    where('campaignId', '==', campaignId)
  );

  const snapshot = await getDocs(charactersQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Character[];
}

// ===========================
// HELPERS PARA COMBATIENTES
// ===========================

/**
 * Listener en tiempo real para combatientes de un encuentro
 */
export function subscribeToCombatants(
  encounterId: string,
  onUpdate: (combatants: Combatant[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const combatantsRef = collection(db, 'combatants');
  const combatantsQuery = query(
    combatantsRef,
    where('encounterId', '==', encounterId),
    orderBy('initiative', 'desc')
  );

  return onSnapshot(
    combatantsQuery,
    (snapshot) => {
      const combatants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Combatant[];
      onUpdate(combatants);
    },
    (error) => {
      console.error('Error en listener de combatientes:', error);
      onError?.(error);
    }
  );
}

// ===========================
// HELPERS PARA NOTAS
// ===========================

/**
 * Listener en tiempo real para notas de una campaña
 * Obtiene notas personales del usuario + notas compartidas
 */
export function subscribeToCampaignNotes(
  campaignId: string,
  userId: string,
  onUpdate: (notes: Note[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const notesRef = collection(db, 'notes');
  
  let personalNotes: Note[] = [];
  let sharedNotes: Note[] = [];
  let loadedPersonal = false;
  let loadedShared = false;
  
  // Query para notas personales
  const personalQuery = query(
    notesRef,
    where('campaignId', '==', campaignId),
    where('authorId', '==', userId),
    where('isShared', '==', false)
  );
  
  // Query para notas compartidas
  const sharedQuery = query(
    notesRef,
    where('campaignId', '==', campaignId),
    where('isShared', '==', true)
  );
  
  function combineNotes() {
    if (loadedPersonal && loadedShared) {
      const allNotes = [...personalNotes, ...sharedNotes];
      // Remover duplicados por ID
      const uniqueNotes = Array.from(
        new Map(allNotes.map(note => [note.id, note])).values()
      );
      
      // Ordenar por fecha de actualización (más reciente primero)
      uniqueNotes.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      onUpdate(uniqueNotes);
    }
  }
  
  const unsubPersonal = onSnapshot(
    personalQuery,
    (snapshot) => {
      personalNotes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Note;
      });
      
      loadedPersonal = true;
      combineNotes();
    },
    (error) => {
      console.error('Error en listener de notas personales:', error);
      onError?.(error);
    }
  );
  
  const unsubShared = onSnapshot(
    sharedQuery,
    (snapshot) => {
      sharedNotes = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as Note;
      });
      
      loadedShared = true;
      combineNotes();
    },
    (error) => {
      console.error('Error en listener de notas compartidas:', error);
      onError?.(error);
    }
  );
  
  // Retornar función que desuscribe ambos listeners
  return () => {
    unsubPersonal();
    unsubShared();
  };
}

// ===========================
// HELPER GENÉRICO
// ===========================

/**
 * Helper genérico para crear listeners con manejo de errores
 */
export function createRealtimeListener<T>(
  queryFn: () => Query,
  transform: (doc: any) => T,
  onUpdate: (data: T[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = queryFn();
  
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map(doc => transform({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(data);
    },
    (error) => {
      console.error('Error en listener:', error);
      onError?.(error);
    }
  );
}