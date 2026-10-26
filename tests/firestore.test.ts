import {libraryPreferencesApi} from '../frontend/src/lib/api/libraryPreferences';
import {normalizeBuild} from '../frontend/src/lib/rules/characterBuilder';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, query, runTransaction, setDoc, Timestamp, updateDoc, where, writeBatch, type Firestore } from 'firebase/firestore';

const state = vi.hoisted(() => ({ db: null as any, auth: { currentUser: null as any } }));
vi.mock('$lib/firebase', () => ({ get db() { return state.db; }, auth: state.auth }));
import { sparkApi as api } from '../frontend/src/lib/api/spark';
import { sparkInventory as inventory } from '../frontend/src/lib/api/sparkInventory';
import { createEmptyCharacterForm } from '../frontend/src/lib/types';

let env: RulesTestEnvironment;
const projectId = 'demo-dnd-spark';
function database(uid: string, verified = true) {
  return env.authenticatedContext(uid, { email: `${uid}@example.com`, email_verified: verified }).firestore() as unknown as Firestore;
}
function login(uid: string, verified = true) {
  state.db = database(uid, verified);
  state.auth.currentUser = { uid, email: `${uid}@example.com`, displayName: uid, photoURL: '' };
  return state.db as Firestore;
}
function form() { return { ...createEmptyCharacterForm(), name: 'Valiente' }; }
const stamp = () => Timestamp.now();
async function campaign() { login('dm'); return api.createCampaign({ name: 'Aventura' }); }
async function invitePlayer(id: string) {
  login('dm');
  const link = await api.invitationLinks.generate(id, { maxUses: 10, expiresIn: 7 });
  login('player');
  await api.invitationLinks.join(link.code);
  return link;
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId, firestore: { host: '127.0.0.1', port: 8085, rules: readFileSync('firestore.rules', 'utf8') }
  });
});
beforeEach(async () => { await env.clearFirestore(); });
afterAll(async () => { await env?.cleanup(); });

describe('Campaigns and access boundaries', () => {
  test('creates a campaign, deterministic DM membership, and slot atomically', async () => {
    const c = await campaign();
    expect(c.name).toBe('Aventura');
    expect((await api.getCampaignMembers(c.id)).dm?.userId).toBe('dm');
    expect(await api.getCampaigns()).toHaveLength(1);
    expect(typeof c.createdAt).toBe('string');
  });
  test('cannot exceed 3 campaigns, even by writing directly', async () => {
    await campaign();
    await api.createCampaign({ name: 'Segunda' });
    const third = await api.createCampaign({ name: 'Tercera' });
    await expect(api.createCampaign({ name: 'Cuarta' })).rejects.toThrow('3 campañas');
    const copy = (await getDoc(doc(state.db, 'events', third.id))).data()!;
    await assertFails(setDoc(doc(state.db, 'events', 'forged'), { ...copy, id: 'forged' }));
  });
  test('outsiders cannot read campaigns, members, characters, inventories or notes', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    const item = await inventory.createItem(character.id, { name: 'Espada', type: 'weapon', quantity: 1, value: 10 });
    const note = await api.createNote(c.id, { title: 'Compartida', content: 'Secreto', isShared: true, category: 'plot', tags: [] });
    const stranger = login('stranger');
    for (const [name, id] of [['events', c.id], ['event_members', `dm_${c.id}`], ['characters', character.id], ['inventory_items', item.id], ['currencies', character.id], ['notes', note.id]]) {
      await assertFails(getDoc(doc(stranger, name, id)));
    }
    await assertFails(getDocs(collection(stranger, 'users')));
    await assertFails(getDocs(collection(stranger, 'events')));
    await assertFails(getDocs(collection(stranger, 'invitation_links')));
  });
  test('membership cannot be forged or elevated to DM', async () => {
    const c = await campaign();
    const db = login('stranger');
    const membership = { campaignId: c.id, userId: 'stranger', role: 'player', userName: 'stranger', userPhoto: '', joinedAt: stamp() };
    await assertFails(setDoc(doc(db, 'event_members', `stranger_${c.id}`), membership));
    await assertFails(updateDoc(doc(db, 'events', c.id), { playerIds: arrayUnion('stranger') }));
    const batch = writeBatch(db);
    batch.set(doc(db, 'event_members', `stranger_${c.id}`), { ...membership, role: 'dm' });
    batch.update(doc(db, 'events', c.id), { playerIds: arrayUnion('stranger') });
    await assertFails(batch.commit());
  });
  test('removing a player revokes reads and writes immediately', async () => {
    const c = await campaign();
    await invitePlayer(c.id);
    const character = await api.createCharacter(c.id, form());
    login('dm');
    await api.removePlayer(c.id, 'player');
    const db = login('player');
    await assertFails(getDoc(doc(db, 'characters', character.id)));
    await assertFails(updateDoc(doc(db, 'characters', character.id), { name: 'Cambio' }));
    await assertFails(getDoc(doc(db, 'events', c.id)));
  });
  test('deletion revokes child access and releases the campaign slot', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    await api.deleteCampaign(c.id);
    expect(await api.getCampaigns()).toEqual([]);
    await assertFails(getDoc(doc(state.db, 'characters', character.id)));
    await assertFails(updateDoc(doc(state.db, 'events', c.id), { deleted: false }));
    await api.createCampaign({ name: 'Reemplazo' });
  });
});

describe('Invitations and transactions', () => {
  test('joins with a code exactly once and records its use', async () => {
    const c = await campaign();
    const link = await api.invitationLinks.generate(c.id, { maxUses: 1, expiresIn: 1 });
    login('player');
    const joined = await api.invitationLinks.join(link.code);
    expect(joined.campaign.id).toBe(c.id);
    expect(await api.getCampaigns()).toHaveLength(1);
    await expect(api.invitationLinks.join(link.code)).rejects.toThrow();
    expect((await getDoc(doc(state.db, 'invitation_links', link.code))).data()?.usedCount).toBe(1);
  });
  test('cannot join by creating only a membership or incrementing only a code', async () => {
    const c = await campaign();
    const link = await api.invitationLinks.generate(c.id, { maxUses: 1, expiresIn: 1 });
    const db = login('player');
    await assertFails(updateDoc(doc(db, 'invitation_links', link.code), { usedCount: 1, lastJoinedUid: 'player' }));
    const batch = writeBatch(db);
    batch.set(doc(db, 'event_members', `player_${c.id}`), {
      campaignId: c.id, userId: 'player', role: 'player', userName: 'player', userPhoto: '', joinedAt: stamp(), inviteCode: link.code
    });
    batch.update(doc(db, 'events', c.id), { playerIds: arrayUnion('player') });
    await assertFails(batch.commit());
  });
  test('deactivated and expired codes are rejected by rules', async () => {
    const c = await campaign();
    const link = await api.invitationLinks.generate(c.id, { maxUses: 1, expiresIn: 1 });
    await api.invitationLinks.deactivate(link.code);
    login('player');
    await expect(api.invitationLinks.join(link.code)).rejects.toThrow();
    async function bypassClient() {
      const batch = writeBatch(state.db);
      batch.set(doc(state.db, 'event_members', `player_${c.id}`), {
        campaignId: c.id, userId: 'player', role: 'player', userName: 'player', userPhoto: '', joinedAt: stamp(), inviteCode: link.code
      });
      batch.update(doc(state.db, 'events', c.id), { playerIds: arrayUnion('player') });
      batch.update(doc(state.db, 'invitation_links', link.code), { usedCount: 1, lastJoinedUid: 'player' });
      return batch.commit();
    }
    await assertFails(bypassClient());
    await env.withSecurityRulesDisabled(async context => {
      await updateDoc(doc(context.firestore(), 'invitation_links', link.code), { isActive: true, expiresAt: Timestamp.fromMillis(1) });
    });
    await expect(api.invitationLinks.join(link.code)).rejects.toThrow();
    await assertFails(bypassClient());
  });
  test('concurrent joins cannot exceed the last available use', async () => {
    const c = await campaign();
    const link = await api.invitationLinks.generate(c.id, { maxUses: 1, expiresIn: 1 });
    async function joinAs(uid: string) {
      const db = database(uid);
      return runTransaction(db, async tx => {
        const ref = doc(db, 'invitation_links', link.code);
        const current = (await tx.get(ref)).data()!;
        if (current.usedCount >= current.maxUses) throw new Error('Agotado');
        tx.set(doc(db, 'event_members', `${uid}_${c.id}`), {
          campaignId: c.id, userId: uid, role: 'player', userName: uid, userPhoto: '', joinedAt: stamp(), inviteCode: link.code
        });
        tx.update(ref, { usedCount: current.usedCount + 1, lastJoinedUid: uid });
        tx.update(doc(db, 'events', c.id), { playerIds: arrayUnion(uid) });
      });
    }
    const outcomes = await Promise.allSettled([joinAs('alice'), joinAs('bob')]);
    expect(outcomes.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect((await getDoc(doc(state.db, 'invitation_links', link.code))).data()?.usedCount).toBe(1);
    expect((await api.getCampaignMembers(c.id)).players).toHaveLength(1);
  });
  test('email invitations require the verified intended recipient and cannot be replayed', async () => {
    const c = await campaign();
    const { invitation } = await api.invitePlayer(c.id, 'PLAYER@example.com');
    login('stranger');
    await assertFails(getDoc(doc(state.db, 'invitations', invitation.id)));
    login('player', false);
    await assertFails(getDoc(doc(state.db, 'invitations', invitation.id)));
    login('player');
    expect(await api.getMyInvitations()).toHaveLength(1);
    await api.respondToInvitation(invitation.id, 'accept');
    expect(await api.getCampaigns()).toHaveLength(1);
    expect(await api.getMyInvitations()).toHaveLength(0);
    await expect(api.respondToInvitation(invitation.id, 'accept')).rejects.toThrow();
  });
  test('rejecting an email invitation does not grant access', async () => {
    const c = await campaign();
    const { invitation } = await api.invitePlayer(c.id, 'player@example.com');
    login('player');
    await api.respondToInvitation(invitation.id, 'reject');
    expect(await api.getCampaigns()).toEqual([]);
    await assertFails(getDoc(doc(state.db, 'events', c.id)));
  });
});

describe('Characters, inventory, notes and combat', () => {
  test('creatures retain their source sheet identifier even when named differently and taking damage', async () => {
    const c=await campaign(); const encounter=await api.createEncounter(c.id,'Emboscada');
    const fighter=await api.addCombatant(encounter.id,{type:'creature',name:'Goblin de la cueva',initiative:12,maxHp:7,armorClass:15,creatureSource:'open5e',monsterSlug:'goblin'});
    expect(fighter.monsterSlug).toBe('goblin');
    await api.applyCombatantHealth(fighter.id,{type:'damage',amount:1});
    expect((await api.getCombatants(encounter.id))[0]).toMatchObject({monsterSlug:'goblin',currentHp:6});
    await expect(api.addCombatant(encounter.id,{type:'creature',name:'Inválido',initiative:1,maxHp:1,armorClass:10,monsterSlug:'../other'})).rejects.toThrow();
  });
  test('2024 damage changes combatant and character atomically without lost hits', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    const encounter = await api.createEncounter(c.id, 'Emboscada');
    const fighter = await api.addCombatant(encounter.id, { type: 'character', characterId: character.id, initiative: 10, maxHp: 10, armorClass: 10 });
    await Promise.all([api.applyCombatantHealth(fighter.id, { type: 'damage', amount: 3 }), api.applyCombatantHealth(fighter.id, { type: 'damage', amount: 3 })]);
    expect((await api.getCombatants(encounter.id))[0].currentHp).toBe(4);
    expect((await api.getCampaignCharacters(c.id))[0].currentHp).toBe(4);
  });
  test('2024 concentration and timed conditions are synchronized', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    const encounter = await api.createEncounter(c.id, 'Emboscada');
    const fighter = await api.addCombatant(encounter.id, { type: 'character', characterId: character.id, initiative: 10, maxHp: 10, armorClass: 10 });
    await api.applyCombatantHealth(fighter.id, { type: 'concentration', name: 'Conjuro' });
    const pending = await api.applyCombatantHealth(fighter.id, { type: 'damage', amount: 1 });
    expect(pending.rules.concentrationSaveDC).toBe(10);
    await api.applyCombatantHealth(fighter.id, { type: 'concentrationResult', success: true });
    await api.addCondition(fighter.id, 'Stunned', 'Efecto', 1, 'end');
    expect((await api.getCampaignCharacters(c.id))[0].rules.concentration).toBe('');
    await api.nextTurn(encounter.id);
    expect((await api.getCombatants(encounter.id))[0].conditions).toEqual([]);
  });
  test('2024 rests recover Hit Dice and exhaustion, but cannot be taken in combat', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, { ...form(), class: 'Guerrero', level: 3 });
    await api.applyCharacterHealth(character.id, { type: 'damage', amount: 5 });
    const short = await api.restCharacter(character.id, 'short', 2);
    expect(short.rolls).toHaveLength(2); expect(short.character.rules.hitDiceSpent).toBe(2);
    await api.applyCharacterHealth(character.id, { type: 'exhaustion', level: 2 });
    const long = await api.restCharacter(character.id, 'long');
    expect(long.character.rules.hitDiceSpent).toBe(0); expect(long.character.rules.exhaustion).toBe(1);
    const encounter = await api.createEncounter(c.id, 'Emboscada');
    await api.addCombatant(encounter.id, { type: 'character', characterId: character.id, initiative: 10, maxHp: 10, armorClass: 10 });
    await expect(api.restCharacter(character.id, 'long')).rejects.toThrow('combate');
  });
  test('legacy sheets are upgraded on their first state update', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    const raw = (await getDoc(doc(state.db, 'characters', character.id))).data()!;
    await env.withSecurityRulesDisabled(async context => {
      const { rules, skillRanks, instanceId, ...legacy } = raw;
      await setDoc(doc(context.firestore(), 'characters', character.id), { ...legacy, skills: form().skills });
    });
    const updated = await api.applyCharacterHealth(character.id, { type: 'damage', amount: 1 });
    expect(updated.currentHp).toBe(9); expect(updated.skills).toHaveLength(18);
    const stored = (await getDoc(doc(state.db, 'characters', character.id))).data()!;
    expect(stored.skillRanks).toBeDefined(); expect(stored.skills).toBeUndefined();
  });
  test('all supported effect slots fit Firestore validation limits', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    const encounter = await api.createEncounter(c.id, 'Emboscada');
    const fighter = await api.addCombatant(encounter.id, { type: 'character', characterId: character.id, initiative: 10, maxHp: 10, armorClass: 10 });
    for (let i = 0; i < 10; i++) await api.addCondition(fighter.id, 'Poisoned', `Origen ${i}`, i + 1, 'end');
    expect((await api.getCombatants(encounter.id))[0].rules.effects).toHaveLength(10);
    await api.nextTurn(encounter.id);
    expect((await api.getCombatants(encounter.id))[0].rules.effects).toHaveLength(9);
    await api.endEncounter(encounter.id);
    await api.updateCharacter(character.id, {...form(), name:'Nombre nuevo'});
    const ref = doc(state.db, 'characters', character.id);
    const raw = (await getDoc(ref)).data()!;
    await assertFails(updateDoc(ref, {skillRanks:{...raw.skillRanks,Athletics:3}}));
    await assertFails(updateDoc(ref, {rules:{...raw.rules,exhaustion:7}}));
    await assertFails(updateDoc(ref, {rules:{...raw.rules,effects:['invalid']}}));
  });
  test('cannot create a second character or bypass its deterministic ID', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    await expect(api.createCharacter(c.id, form())).rejects.toThrow('un personaje');
    const data = (await getDoc(doc(state.db, 'characters', character.id))).data()!;
    await assertFails(setDoc(doc(state.db, 'characters', 'duplicate'), { ...data, id: 'duplicate' }));
    expect(await api.getCampaignCharacters(c.id)).toHaveLength(1);
  });
  test('concurrent additions to an existing stack preserve quantity', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    const data = { name: 'Poción', type: 'consumable', quantity: 2, value: 10 };
    await inventory.createItem(character.id, data);
    await Promise.all([inventory.createItem(character.id, data), inventory.createItem(character.id, data)]);
    const result = await inventory.getInventory(character.id);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].quantity).toBe(6);
  });
  test('a DM cannot attach another campaign’s character to combat', async () => {
    const c = await campaign();
    const other = await api.createCampaign({ name: 'Otra campaña' });
    const character = await api.createCharacter(other.id, form());
    const encounter = await api.createEncounter(c.id, 'Emboscada');
    await expect(api.addCombatant(encounter.id, { type: 'character', characterId: character.id, initiative: 10, maxHp: 10, armorClass: 10 })).rejects.toThrow('otra campaña');
  });
  test('members can see character sheets, but inventories are private to owner and DM', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    await inventory.createItem(character.id, { name: 'Oro', type: 'treasure', quantity: 2, value: 50 });
    await invitePlayer(c.id);
    expect(await api.getCampaignCharacters(c.id)).toHaveLength(1);
    await expect(inventory.getInventory(character.id)).rejects.toThrow();
    await assertFails(updateDoc(doc(state.db, 'characters', character.id), { name: 'Robado' }));
    login('dm');
    expect((await inventory.getInventory(character.id)).totalValue).toBe(100);
  });
  test('a player can edit weapon dice, type, magic status and bonuses, but outsiders cannot', async () => {
    const c = await campaign(); await invitePlayer(c.id);
    const character = await api.createCharacter(c.id, form());
    const weapon = {weaponType:'martial',damageDice:'1d8',damageType:'slashing',properties:{versatile:'1d10'},magicBonus:0,isMagical:false};
    const item = await inventory.createItem(character.id,{name:'Espada',type:'weapon',quantity:1,value:15,weaponData:weapon});
    const changed = {...weapon,damageDice:'2d6',damageType:'fire',magicBonus:2,isMagical:true,requiresAttunement:true};
    await inventory.updateItem(item.id,{weaponData:changed});
    expect((await inventory.getInventory(character.id)).items[0].weaponData).toEqual(changed);
    const ref = doc(state.db,'inventory_items',item.id);
    await assertFails(updateDoc(ref,{weaponData:{...changed,damageDice:'0d6'}}));
    await assertFails(updateDoc(ref,{weaponData:{...changed,magicBonus:99}}));
    await assertFails(updateDoc(ref,{weaponData:{...changed,isMagical:false}}));
    await assertFails(updateDoc(ref,{weaponData:{...changed,damageType:'invalid'}}));
    await assertFails(updateDoc(ref,{weaponData:{...changed,magicBonus:0,isMagical:false}}));
    await assertFails(updateDoc(ref,{weaponData:{...changed,requiresAttunement:'yes'}}));
    await inventory.updateItem(item.id,{weaponData:{...changed,magicBonus:0,isMagical:false,requiresAttunement:false}});
    login('stranger');
    await expect(inventory.updateItem(item.id,{weaponData:weapon})).rejects.toThrow();
  });
  test('weapon handling and independent versatile damage survive creation and editing', async () => {
    const c = await campaign(); const character = await api.createCharacter(c.id,form());
    const weaponData={weaponType:'martial',damageDice:'1d8',damageType:'slashing',properties:{twoHanded:false,versatile:'1d10'},magicBonus:1,isMagical:true};
    const item=await inventory.createItem(character.id,{name:'Espada versátil',type:'weapon',quantity:1,value:20,weaponData});
    expect((await inventory.getInventory(character.id)).items[0].weaponData?.properties.versatile).toBe('1d10');
    await inventory.updateItem(item.id,{weaponData:{...weaponData,properties:{twoHanded:false,versatile:'2d6'}}});
    expect((await inventory.getInventory(character.id)).items[0].weaponData?.properties.versatile).toBe('2d6');
    await inventory.updateItem(item.id,{weaponData:{...weaponData,damageDice:'2d6',properties:{twoHanded:true}}});
    const stored=(await inventory.getInventory(character.id)).items[0].weaponData!;
    expect(stored.damageDice).toBe('2d6');
    expect(stored.properties).toEqual({twoHanded:true});
  });
  test('armor bonus can be edited by its owner and its identity cannot be reassigned', async () => {
    const c = await campaign(); const character = await api.createCharacter(c.id,form());
    const armorData = {armorType:'light',baseAC:12,magicBonus:0};
    const item = await inventory.createItem(character.id,{name:'Armadura',type:'armor',quantity:1,value:20,armorData});
    await inventory.updateItem(item.id,{armorData:{...armorData,magicBonus:2}});
    const ref=doc(state.db,'inventory_items',item.id);
    expect((await getDoc(ref)).data()?.armorData.magicBonus).toBe(2);
    await assertFails(updateDoc(ref,{armorData:{...armorData,magicBonus:4}}));
    await assertFails(updateDoc(ref,{characterId:'other'}));
    await assertFails(updateDoc(ref,{campaignId:'other'}));
  });
  test('catalog fixed-damage weapons and generic magical objects retain valid saved metadata', async () => {
    const c=await campaign();const character=await api.createCharacter(c.id,form());
    const weaponData={weaponType:'simple',damageDice:'0',damageType:'bludgeoning',properties:{},magicBonus:0,isMagical:false,requiresAttunement:false};
    await inventory.createItem(character.id,{name:'Red',type:'weapon',quantity:1,value:1,weaponData});
    const ring=await inventory.createItem(character.id,{name:'Anillo',type:'other',quantity:1,value:20,isMagical:true,requiresAttunement:true});
    expect(ring.requiresAttunement).toBe(true);
    await inventory.updateItem(ring.id,{quantity:2});
    expect((await getDoc(doc(state.db,'inventory_items',ring.id))).data()?.requiresAttunement).toBe(true);
    await expect(inventory.createItem(character.id,{name:'Inválido',type:'other',quantity:1,value:1,isMagical:false,requiresAttunement:true})).rejects.toThrow();
  });
  test('a player can configure magical armor and attunement with validated flags', async () => {
    const c=await campaign(); await invitePlayer(c.id);
    const character=await api.createCharacter(c.id,form());
    const armorData={armorType:'light',baseAC:12,magicBonus:0,isMagical:true,requiresAttunement:true};
    const item=await inventory.createItem(character.id,{name:'Armadura encantada',type:'armor',quantity:1,value:50,armorData});
    await inventory.updateItem(item.id,{armorData:{...armorData,magicBonus:2}});
    expect((await inventory.getInventory(character.id)).items[0].armorData).toMatchObject({isMagical:true,magicBonus:2,requiresAttunement:true});
    const ref=doc(state.db,'inventory_items',item.id);
    await assertFails(updateDoc(ref,{armorData:{...armorData,isMagical:false}}));
    await assertFails(updateDoc(ref,{armorData:{...armorData,requiresAttunement:'yes'}}));
    await assertFails(updateDoc(ref,{armorData:{...armorData,isMagical:false,requiresAttunement:false,magicBonus:1}}));
    await inventory.updateItem(item.id,{armorData:{...armorData,isMagical:false,requiresAttunement:false,magicBonus:0}});
    expect((await inventory.getInventory(character.id)).items[0].armorData?.isMagical).toBe(false);
  });
  test('adding the original weapon after editing its stats creates a separate stack', async () => {
    const c = await campaign(); const character = await api.createCharacter(c.id,form());
    const weaponData = {weaponType:'simple',damageDice:'1d6',damageType:'slashing',properties:{},magicBonus:0,isMagical:false};
    const fields = {name:'Espada',type:'weapon',quantity:1,value:10,weaponData};
    const item = await inventory.createItem(character.id,fields);
    await inventory.updateItem(item.id,{weaponData:{...weaponData,magicBonus:1,isMagical:true}});
    await Promise.all([inventory.createItem(character.id,fields),inventory.createItem(character.id,fields)]);
    const items=(await inventory.getInventory(character.id)).items;
    expect(items).toHaveLength(2);
    expect(items.find(entry=>entry.weaponData?.magicBonus===1)?.quantity).toBe(1);
    expect(items.find(entry=>entry.weaponData?.magicBonus===0)?.quantity).toBe(2);
  });
  test('item edits and deletion are immediately reflected; currency validates the first write', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    const item = await inventory.createItem(character.id, { name: 'Poción', type: 'consumable', quantity: 2, value: 10 });
    await inventory.updateItem(item.id, { quantity: 3 });
    await assertFails(setDoc(doc(state.db, 'currencies', character.id), { copper: -1, silver: 0, gold: 0, platinum: 0 }));
    await expect(inventory.updateCurrency(character.id, { gold: -1 })).rejects.toThrow();
    await inventory.updateCurrency(character.id, { gold: 5 });
    expect((await inventory.getInventory(character.id)).totalValue).toBe(35);
    await inventory.deleteItem(item.id);
    expect((await inventory.getInventory(character.id)).items).toHaveLength(0);
    await assertFails(setDoc(doc(state.db, 'currencies', character.id), { copper: -1, silver: 0, gold: 0, platinum: 0 }));
    await expect(inventory.updateCurrency(character.id, { gold: -1 })).rejects.toThrow();
    await api.deleteCharacter(character.id);
  });
  test('cannot move characters or inventory into another campaign', async () => {
    const c = await campaign();
    const second = await api.createCampaign({ name: 'Segunda' });
    const character = await api.createCharacter(c.id, form());
    const item = await inventory.createItem(character.id, { name: 'Escudo', type: 'shield', quantity: 1, value: 10 });
    await assertFails(updateDoc(doc(state.db, 'characters', character.id), { campaignId: second.id }));
    await assertFails(updateDoc(doc(state.db, 'inventory_items', item.id), { campaignId: second.id }));
    await assertFails(updateDoc(doc(state.db, 'characters', character.id), { userId: 'stranger' }));
    await assertFails(updateDoc(doc(state.db, 'characters', character.id), { currentHp: -1 }));
  });
  test('only the DM can share notes; private notes are not visible even to the DM', async () => {
    const c = await campaign();
    const shared = await api.createNote(c.id, { title: 'Mapa', content: 'Texto', isShared: true, category: 'location', tags: [] });
    await invitePlayer(c.id);
    expect((await api.getNote(shared.id)).title).toBe('Mapa');
    const personal = await api.createNote(c.id, { title: 'Mi diario', content: 'Privado', isShared: false, category: 'session', tags: [] });
    await api.updateNote(personal.id, { content: '' });
    expect((await api.getNote(personal.id)).content).toBe('');
    await expect(api.updateNote(personal.id, { isShared: true })).rejects.toThrow();
    expect(await api.getCampaignNotes(c.id)).toHaveLength(2);
    login('dm');
    await assertFails(getDoc(doc(state.db, 'notes', personal.id)));
    expect(await api.getCampaignNotes(c.id)).toHaveLength(1);
  });
  test('combat synchronizes health, serializes turns, and only DM controls it', async () => {
    const c = await campaign();
    const character = await api.createCharacter(c.id, form());
    const encounter = await api.createEncounter(c.id, 'Emboscada');
    await expect(api.createEncounter(c.id, 'Duplicado')).rejects.toThrow();
    const fighter = await api.addCombatant(encounter.id, { type: 'character', characterId: character.id, initiative: 0, maxHp: 10, armorClass: 10 });
    await api.updateCombatant(fighter.id, { currentHp: 3, temporaryHp: 2 });
    expect((await api.getCampaignCharacters(c.id))[0].currentHp).toBe(3);
    await Promise.all([api.nextTurn(encounter.id), api.nextTurn(encounter.id)]);
    expect((await api.getActiveEncounter(c.id)).round).toBe(3);
    await api.resetEncounter(encounter.id);
    expect((await api.getActiveEncounter(c.id)).round).toBe(1);
    await invitePlayer(c.id);
    expect(await api.getPublicCombatants(encounter.id)).toHaveLength(1);
    await expect(api.getCombatants(encounter.id)).rejects.toThrow();
    await expect(api.updateCombatant(fighter.id, { currentHp: 10 })).rejects.toThrow();
    login('dm');
    await api.endEncounter(encounter.id);
    await expect(api.getActiveEncounter(c.id)).rejects.toThrow();
    await api.createEncounter(c.id, 'Nueva batalla');
  });
  test('unauthenticated clients cannot access data', async () => {
    const c = await campaign();
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'events', c.id)));
    await assertFails(getDocs(collection(db, 'users')));
  });
});


test('expanded sheets persist catalog and custom choices, preserve them on legacy edits, and reject unauthorized writes',async()=>{
 const c=await campaign();await invitePlayer(c.id);
 const build=normalizeBuild();build.species={key:'srd-2024_elf',name:'Elf'};build.class={key:'srd-2024_wizard',name:'Wizard'};build.hitDie=6;build.customFeatures=[{name:'Custom lineage',desc:'A homebrew feature'}];build.spells=[{key:'srd-2024_light',name:'Light',level:0,prepared:true,desc:''}];
 const character=await api.createCharacter(c.id,{...form(),class:'Wizard',build});
 expect(character.build?.species.name).toBe('Elf');expect(character.rules.hitDieSize).toBe(6);expect(character.build?.spells).toHaveLength(1);
 await api.updateCharacter(character.id,{...form(),class:'Wizard',name:'Mago editado'});
 expect((await api.getCampaignCharacters(c.id))[0].build?.customFeatures[0].desc).toBe('A homebrew feature');
 const raw=doc(state.db,'characters',character.id);
 await assertFails(updateDoc(raw,{buildJson:{malformed:true},updatedAt:stamp()}));
 await assertFails(updateDoc(raw,{buildJson:'x'.repeat(150001),updatedAt:stamp()}));
 login('stranger');await assertFails(updateDoc(doc(state.db,'characters',character.id),{buildJson:'{}',updatedAt:stamp()}));
 login('player');build.spells.push({key:'',name:'My spell',level:2,prepared:false,desc:'Custom rules'});await api.updateCharacter(character.id,{...form(),class:'Wizard',build});
 expect((await api.getCampaignCharacters(c.id))[0].build?.spells[1].desc).toBe('Custom rules');
});


test('resource edits serialize, rest recovery is atomic, and another player cannot edit them',async()=>{
 const c=await campaign();await invitePlayer(c.id);const character=await api.createCharacter(c.id,form());
 await api.changeResource(character.id,{kind:'save',pool:{id:'ki',name:'Enfoque',max:4,current:4,recovery:'short'}});
 await Promise.all([api.changeResource(character.id,{kind:'adjust',id:'ki',delta:-1}),api.changeResource(character.id,{kind:'adjust',id:'ki',delta:-1})]);
 let saved=JSON.parse((await getDoc(doc(state.db,'character_resources',character.id))).data()!.poolsJson);expect(saved[0].current).toBe(2);
 await api.changeResource(character.id,{kind:'save',pool:{id:'ki',name:'Enfoque',max:5,current:4,recovery:'short'}});saved=JSON.parse((await getDoc(doc(state.db,'character_resources',character.id))).data()!.poolsJson);expect(saved[0].current).toBe(2);
 await api.restCharacter(character.id,'short',0);saved=JSON.parse((await getDoc(doc(state.db,'character_resources',character.id))).data()!.poolsJson);expect(saved[0].current).toBe(5);
 const logs=await getDocs(query(collection(state.db,'campaign_activity'),where('campaignId','==',c.id),where('visibility','==','public')));expect(logs.docs.some(d=>d.data().message.includes('descanso corto'))).toBe(true);
 await expect(api.changeResource(character.id,{kind:'adjust',id:'ki',delta:1})).rejects.toThrow();
 login('stranger');await assertFails(getDoc(doc(state.db,'character_resources',character.id)));await expect(api.changeResource(character.id,{kind:'adjust',id:'ki',delta:-1})).rejects.toThrow();
});

test('bulk combat creation publishes only visible data and private notes remain inaccessible',async()=>{
 const c=await campaign();const encounter=await api.createEncounter(c.id,'Emboscada');
 await api.addCreatureGroup(encounter.id,{name:'Goblin',initiative:10,maxHp:7,armorClass:15,count:20,hideStats:true});
 const fighters=await api.getCombatants(encounter.id);expect(fighters).toHaveLength(20);expect(new Set(fighters.map(f=>f.name)).size).toBe(20);
 await api.setCombatVisibility(fighters[0].id,{hidden:true,hideStats:true,notes:'Ataque sorpresa'});
 const publicRows=await api.getPublicCombatants(encounter.id);expect(publicRows).toHaveLength(19);expect(publicRows.every(f=>f.currentHp===null&&f.armorClass===null)).toBe(true);
 await invitePlayer(c.id);await expect(api.getCombatants(encounter.id)).rejects.toThrow();expect(await api.getPublicCombatants(encounter.id)).toHaveLength(19);await assertFails(getDoc(doc(state.db,'combatants',fighters[0].id)));
 const publicLogs=await getDocs(query(collection(state.db,'campaign_activity'),where('campaignId','==',c.id),where('visibility','==','public')));expect(publicLogs.docs.some(d=>d.data().message.includes('sorpresa'))).toBe(false);await assertFails(getDocs(query(collection(state.db,'campaign_activity'),where('campaignId','==',c.id))));
 login('dm');await api.setCombatVisibility(fighters[0].id,{hidden:false,hideStats:false,notes:'Ataque sorpresa'});expect((await api.getPublicCombatants(encounter.id)).find(f=>f.id===fighters[0].id)?.currentHp).toBe(7);
 await api.updateCombatant(fighters[0].id,{initiative:99,currentHp:3});const projection=(await api.getPublicCombatants(encounter.id)).find(f=>f.id===fighters[0].id)!;expect(projection.initiative).toBe(99);expect(projection.currentHp).toBe(3);expect(projection).not.toHaveProperty('notes');
});

test('hidden groups and encounter templates respect Firestore transaction limits',async()=>{
 const c=await campaign();const encounter=await api.createEncounter(c.id,'Caverna');
 await api.addCreatureGroup(encounter.id,{name:'Araña',initiative:5,maxHp:10,armorClass:12,count:20,hidden:true});expect(await api.getPublicCombatants(encounter.id)).toHaveLength(0);
 const creatures=await api.getCombatants(encounter.id);await api.saveEncounterTemplate(c.id,'Caverna guardada',creatures);const templates=await getDocs(query(collection(state.db,'encounter_templates'),where('campaignId','==',c.id)));expect(templates.size).toBe(1);
 await api.endEncounter(encounter.id);const fresh=await api.startEncounterTemplate(templates.docs[0].id,true);expect((await api.getCombatants(fresh.id)).length).toBe(20);expect(await api.getPublicCombatants(fresh.id)).toHaveLength(0);
 await invitePlayer(c.id);await assertFails(getDoc(doc(state.db,'encounter_templates',templates.docs[0].id)));
});

test('catalog favorites and search history are private and merge concurrent changes',async()=>{
 await campaign();await Promise.all([libraryPreferencesApi.change({favorite:{kind:'spells',key:'light',name:'Light'}}),libraryPreferencesApi.change({favorite:{kind:'items',key:'rope',name:'Rope'}})]);expect((await libraryPreferencesApi.get()).favorites).toHaveLength(2);
 await libraryPreferencesApi.change({recent:{kind:'spells',query:'light',edition:'2024',scope:'official',source:'',type:''}});expect((await libraryPreferencesApi.get()).recent[0].query).toBe('light');
 login('stranger');expect((await libraryPreferencesApi.get()).favorites).toHaveLength(0);await assertFails(getDoc(doc(state.db,'catalog_preferences','dm')));
});

test('players outside an active encounter can rest without access to private combatants, while hidden participants cannot',async()=>{
 const c=await campaign();await invitePlayer(c.id);const character=await api.createCharacter(c.id,form());
 login('dm');const encounter=await api.createEncounter(c.id,'Batalla reservada');
 await api.addCreatureGroup(encounter.id,{name:'Sombra',initiative:10,maxHp:10,armorClass:12,hidden:true});
 login('player');await api.restCharacter(character.id,'short',0);await api.updateCharacter(character.id,{...form(),name:'Preparado'});
 login('dm');const fighter=await api.addCombatant(encounter.id,{type:'character',characterId:character.id,initiative:1,maxHp:10,armorClass:10});
 await api.setCombatVisibility(fighter.id,{hidden:true,hideStats:true,notes:'Solo DM'});
 login('player');await expect(api.restCharacter(character.id,'short',0)).rejects.toThrow('está en combate');
 await assertFails(getDoc(doc(state.db,'combatants',fighter.id)));
 login('dm');await api.removeCombatant(fighter.id);
 login('player');await api.restCharacter(character.id,'short',0);
});
