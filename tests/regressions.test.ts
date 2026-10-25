import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { assertFails, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, updateDoc, type Firestore } from 'firebase/firestore';
const state = vi.hoisted(() => ({ db: null as any, auth: { currentUser: null as any } }));
vi.mock('$lib/firebase', () => ({ get db() { return state.db; }, auth: state.auth }));
import { sparkApi as api } from '../frontend/src/lib/api/spark';
import { sparkInventory as inventory } from '../frontend/src/lib/api/sparkInventory';
import { createEmptyCharacterForm } from '../frontend/src/lib/types';

let env: RulesTestEnvironment;
function login(uid: string) {
  state.db = env.authenticatedContext(uid, { email: `${uid}@example.com`, email_verified: true }).firestore() as unknown as Firestore;
  state.auth.currentUser = { uid, email: `${uid}@example.com`, displayName: uid, photoURL: '' };
}
const form = () => ({ ...createEmptyCharacterForm(), name: 'Valiente' });
async function campaign() { login('dm'); return api.createCampaign({ name: 'Aventura' }); }
async function creature(id: string, name: string, initiative: number) {
  return api.addCombatant(id, { type: 'creature', name, initiative, maxHp: 10, armorClass: 10 });
}
beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: 'demo-dnd-spark',
    firestore: { host: '127.0.0.1', port: 8085, rules: readFileSync('firestore.rules', 'utf8') } });
});
beforeEach(async () => { await env.clearFirestore(); });
afterAll(async () => { await env?.cleanup(); });

describe('Reproductions for the post-migration review (expected behavior)', () => {
  test('ending an old encounter cannot clear the new active encounter', async () => {
    const c = await campaign();
    const old = await api.createEncounter(c.id, 'Primero');
    await api.endEncounter(old.id);
    const active = await api.createEncounter(c.id, 'Segundo');
    await api.endEncounter(old.id).catch(() => {});
    const data = (await getDoc(doc(state.db, 'events', c.id))).data()!;
    expect(data.activeEncounterId).toBe(active.id);
  });
  test('deleting someone before the current turn preserves the current combatant', async () => {
    const c = await campaign();
    const enc = await api.createEncounter(c.id, 'Emboscada');
    const a = await creature(enc.id, 'Primero', 30);
    const b = await creature(enc.id, 'Segundo', 20);
    await creature(enc.id, 'Tercero', 10);
    await api.nextTurn(enc.id);
    await api.removeCombatant(a.id);
    const current = await api.getActiveEncounter(c.id);
    const fighters = await api.getCombatants(enc.id);
    expect(fighters[current.turnIndex % fighters.length].id).toBe(b.id);
  });
  test('deleting a character does not leave a combatant that cannot be edited', async () => {
    const c = await campaign();
    const char = await api.createCharacter(c.id, form());
    const enc = await api.createEncounter(c.id, 'Emboscada');
    const fighter = await api.addCombatant(enc.id, { type: 'character', characterId: char.id, initiative: 10, maxHp: 10, armorClass: 10 });
    await api.deleteCharacter(char.id);
    await expect(api.updateCombatant(fighter.id, { currentHp: 5 })).resolves.toMatchObject({ currentHp: 5 });
  });
  test('a deleted and recreated character does not receive writes from its old combatant', async () => {
    const c = await campaign();
    const old = await api.createCharacter(c.id, form());
    const enc = await api.createEncounter(c.id, 'Emboscada');
    const fighter = await api.addCombatant(enc.id, { type: 'character', characterId: old.id, initiative: 10, maxHp: 10, armorClass: 10 });
    await api.deleteCharacter(old.id);
    const fresh = await api.createCharacter(c.id, { ...form(), name: 'Otro héroe' });
    await api.updateCombatant(fighter.id, { currentHp: 2 }).catch(() => {});
    const data = (await getDoc(doc(state.db, 'characters', fresh.id))).data()!;
    expect(data.currentHp).toBe(10);
  });
  test('rules reject malformed skills that crash every CharacterCard rendering them', async () => {
    const c = await campaign();
    const link = await api.invitationLinks.generate(c.id, { maxUses: 1, expiresIn: 1 });
    login('player');
    await api.invitationLinks.join(link.code);
    const char = await api.createCharacter(c.id, form());
    await assertFails(updateDoc(doc(state.db, 'characters', char.id), { skills: [null] }));
  });
  test('two simultaneous first additions create one stack', async () => {
    const c = await campaign();
    const char = await api.createCharacter(c.id, form());
    const item = { name: 'Poción', type: 'consumable', quantity: 1, value: 10 };
    await Promise.all([inventory.createItem(char.id, item), inventory.createItem(char.id, item)]);
    const result = await inventory.getInventory(char.id);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(2);
  });
  test('an ended encounter cannot overwrite current character HP', async () => {
    const c = await campaign();
    const char = await api.createCharacter(c.id, form());
    const old = await api.createEncounter(c.id, 'Primero');
    const fighter = await api.addCombatant(old.id, { type: 'character', characterId: char.id, initiative: 10, maxHp: 10, armorClass: 10 });
    await api.endEncounter(old.id);
    await api.createEncounter(c.id, 'Segundo');
    await expect(api.updateCombatant(fighter.id, { currentHp: 1 })).rejects.toThrow();
  });
});
