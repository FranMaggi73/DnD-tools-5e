import {doc,getDoc,runTransaction,serverTimestamp} from 'firebase/firestore';import {db} from '$lib/firebase';import {currentUser} from './firestore';import {libraryPreferences,type Favorite,type LibrarySearch} from '$lib/rules/library';
export const libraryPreferencesApi={
 async get(){const snapshot=await getDoc(doc(db,'catalog_preferences',currentUser().uid));return libraryPreferences(snapshot.data()?.savedJson);},
 async change(change:{favorite:Favorite}|{recent:LibrarySearch}) {
  let result=libraryPreferences(null);await runTransaction(db,async tx=>{const ref=doc(db,'catalog_preferences',currentUser().uid);const snapshot=await tx.get(ref);result=libraryPreferences(snapshot.data()?.savedJson);
   if('favorite'in change){const f=change.favorite;const found=result.favorites.some(v=>v.kind===f.kind&&v.key===f.key);result.favorites=found?result.favorites.filter(v=>v.kind!==f.kind||v.key!==f.key):[f,...result.favorites].slice(0,200);}
   else {const id=JSON.stringify(change.recent);result.recent=[change.recent,...result.recent.filter(v=>JSON.stringify(v)!==id)].slice(0,12);}
   result=libraryPreferences(result);tx.set(ref,{savedJson:JSON.stringify(result),updatedAt:serverTimestamp()});
  });return result;
 }
};
