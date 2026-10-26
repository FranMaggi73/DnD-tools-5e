import {readResources,writeResources} from './resources';
import {recoverPools} from '$lib/rules/tablePlay';
import {logActivity} from './activity';
import { collection, deleteField, doc, getDocs, query, runTransaction, Timestamp, where, type Transaction } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { currentUser, encodeSkills, fromDoc, read } from './firestore';
import type { Character } from '$lib/types';
import { applyHealthAction, encodeRules, rest, normalizeHealth, type CharacterRules, type HealthAction } from '$lib/rules/2024';

export async function requireOutOfCombat(tx: Transaction, character: Character) {
  const campaign = await tx.get(doc(db, 'events', character.campaignId));
  const id = campaign.data()?.activeEncounterId;
  if (!id) return;
  const encounter = await tx.get(doc(db, 'encounters', id));
  let participating: boolean;
  if (encounter.data()?.publicVersion === 1) {
    participating = (encounter.data()?.characterIds || []).includes(character.id);
  } else {
    if (campaign.data()?.dmId !== currentUser().uid) throw new Error('El DM debe abrir Combate una vez para actualizar este encuentro.');
    const fighters = await getDocs(query(collection(db, 'combatants'), where('encounterId', '==', id)));
    participating = fighters.docs.some(entry => entry.data().characterId === character.id);
  }
  if (participating) {
    throw new Error('El personaje está en combate. Gestioná su estado desde Combate; para editar la ficha o descansar, retiralo del encuentro o finalizalo.');
  }
}
function healthFields(character: Character) {
  const { currentHp, temporaryHp, deathSaves, conditions, rules } = normalizeHealth(character);
  return { currentHp, temporaryHp, deathSaves, conditions, rules: encodeRules(rules), skillRanks: encodeSkills(character.skills), skills: deleteField(), updatedAt: Timestamp.now() };
}
export const characterStateApi = {
  async applyCharacterHealth(id: string, action: HealthAction) {
    await runTransaction(db, async tx => {
      const ref = doc(db, 'characters', id);
      const character = fromDoc<Character>(await tx.get(ref));
      await requireOutOfCombat(tx, character);
      const next=applyHealthAction(character,action);
      tx.update(ref, healthFields({ ...character, ...next }));
      logActivity(tx,character.campaignId,`${character.name}: vida ${character.currentHp} → ${next.currentHp}; temporales ${next.temporaryHp}.`);
    });
    return read<Character>('characters', id);
  },
  async updateCharacterRules(id: string, fields: Partial<Pick<CharacterRules, 'hitDieSize' | 'resistances' | 'vulnerabilities' | 'immunities'>>) {
    await runTransaction(db, async tx => {
      const ref = doc(db, 'characters', id);
      const character = fromDoc<Character>(await tx.get(ref));
      await requireOutOfCombat(tx, character);
      tx.update(ref, healthFields({ ...character, rules: { ...character.rules, ...fields } }));
    });
    return read<Character>('characters', id);
  },
  async restCharacter(id: string, kind: 'short' | 'long', count = 0) {
    if (!Number.isInteger(count) || count < 0 || count > 20) throw new Error('Cantidad de dados inválida.');
    // Generate once, outside the retried callback, so a retry never rerolls the rest.
    const character = await read<Character>('characters', id);
    const rolls = kind === 'short' ? Array.from({ length: count }, () => Math.floor(Math.random() * character.rules.hitDieSize) + 1) : [];
    await runTransaction(db, async tx => {
      const ref = doc(db, 'characters', id);
      const latest = fromDoc<Character>(await tx.get(ref));
      if (latest.rules.hitDieSize !== character.rules.hitDieSize) throw new Error('Cambió el dado de golpe. Volvé a intentarlo.');
      await requireOutOfCombat(tx, latest);
      const resources = await readResources(tx,latest);
      const next = rest(latest, latest.level, latest.abilityScores.constitution, kind, rolls);
      tx.update(ref, healthFields({ ...latest, ...next }));
      writeResources(tx,latest,resources,recoverPools(resources.pools,kind));
      logActivity(tx,latest.campaignId,`${latest.name}: completó un descanso ${kind==='short'?'corto':'largo'}.`);
    });
    return { character: await read<Character>('characters', id), rolls };
  }
};
