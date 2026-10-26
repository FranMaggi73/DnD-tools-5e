import {collection,doc,runTransaction,serverTimestamp,type Transaction} from 'firebase/firestore';import {db} from '$lib/firebase';import {fromDoc} from './firestore';import type {Character} from '$lib/types';import {resourcePools,encodePools,type ResourcePool} from '$lib/rules/tablePlay';import {logActivity} from './activity';
export async function readResources(tx:Transaction,character:Character){const ref=doc(db,'character_resources',character.id);const snapshot=await tx.get(ref);const data=snapshot.data();const pools=data?.instanceId===(character.instanceId||'')?resourcePools(data?.poolsJson):[];return {ref,pools,revision:data?.revision||0};}
export function writeResources(tx:Transaction,character:Character,state:Awaited<ReturnType<typeof readResources>>,pools:ResourcePool[]) {tx.set(state.ref,{characterId:character.id,campaignId:character.campaignId,instanceId:character.instanceId||'',poolsJson:encodePools(pools),revision:state.revision+1,updatedAt:serverTimestamp()});}
export const resourceApi={
 async changeResource(characterId:string,change:{kind:'adjust';id:string;delta:number}|{kind:'save';pool:ResourcePool}|{kind:'remove';id:string}) {
  await runTransaction(db,async tx=>{const character=fromDoc<Character>(await tx.get(doc(db,'characters',characterId)));const state=await readResources(tx,character);let pools=state.pools;
   if(change.kind==='adjust'){if(!Number.isInteger(change.delta)||Math.abs(change.delta)>9999)throw Error('Cantidad inválida.');const pool=pools.find(p=>p.id===change.id);if(!pool)throw Error('El recurso ya no existe.');const next=pool.current+change.delta;if(next<0||next>pool.max)throw Error('La cantidad supera los límites del recurso.');pools=pools.map(p=>p.id===change.id?{...p,current:next}:p);logActivity(tx,character.campaignId,`${character.name}: ${pool.name}, ${pool.current} → ${next}.`);}
   else if(change.kind==='save'){const exists=pools.some(p=>p.id===change.pool.id);pools=exists?pools.map(p=>p.id===change.pool.id?{...change.pool,current:Math.min(p.current,change.pool.max)}:p):[...pools,change.pool];logActivity(tx,character.campaignId,`${character.name}: configuró el recurso ${change.pool.name}.`);}
   else {pools=pools.filter(p=>p.id!==change.id);logActivity(tx,character.campaignId,`${character.name}: quitó un recurso.`);}
   writeResources(tx,character,state,pools);
  });
 },
 newResourceId:()=>doc(collection(db,'character_resources')).id
};
