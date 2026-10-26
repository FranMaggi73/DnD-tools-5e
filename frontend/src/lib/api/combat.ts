import {publicCombatant,creatureSpec,templateCreatures,type CreatureSpec} from '$lib/rules/tablePlay';
import {logActivity} from './activity';
import { collection, deleteField, doc, getDocs, query, runTransaction, Timestamp, serverTimestamp, setDoc, where, type Transaction } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { encodeSkills, fromDoc, list, read } from './firestore';
import type { Campaign, Character, Combatant, Encounter } from '$lib/types';
import { advanceEffects, applyHealthAction, encodeRules, normalizeHealth, type HealthAction, type HealthState, type ConditionName, type TimedEffect } from '$lib/rules/2024';

const now = () => Timestamp.now();
const order = (a: Pick<Combatant,'initiative'|'id'>, b: Pick<Combatant,'initiative'|'id'>) => b.initiative - a.initiative || a.id.localeCompare(b.id);
async function active(tx: Transaction, id: string) {
  const encounter = fromDoc<Encounter>(await tx.get(doc(db, 'encounters', id)));
  const campaign = fromDoc<Campaign & { activeEncounterId?: string }>(await tx.get(doc(db, 'events', encounter.campaignId)));
  if (!encounter.isActive || campaign.activeEncounterId !== id) throw new Error('El encuentro ya finalizó o fue reemplazado.');
  return encounter;
}
async function roster(id: string) {
  // Every roster mutation also writes the encounter's rosterVersion. Reading the
  // encounter first makes concurrent additions/removals retry the transaction.
  const snapshot = await getDocs(query(collection(db, 'combatants'), where('encounterId', '==', id)));
  return snapshot.docs.map(entry => fromDoc<Combatant>(entry)).sort(order);
}
function turnAfter(before: Combatant[], after: Combatant[], encounter: Encounter) {
  const index = before.length ? encounter.turnIndex % before.length : 0;
  const id = before[index]?.id;
  const preserved = after.findIndex(entry => entry.id === id);
  const turnIndex=preserved >= 0 ? preserved : after.length ? index % after.length : 0;
  return {
    characterIds: [...new Set(after.map(entry => entry.characterId).filter(Boolean))],
    activeCombatantId:after[turnIndex]?.id||'',
    turnIndex: preserved >= 0 ? preserved : after.length ? index % after.length : 0,
    round: encounter.round + (id && preserved < 0 && after.length && index >= after.length ? 1 : 0),
    rosterVersion: (encounter.rosterVersion || 0) + 1, updatedAt: now()
  };
}
async function characterLink(tx: Transaction, combatant: Combatant) {
  if (!combatant.characterId) return null;
  const ref = doc(db, 'characters', combatant.characterId);
  const snapshot = await tx.get(ref);
  if (!snapshot.exists()) return null;
  const character = fromDoc<Character>(snapshot);
  const identity = character.instanceId || character.createdAt;
  const same = combatant.characterInstanceId ? combatant.characterInstanceId === identity :
    new Date(character.createdAt).getTime() <= new Date(combatant.createdAt).getTime();
  return same ? { ref, character } : null;
}
function healthFields(data: HealthState) {
  return { currentHp: data.currentHp, temporaryHp: data.temporaryHp, deathSaves: data.deathSaves, conditions: data.conditions, rules: encodeRules(data.rules) };
}
function writePublic(tx:Transaction,f:any,created=false) {const ref=doc(db,'combat_public',f.id);if(f.hidden){if(!created)tx.delete(ref);}else tx.set(ref,publicCombatant(f));}
function writeHealth(tx: Transaction, combatant: Combatant, next: HealthState, linked: Awaited<ReturnType<typeof characterLink>>) {
  const patch = healthFields(next);
  tx.update(doc(db, 'combatants', combatant.id), patch);
  writePublic(tx,{...combatant,...next});
  if (linked) tx.update(linked.ref, { ...patch, skillRanks: encodeSkills(linked.character.skills), skills: deleteField(), updatedAt: now() });
}
async function mutate(id: string, transform: (combatant: Combatant) => HealthState, extra: Record<string, unknown> = {}) {
  await runTransaction(db, async tx => {
    const combatant = fromDoc<Combatant>(await tx.get(doc(db, 'combatants', id)));
    const encounter=await active(tx, combatant.encounterId);
    const linked = await characterLink(tx, combatant);
    const next = transform(combatant);
    writeHealth(tx, combatant, next, linked);
    logActivity(tx,encounter.campaignId,`${combatant.name}: vida ${combatant.currentHp} → ${next.currentHp}; temporales ${next.temporaryHp}; ${next.conditions.length} condiciones.`,combatant.type==='creature'?'dm':'public');
    if (Object.keys(extra).length) tx.update(doc(db, 'combatants', id), extra);
  });
  return read<Combatant>('combatants', id);
}

export const combatApi = {
  async createEncounter(campaignId: string, name: string) {
    const ref = doc(collection(db, 'encounters'));
    await runTransaction(db, async tx => {
      const campaignRef = doc(db, 'events', campaignId);
      const campaign = fromDoc<Campaign & { activeEncounterId?: string }>(await tx.get(campaignRef));
      if (campaign.activeEncounterId) throw new Error('Ya hay un encuentro activo.');
      tx.set(ref, { id: ref.id, campaignId, name: name.trim(), isActive: true, round: 1, turnIndex: 0, rosterVersion: 0, activeCombatantId:'',publicVersion:1,characterIds:[],createdAt: now(), updatedAt: now() });
      tx.update(campaignRef, { activeEncounterId: ref.id });
      logActivity(tx,campaignId,`Comenzó el encuentro ${name.trim()}.`);
    });
    return read<Encounter>('encounters', ref.id);
  },
  async getActiveEncounter(id: string) {
    const encounters = await list<Encounter>('encounters', where('campaignId', '==', id), where('isActive', '==', true));
    if (!encounters.length) throw new Error('No hay encuentro activo.');
    return encounters[0];
  },
  async endEncounter(id: string) {
    await runTransaction(db, async tx => {
      const encounter = fromDoc<Encounter>(await tx.get(doc(db, 'encounters', id)));
      // Idempotent: a delayed retry must never clear a newer encounter.
      if (!encounter.isActive) return;
      const campaign = fromDoc<Campaign & { activeEncounterId?: string }>(await tx.get(doc(db, 'events', encounter.campaignId)));
      if (campaign.activeEncounterId !== id) throw new Error('Este encuentro ya no es el activo.');
      tx.update(doc(db, 'encounters', id), { isActive: false, updatedAt: now() });
      tx.update(doc(db, 'events', encounter.campaignId), { activeEncounterId: '' });
      logActivity(tx,encounter.campaignId,'El DM finalizó el encuentro.');
    });
    return { message: 'Encuentro finalizado' };
  },
  async resetEncounter(id: string) {
    await runTransaction(db, async tx => {
      await active(tx, id);
      const fighters=await roster(id);
      tx.update(doc(db, 'encounters', id), {activeCombatantId:fighters[0]?.id||'',round: 1, turnIndex: 0, updatedAt: now() });
    });
    return { message: 'Encuentro reiniciado' };
  },
  async addCombatant(encounterId: string, data: { type: Combatant['type']; characterId?: string; name?: string; initiative: number;
    maxHp: number; currentHp?: number; armorClass: number; imageUrl?: string; isNpc?: boolean; creatureSource?: string; monsterSlug?: string }) {
    const ref = data.type !== 'creature' && data.characterId ? doc(db, 'combatants', `${encounterId}_${data.characterId}`) : doc(collection(db, 'combatants'));
    await runTransaction(db, async tx => {
      const encounter = await active(tx, encounterId);
      const before = await roster(encounterId);
      let character: Character | undefined;
      if (data.type !== 'creature') {
        if (!data.characterId) throw new Error('Seleccioná un personaje.');
        character = fromDoc<Character>(await tx.get(doc(db, 'characters', data.characterId)));
        if (character.campaignId !== encounter.campaignId) throw new Error('El personaje pertenece a otra campaña.');
        if (before.some(entry => entry.characterId === character!.id)) throw new Error('Ese personaje ya participa en el encuentro.');
      }
      const base = character || { currentHp: data.currentHp ?? data.maxHp, class: '', deathSaves: { successes: 0, failures: 0 } };
      const { normalizeRules } = await import('$lib/rules/2024');
      const fighter = {
        id: ref.id, encounterId, type: character ? 'character' : 'creature', characterId: character?.id || '',
        characterInstanceId: character ? character.instanceId || character.createdAt : '',
        name: character?.name || data.name || '', initiative: data.initiative,
        maxHp: character?.maxHp ?? data.maxHp, currentHp: base.currentHp, armorClass: character?.armorClass ?? data.armorClass,
        conditions: character?.conditions || [], temporaryHp: character?.temporaryHp || 0,
        deathSaves: character?.deathSaves || { successes: 0, failures: 0 }, rules: normalizeRules(base),
        imageUrl: character?.imageUrl || data.imageUrl || '', isNpc: data.isNpc ?? !character,
        creatureSource: data.creatureSource || '', ...(data.monsterSlug ? { monsterSlug: data.monsterSlug } : {}), createdAt: now()
      };
      tx.set(ref, { ...fighter, rules: encodeRules(fighter.rules) });
      writePublic(tx,fighter,true);
      logActivity(tx,encounter.campaignId,`${fighter.name} se incorporó al combate.`);
      tx.update(doc(db, 'encounters', encounterId), turnAfter(before, [...before, fighter as unknown as Combatant].sort(order), encounter));
    });
    return read<Combatant>('combatants', ref.id);
  },
  getCombatants: (id: string) => roster(id),
  getPublicCombatants:(id:string)=>list<import('$lib/rules/tablePlay').PublicCombatant>('combat_public',where('encounterId','==',id)),
  async updateCombatant(id: string, data: Partial<Pick<Combatant, 'currentHp' | 'conditions' | 'initiative' | 'deathSaves' | 'temporaryHp'>>) {
    if (data.initiative === undefined) return mutate(id, fighter => normalizeHealth({ ...fighter, ...data }));
    await runTransaction(db, async tx => {
      const fighter = fromDoc<Combatant>(await tx.get(doc(db, 'combatants', id)));
      const encounter = await active(tx, fighter.encounterId);
      const before = await roster(fighter.encounterId);
      const linked = await characterLink(tx, fighter);
      const next = normalizeHealth({ ...fighter, ...data });
      writeHealth(tx, fighter, next, linked);
      tx.update(doc(db, 'combatants', id), { initiative: data.initiative });
      writePublic(tx,{...fighter,...next,initiative:data.initiative});
      tx.update(doc(db, 'encounters', encounter.id), turnAfter(before, before.map(entry => entry.id === id ? { ...entry, initiative: data.initiative! } : entry).sort(order), encounter));
    });
    return read<Combatant>('combatants', id);
  },
  applyCombatantHealth: (id: string, action: HealthAction) => mutate(id, fighter => applyHealthAction(fighter, action)),
  async addCondition(id: string, condition: ConditionName, source: string, rounds: number | null, expires: 'start' | 'end') {
    if (source.trim().length > 100 || (rounds !== null && (!Number.isInteger(rounds) || rounds < 1 || rounds > 1000000))) throw new Error('Origen o duración del efecto inválidos.');
    const effect: TimedEffect = { id: doc(collection(db, 'combatants')).id, condition, source: source.trim(), rounds, expires };
    return mutate(id, fighter => {
      if (fighter.rules.effects.length >= 10) throw new Error('Se permiten hasta 10 efectos simultáneos. Quitá uno antes de agregar otro.');
      return normalizeHealth({ ...fighter,
      conditions: [...new Set([...fighter.conditions, condition])], rules: { ...fighter.rules, effects: [...fighter.rules.effects, effect] }
      });
    });
  },
  removeCondition: (id: string, name: string) => mutate(id, fighter => normalizeHealth({ ...fighter,
    conditions: fighter.conditions.filter(condition => condition !== name),
    rules: { ...fighter.rules, effects: fighter.rules.effects.filter(effect => effect.condition !== name) }
  })),
  async removeCombatant(id: string) {
    await runTransaction(db, async tx => {
      const fighter = fromDoc<Combatant>(await tx.get(doc(db, 'combatants', id)));
      const encounter = await active(tx, fighter.encounterId);
      const before = await roster(encounter.id);
      tx.delete(doc(db, 'combatants', id));
      tx.delete(doc(db,'combat_public',id));
      logActivity(tx,encounter.campaignId,`${fighter.name} salió del combate.`,fighter.hidden?'dm':'public');
      tx.update(doc(db, 'encounters', encounter.id), turnAfter(before, before.filter(entry => entry.id !== id), encounter));
    });
    return { message: 'Combatiente eliminado' };
  },
  async setCombatVisibility(id:string,settings:{hidden:boolean;hideStats:boolean;notes:string}) {
    await runTransaction(db,async tx=>{const fighter=fromDoc<Combatant>(await tx.get(doc(db,'combatants',id)));const encounter=await active(tx,fighter.encounterId);
     const patch={hidden:settings.hidden===true,hideStats:settings.hideStats===true,notes:settings.notes.slice(0,4000)};tx.update(doc(db,'combatants',id),patch);writePublic(tx,{...fighter,...patch});logActivity(tx,encounter.campaignId,`Cambió la visibilidad o notas de ${fighter.name}.`,'dm');});
  },
  async syncPublicCombat(id:string) {
   await runTransaction(db,async tx=>{const encounter=await active(tx,id);const fighters=await roster(id);const publicRows=await getDocs(query(collection(db,'combat_public'),where('encounterId','==',id)));const existing=new Set(publicRows.docs.map(d=>d.id));fighters.forEach(f=>writePublic(tx,f,!existing.has(f.id)));tx.update(doc(db,'encounters',id),{activeCombatantId:fighters[encounter.turnIndex%Math.max(1,fighters.length)]?.id||'',publicVersion:1,characterIds:[...new Set(fighters.map(f=>f.characterId).filter(Boolean))],updatedAt:now()});});
  },
  async addCreatureGroup(encounterId:string,input:any) {
   const spec=creatureSpec(input);const count=input.count??1;if(!Number.isInteger(count)||count<1||count>20)throw Error('Elegí entre 1 y 20 criaturas.');
   const refs=Array.from({length:count},()=>doc(collection(db,'combatants')));const rolls=refs.map(()=>input.rollInitiative?1+Math.floor(Math.random()*20)+spec.initiativeBonus:spec.initiative);
   await runTransaction(db,async tx=>{const encounter=await active(tx,encounterId);const before=await roster(encounterId);const prefix=spec.name.slice(0,90);let number=1;
    const {normalizeRules}=await import('$lib/rules/2024');const fighters=refs.map((ref,i)=>{let name=spec.name;if(count>1||before.some(f=>f.name===name)){while(before.some(f=>f.name===`${prefix} ${number}`))number++;name=`${prefix} ${number++}`;}
     return {...spec,name,initiative:rolls[i],id:ref.id,encounterId,type:'creature' as const,characterId:'',characterInstanceId:'',currentHp:spec.maxHp,temporaryHp:0,conditions:[],deathSaves:{successes:0,failures:0},rules:normalizeRules({currentHp:spec.maxHp}),imageUrl:'',isNpc:true,createdAt:now()};});
    for(const fighter of fighters){tx.set(doc(db,'combatants',fighter.id),{...fighter,rules:encodeRules(fighter.rules)});writePublic(tx,fighter,true);}tx.update(doc(db,'encounters',encounterId),turnAfter(before,[...before,...fighters as any[]].sort(order),encounter));logActivity(tx,encounter.campaignId,`Agregó ${count} criatura(s): ${spec.name}.`,spec.hidden?'dm':'public');
   });
  },
  async saveEncounterTemplate(campaignId:string,name:string,creatures:unknown) {
   const rows=templateCreatures(creatures);if(name.trim().length<3||name.length>100)throw Error('La plantilla necesita un nombre de 3 a 100 caracteres.');const ref=doc(collection(db,'encounter_templates'));await setDoc(ref,{id:ref.id,campaignId,name:name.trim(),creaturesJson:JSON.stringify(rows),updatedAt:serverTimestamp()});
  },
  async startEncounterTemplate(id:string,rollInitiative=false) {
   const template=await read<any>('encounter_templates',id);const creatures=templateCreatures(template.creaturesJson);const ref=doc(collection(db,'encounters'));const refs=creatures.map(()=>doc(collection(db,'combatants')));const rolls=creatures.map(v=>rollInitiative?1+Math.floor(Math.random()*20)+v.initiativeBonus:v.initiative);
   await runTransaction(db,async tx=>{const campaign=fromDoc<Campaign&{activeEncounterId?:string}>(await tx.get(doc(db,'events',template.campaignId)));if(campaign.activeEncounterId)throw Error('Finalizá el encuentro activo antes de usar una plantilla.');const {normalizeRules}=await import('$lib/rules/2024');
    const fighters=creatures.map((spec,i)=>({...spec,id:refs[i].id,encounterId:ref.id,type:'creature' as const,characterId:'',characterInstanceId:'',initiative:rolls[i],currentHp:spec.maxHp,temporaryHp:0,conditions:[],deathSaves:{successes:0,failures:0},rules:normalizeRules({currentHp:spec.maxHp}),imageUrl:'',isNpc:true,createdAt:now()}));fighters.sort(order);
    tx.set(ref,{id:ref.id,campaignId:template.campaignId,name:template.name,isActive:true,round:1,turnIndex:0,rosterVersion:1,activeCombatantId:fighters[0]?.id||'',publicVersion:1,characterIds:[],createdAt:now(),updatedAt:now()});tx.update(doc(db,'events',template.campaignId),{activeEncounterId:ref.id});for(const f of fighters){tx.set(doc(db,'combatants',f.id),{...f,rules:encodeRules(f.rules)});writePublic(tx,f,true);}logActivity(tx,template.campaignId,`Comenzó el encuentro desde la plantilla ${template.name}.`);
   });return read<Encounter>('encounters',ref.id);
  },
  async nextTurn(id: string) {
    await runTransaction(db, async tx => {
      const encounter = await active(tx, id);
      const fighters = await roster(id);
      if (!fighters.length) throw new Error('No hay combatientes en el encuentro.');
      const index = encounter.turnIndex % fighters.length;
      const nextIndex = (index + 1) % fighters.length;
      // Transaction reads ensure concurrent health changes are not overwritten by timers.
      const previous = fromDoc<Combatant>(await tx.get(doc(db, 'combatants', fighters[index].id)));
      const next = nextIndex === index ? previous : fromDoc<Combatant>(await tx.get(doc(db, 'combatants', fighters[nextIndex].id)));
      const previousLink = await characterLink(tx, previous);
      const nextLink = next === previous ? previousLink : await characterLink(tx, next);
      const afterEnd = advanceEffects(previous, 'end');
      if (next === previous) writeHealth(tx, previous, advanceEffects(afterEnd, 'start'), previousLink);
      else {
        writeHealth(tx, previous, afterEnd, previousLink);
        writeHealth(tx, next, advanceEffects(next, 'start'), nextLink);
      }
      tx.update(doc(db, 'encounters', id), { activeCombatantId:next.id,turnIndex: nextIndex, round: encounter.round + (nextIndex === 0 ? 1 : 0), updatedAt: now() });
      logActivity(tx,encounter.campaignId,`Avanzó el turno · ronda ${encounter.round+(nextIndex===0?1:0)}.`);
    });
    return read<Encounter>('encounters', id);
  }
};
