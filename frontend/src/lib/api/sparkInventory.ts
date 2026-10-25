import { collection, deleteDoc, doc, getDocs, query, runTransaction, Timestamp, where } from 'firebase/firestore';
import { db } from '$lib/firebase';
import { currentUser, fromDoc, list, ownedCharacter, read } from './firestore';
import type { Currency, InventoryItem, InventoryResponse } from './inventory';

const emptyCurrency = (): Currency => ({ copper: 0, silver: 0, gold: 0, platinum: 0 });
function clean<T>(data: T): T {
  // Open5e optional properties can contain undefined; Firestore rejects them.
  return JSON.parse(JSON.stringify(data));
}
function stackIdentity(data: Partial<InventoryItem>): string {
  const stable = (value: any): any => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => [key, stable(entry)])) : value;
  return JSON.stringify(stable({ name: data.name?.trim(), type: data.type, description: data.description || '', value: data.value,
    open5eSlug: data.open5eSlug || '', rarity: data.rarity || 'common', weaponData: data.weaponData || null, armorData: data.armorData || null }));
}
export const sparkInventory = {
  async getInventory(characterId: string): Promise<InventoryResponse> {
    const [items, currency] = await Promise.all([
      list<InventoryItem>('inventory_items', where('characterId', '==', characterId)),
      import('firebase/firestore').then(async ({ getDoc }) => {
        const snapshot = await getDoc(doc(db, 'currencies', characterId));
        return snapshot.exists() ? snapshot.data() as Currency : emptyCurrency();
      })
    ]);
    const totalValue = items.reduce((total, item) => total + item.quantity * item.value, 0) +
      currency.copper / 100 + currency.silver / 10 + currency.gold + currency.platinum * 10;
    return { items, currency, totalValue };
  },
  async createItem(characterId: string, data: Pick<InventoryItem, 'name' | 'type' | 'quantity' | 'value'> & Partial<InventoryItem>) {
    currentUser();
    if (!Number.isInteger(data.quantity) || data.quantity < 1 || data.quantity > 999) throw new Error('La cantidad debe ser un entero entre 1 y 999.');
    const identity = stackIdentity(data);
    const items = await getDocs(query(collection(db, 'inventory_items'), where('characterId', '==', characterId)));
    const existing = items.docs.find(entry => stackIdentity(entry.data()) === identity);
    if (!existing && items.size >= 500) throw new Error('El inventario alcanzó el límite de 500 objetos.');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity));
    const key = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, '0')).join('');
    const initialRef = existing?.ref || doc(db, 'inventory_items', `${characterId}_${key}`);
    let savedId = initialRef.id;
    await runTransaction(db, async tx => {
      const character = await ownedCharacter(tx, characterId);
      if ((character as any).deleting) throw new Error('El personaje está siendo eliminado.');
      let ref = initialRef;
      let snapshot = await tx.get(ref);
      // An edited stack keeps its ID, but must never receive items with its old stats.
      if (existing && snapshot.exists() && stackIdentity(snapshot.data()) !== identity) throw new Error('El objeto cambió. Volvé a intentarlo.');
      for (let variant = 1; snapshot.exists() && stackIdentity(snapshot.data()) !== identity; variant++) {
        if (variant > 500) throw new Error('No se pudo crear la variante del objeto.');
        ref = doc(db, 'inventory_items', `${characterId}_${key}_${variant}`);
        snapshot = await tx.get(ref);
      }
      savedId = ref.id;
      if (snapshot.exists()) {
        tx.update(ref, { quantity: snapshot.data().quantity + data.quantity, updatedAt: Timestamp.now() });
        return;
      }
      if (existing) throw new Error('El objeto cambió. Volvé a intentarlo.');
      const { id, campaignId, createdAt, updatedAt, characterId: ignored, ...fields } = data;
      tx.set(ref, { ...clean(fields), id: ref.id, characterId, campaignId: character.campaignId, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    });
    return read<InventoryItem>('inventory_items', savedId);
  },
  async updateItem(id: string, data: Partial<Pick<InventoryItem, 'name' | 'description' | 'quantity' | 'value' | 'weaponData' | 'armorData'>>) {
    const result = await runTransaction(db, async tx => {
      const ref = doc(db, 'inventory_items', id);
      const item = fromDoc<InventoryItem>(await tx.get(ref));
      if (data.quantity !== undefined && data.quantity <= 0) {
        tx.delete(ref);
        return { ...item, quantity: 0 };
      }
      tx.update(ref, { ...clean(data), updatedAt: Timestamp.now() });
      return { ...item, ...data, updatedAt: new Date().toISOString() };
    });
    return result;
  },
  async deleteItem(id: string) {
    currentUser();
    await deleteDoc(doc(db, 'inventory_items', id));
    return { message: 'Objeto eliminado' };
  },
  async updateCurrency(characterId: string, data: Partial<Currency>): Promise<Currency> {
    currentUser();
    return runTransaction(db, async tx => {
      const ref = doc(db, 'currencies', characterId);
      const snapshot = await tx.get(ref);
      const currency = { ...emptyCurrency(), ...(snapshot.exists() ? snapshot.data() : {}), ...data } as Currency;
      for (const amount of Object.values(currency)) {
        if (!Number.isInteger(amount) || amount < 0 || amount > 999999999) throw new Error('Las monedas deben ser enteros entre 0 y 999999999.');
      }
      tx.set(ref, currency);
      return currency;
    });
  }
};
