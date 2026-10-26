import {collection,doc,serverTimestamp,type Transaction} from 'firebase/firestore';import {db} from '$lib/firebase';import {currentUser} from './firestore';
export function logActivity(tx:Transaction,campaignId:string,message:string,visibility:'public'|'dm'='public') {
 const user=currentUser();const ref=doc(collection(db,'campaign_activity'));
 tx.set(ref,{id:ref.id,campaignId,actorId:user.uid,actorName:user.displayName||'Aventurero',message:message.slice(0,1500),visibility,createdAt:serverTimestamp()});
}
