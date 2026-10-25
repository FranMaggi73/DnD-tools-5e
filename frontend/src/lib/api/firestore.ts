import {normalizeBuild} from '$lib/rules/characterBuilder';
import {
  collection, doc, getDoc, getDocs, query, where, Timestamp,
  type DocumentSnapshot, type QueryConstraint, type Transaction
} from 'firebase/firestore';
import { auth, db } from '$lib/firebase';
import { normalizeRules, CONDITION_NAMES } from '$lib/rules/2024';
import { DND_SKILLS } from '$lib/types';

export function currentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error('Iniciá sesión para continuar.');
  return user;
}

// Keep the UI contract (ISO strings), including data received by realtime listeners.
export function normalize(value: any): any {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalize(entry)]));
  }
  return value;
}

export function fromDoc<T>(snapshot: DocumentSnapshot): T {
  if (!snapshot.exists()) throw new Error('El registro no existe o fue eliminado.');
  const data = { ...normalize(snapshot.data()), id: snapshot.id };
  if ('currentHp' in data && 'deathSaves' in data) {
    data.rules = normalizeRules(data);
    data.conditions = (Array.isArray(data.conditions) ? data.conditions : []).filter((name: any) => CONDITION_NAMES.includes(name));
  }
  if ('abilityScores' in data) {
    data.build = normalizeBuild(data.buildJson);
    if(!data.buildJson)data.build.hitDie=data.rules?.hitDieSize||8;
    data.skills = DND_SKILLS.map(def => {
      const saved = data.skillRanks ? { proficient: data.skillRanks[def.name] >= 1, expertise: data.skillRanks[def.name] === 2 } :
        (Array.isArray(data.skills) ? data.skills : []).find((entry: any) => entry?.name === def.name);
      return { name: def.name, ability: def.ability, proficient: saved?.proficient === true, expertise: saved?.proficient === true && saved?.expertise === true };
    });
  }
  return data as T;
}
export function encodeSkills(skills: import('$lib/types').Skill[]) {
  return Object.fromEntries(DND_SKILLS.map(def => {
    const skill = skills.find(entry => entry.name === def.name);
    return [def.name, skill?.proficient ? skill.expertise ? 2 : 1 : 0];
  }));
}

export async function read<T>(name: string, id: string): Promise<T> {
  currentUser();
  return fromDoc<T>(await getDoc(doc(db, name, id)));
}

export async function list<T>(name: string, ...constraints: QueryConstraint[]): Promise<T[]> {
  currentUser();
  const snapshot = await getDocs(query(collection(db, name), ...constraints));
  return snapshot.docs.map(entry => fromDoc<T>(entry));
}

export function memberRef(campaignId: string, uid = currentUser().uid) {
  return doc(db, 'event_members', `${uid}_${campaignId}`);
}

export function memberData(campaignId: string, extra: Record<string, unknown> = {}) {
  const user = currentUser();
  return {
    campaignId, userId: user.uid, role: 'player', userName: user.displayName || 'Aventurero',
    userPhoto: user.photoURL || '', joinedAt: Timestamp.now(), ...extra
  };
}

export async function ownedCharacter(tx: Transaction, id: string) {
  const snapshot = await tx.get(doc(db, 'characters', id));
  const character = fromDoc<any>(snapshot);
  if (character.userId !== currentUser().uid) {
    const campaign = fromDoc<any>(await tx.get(doc(db, 'events', character.campaignId)));
    if (campaign.dmId !== currentUser().uid) throw new Error('Solo el dueño o el DM pueden editar.');
  }
  return character;
}

export { where };
