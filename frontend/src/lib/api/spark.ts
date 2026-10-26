import {resourceApi} from './resources';
import {encodeBuild} from '$lib/rules/characterBuilder';
import {
  arrayRemove, arrayUnion, collection, deleteDoc, deleteField, doc, getDoc, getDocs, query,
  runTransaction, setDoc, Timestamp, updateDoc, where, writeBatch
} from 'firebase/firestore';
import { db } from '$lib/firebase';
import { combatApi } from './combat';
import { characterStateApi, requireOutOfCombat } from './characterState';
import { encodeRules, normalizeRules, defaultHitDie, initiativeModifier } from '$lib/rules/2024';
import { currentUser, encodeSkills, fromDoc, list, memberData, memberRef, read } from './firestore';
import type { Campaign, CampaignMember, CampaignMembers, Character, CharacterForm,
  Combatant, Encounter, Invitation, InvitationLink, Note } from '$lib/types';
import { createEmptyCharacterForm, getProficiencyBonus } from '$lib/types';

const now = () => Timestamp.now();
const message = (text: string) => ({ message: text });

export async function ensureProfile() {
  const user = currentUser();
  const ref = doc(db, 'users', user.uid);
  await runTransaction(db, async tx => {
    const existing = await tx.get(ref);
    const profile = {
      uid: user.uid, email: user.email || '', displayName: user.displayName || 'Aventurero',
      photoURL: user.photoURL || ''
    };
    if (existing.exists()) tx.update(ref, profile);
    else tx.set(ref, { ...profile, createdAt: now() });
  });
}

function newCode() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
}

function characterFields(data: Partial<CharacterForm>) {
  const defaults = createEmptyCharacterForm();
  return {
    name: data.name?.trim() || '', class: data.class?.trim() || '', level: data.level || 1,
    maxHp: data.maxHp ?? 10, armorClass: data.armorClass ?? 10, initiative: data.initiativeBonus !== undefined ? initiativeModifier(data.abilityScores || defaults.abilityScores, data.initiativeBonus) : data.initiative ?? 0,
    speed: data.speed ?? 30, abilityScores: data.abilityScores || defaults.abilityScores,
    savingThrows: data.savingThrows || defaults.savingThrows, skills: data.skills || defaults.skills,
    ...(data.build ? {buildJson:encodeBuild(data.build)} : {}),
    proficiencyBonus: getProficiencyBonus(data.level || 1)
  };
}

function combatOrder(a: Combatant, b: Combatant) {
  return b.initiative - a.initiative || a.id.localeCompare(b.id);
}

export const sparkApi = {
  async createCampaign(data: { name: string }): Promise<Campaign> {
    const user = currentUser();
    const ref = doc(collection(db, 'events'));
    await runTransaction(db, async tx => {
      const slots = await Promise.all([0, 1, 2].map(slot => tx.get(doc(db, 'users', user.uid, 'campaign_slots', String(slot)))));
      const slot = slots.findIndex(entry => !entry.exists());
      if (slot < 0) throw new Error('Podés tener hasta 3 campañas como DM.');
      tx.set(ref, {
        id: ref.id, name: data.name.trim(), dmId: user.uid, dmName: user.displayName || 'DM',
        dmPhoto: user.photoURL || '', playerIds: [], createdAt: now(), deleted: false, slot: String(slot)
      });
      tx.set(doc(db, 'users', user.uid, 'campaign_slots', String(slot)), { campaignId: ref.id });
      tx.set(memberRef(ref.id), memberData(ref.id, { role: 'dm' }));
    });
    return read<Campaign>('events', ref.id);
  },

  async getCampaigns(): Promise<Campaign[]> {
    const memberships = await list<CampaignMember>('event_members', where('userId', '==', currentUser().uid));
    const campaigns = await Promise.all(memberships.map(async member => {
      const snapshot = await getDoc(doc(db, 'events', member.campaignId));
      return snapshot.exists() && !snapshot.data().deleted ? fromDoc<Campaign>(snapshot) : null;
    }));
    return campaigns.filter((campaign): campaign is Campaign => campaign !== null);
  },
  getCampaign: (id: string) => read<Campaign>('events', id),

  async deleteCampaign(id: string) {
    await runTransaction(db, async tx => {
      const campaign = fromDoc<any>(await tx.get(doc(db, 'events', id)));
      if (campaign.dmId !== currentUser().uid) throw new Error('Solo el DM puede eliminar la campaña.');
      // A tombstone revokes access atomically, including private notes and large collections.
      tx.update(doc(db, 'events', id), { deleted: true, deletedAt: now() });
      tx.delete(doc(db, 'users', campaign.dmId, 'campaign_slots', campaign.slot));
    });
    return message('Campaña eliminada');
  },

  async getCampaignMembers(id: string): Promise<CampaignMembers> {
    const members = await list<CampaignMember>('event_members', where('campaignId', '==', id));
    return { dm: members.find(member => member.role === 'dm') || null, players: members.filter(member => member.role === 'player') };
  },

  async invitePlayer(campaignId: string, userEmail: string) {
    const user = currentUser();
    const campaign = await read<Campaign>('events', campaignId);
    const ref = doc(collection(db, 'invitations'));
    const invitation = {
      id: ref.id, campaignId, campaignName: campaign.name,
      fromUserId: user.uid, fromName: user.displayName || 'DM', fromPhoto: user.photoURL || '',
      toUserId: '', toEmail: userEmail.trim().toLowerCase(), status: 'pending', createdAt: now()
    };
    await setDoc(ref, invitation);
    return { message: 'Invitación creada. Aparecerá al ingresar con ese correo.', invitation: await read<Invitation>('invitations', ref.id) };
  },

  async removePlayer(campaignId: string, userId: string) {
    const batch = writeBatch(db);
    batch.update(doc(db, 'events', campaignId), { playerIds: arrayRemove(userId) });
    batch.delete(memberRef(campaignId, userId));
    await batch.commit();
    return message('Jugador eliminado');
  },

  getMyInvitations: () => list<Invitation>('invitations',
    where('toEmail', '==', (currentUser().email || '').toLowerCase()), where('status', '==', 'pending')),

  async respondToInvitation(id: string, action: 'accept' | 'reject') {
    const user = currentUser();
    await runTransaction(db, async tx => {
      const ref = doc(db, 'invitations', id);
      const invitation = fromDoc<Invitation>(await tx.get(ref));
      if (invitation.status !== 'pending') throw new Error('Esta invitación ya fue respondida.');
      const membership = await tx.get(memberRef(invitation.campaignId));
      if (action === 'accept' && membership.exists()) throw new Error('Ya sos miembro de esta campaña.');
      tx.update(ref, { status: action === 'accept' ? 'accepted' : 'rejected', toUserId: user.uid, respondedAt: now() });
      if (action === 'accept') {
        tx.set(memberRef(invitation.campaignId), memberData(invitation.campaignId, { invitationId: id }));
        tx.update(doc(db, 'events', invitation.campaignId), { playerIds: arrayUnion(user.uid) });
      }
    });
    return message(action === 'accept' ? 'Invitación aceptada' : 'Invitación rechazada');
  },

  async createCharacter(campaignId: string, data: CharacterForm & { imageUrl?: string }) {
    const user = currentUser();
    const existing = await list<Character>('characters', where('campaignId', '==', campaignId), where('userId', '==', user.uid));
    if (existing.length) throw new Error('Ya tenés un personaje en esta campaña.');
    const ref = doc(db, 'characters', `${user.uid}_${campaignId}`);
    const fields = characterFields(data);
    await setDoc(ref, {
      ...Object.fromEntries(Object.entries(fields).filter(([key]) => key !== 'skills')), skillRanks: encodeSkills(fields.skills), id: ref.id, campaignId, userId: user.uid, instanceId: doc(collection(db, 'characters')).id,
      rules: encodeRules({...normalizeRules({ currentHp: fields.maxHp, class: fields.class }),...(data.build?{hitDieSize:data.build.hitDie}:{})}),
      currentHp: fields.maxHp, conditions: [], temporaryHp: 0, deathSaves: { successes: 0, failures: 0 },
      imageUrl: data.imageUrl || '', createdAt: now(), updatedAt: now()
    });
    return read<Character>('characters', ref.id);
  },
  getCampaignCharacters: (id: string) => list<Character>('characters', where('campaignId', '==', id)),

  async updateCharacter(id: string, data: CharacterForm & { imageUrl?: string }) {
    await runTransaction(db, async tx => {
      const ref = doc(db, 'characters', id);
      const previous = fromDoc<Character>(await tx.get(ref));
      await requireOutOfCombat(tx, previous);
      const fields = characterFields(data);
      const rules = { ...previous.rules, hitDiceSpent: Math.min(previous.rules.hitDiceSpent, fields.level), hitDieSize: data.build?.hitDie || (previous.class === fields.class ? previous.rules.hitDieSize : defaultHitDie(fields.class)) };
      tx.update(ref, { ...fields, skills: deleteField(), skillRanks: encodeSkills(fields.skills), rules: encodeRules(rules), currentHp: Math.min(previous.currentHp, fields.maxHp), updatedAt: now(), ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}) });
    });
    return read<Character>('characters', id);
  },

  async deleteCharacter(id: string) {
    // Lock new inventory writes before enumerating dependents.
    await runTransaction(db, async tx => {
      const ref = doc(db, 'characters', id);
      const snapshot = await tx.get(ref);
      if (!snapshot.exists()) return;
      const character = fromDoc<Character>(snapshot);
      tx.update(ref, { deleting: true, skills: deleteField(), skillRanks: encodeSkills(character.skills), rules: encodeRules(character.rules) });
    });
    const items = await getDocs(query(collection(db, 'inventory_items'), where('characterId', '==', id)));
    for (let offset = 0; offset < items.size; offset += 400) {
      const batch = writeBatch(db);
      items.docs.slice(offset, offset + 400).forEach(item => batch.delete(item.ref));
      await batch.commit();
    }
    const batch = writeBatch(db);
    batch.delete(doc(db, 'currencies', id));
    batch.delete(doc(db, 'characters', id));
    await batch.commit();
    return message('Personaje eliminado');
  },

  ...resourceApi,
  ...combatApi,
  ...characterStateApi,

  async createNote(campaignId: string, data: Pick<Note, 'title' | 'content' | 'isShared' | 'category' | 'tags'>) {
    const ref = doc(collection(db, 'notes'));
    await setDoc(ref, { ...data, id: ref.id, campaignId, authorId: currentUser().uid,
      authorName: currentUser().displayName || 'Aventurero', createdAt: now(), updatedAt: now() });
    return read<Note>('notes', ref.id);
  },
  async getCampaignNotes(id: string) {
    const [personal, shared] = await Promise.all([
      list<Note>('notes', where('campaignId', '==', id), where('authorId', '==', currentUser().uid)),
      list<Note>('notes', where('campaignId', '==', id), where('isShared', '==', true))
    ]);
    return [...new Map([...personal, ...shared].map(note => [note.id, note])).values()];
  },
  getNote: (id: string) => read<Note>('notes', id),
  async updateNote(id: string, data: Partial<Pick<Note, 'title' | 'content' | 'isShared' | 'category' | 'tags'>>) {
    await updateDoc(doc(db, 'notes', id), { ...data, updatedAt: now() });
    return read<Note>('notes', id);
  },
  async deleteNote(id: string) {
    await deleteDoc(doc(db, 'notes', id));
    return message('Nota eliminada');
  },

  invitationLinks: {
    async generate(campaignId: string, data: { maxUses: number; expiresIn: number }) {
      const code = newCode();
      await setDoc(doc(db, 'invitation_links', code), {
        id: code, code, campaignId, createdBy: currentUser().uid, createdAt: now(),
        expiresAt: Timestamp.fromMillis(Date.now() + data.expiresIn * 86400000),
        maxUses: data.maxUses, usedCount: 0, isActive: true
      });
      return read<InvitationLink>('invitation_links', code);
    },
    list: (id: string) => list<InvitationLink>('invitation_links', where('campaignId', '==', id), where('isActive', '==', true)),
    async deactivate(code: string) {
      await updateDoc(doc(db, 'invitation_links', code), { isActive: false });
      return message('Link desactivado');
    },
    async join(code: string) {
      const user = currentUser();
      let campaignId = '';
      await runTransaction(db, async tx => {
        const ref = doc(db, 'invitation_links', code);
        const snapshot = await tx.get(ref);
        if (!snapshot.exists()) throw new Error('Código de invitación no válido.');
        const link = snapshot.data();
        if (!link.isActive || link.expiresAt.toMillis() <= Date.now()) throw new Error('El link está desactivado o venció.');
        if (link.maxUses !== -1 && link.usedCount >= link.maxUses) throw new Error('El link alcanzó su máximo de usos.');
        campaignId = link.campaignId;
        const membership = await tx.get(memberRef(campaignId));
        if (membership.exists()) throw new Error('Ya sos miembro de esta campaña.');
        tx.set(memberRef(campaignId), memberData(campaignId, { inviteCode: code }));
        tx.update(ref, { usedCount: link.usedCount + 1, lastJoinedUid: user.uid });
        tx.update(doc(db, 'events', campaignId), { playerIds: arrayUnion(user.uid) });
      });
      return { message: 'Te uniste a la campaña.', campaign: await read<Campaign>('events', campaignId) };
    }
  }
};
