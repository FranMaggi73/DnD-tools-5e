import storage from './storage';

const key = 'battle';

export async function getLocalState() {
  return storage.getItem(key);
}

export async function setLocalState(value) {
  return storage.setItem(key, value);
}

export async function clearLocalState() {
  return storage.removeItem(key);
}