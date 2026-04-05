const DB_NAME = "postventaDB";
const DB_VERSION = 1;
const STORE_NAME = "partes";

let dbPromise = null;

export function initDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e);
  });

  return dbPromise;
}

export async function saveParte(parte) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const normalized = {
    ...parte,
    id: parte?.part_id || parte?.id || Date.now().toString()
  };

  store.put(normalized);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error("Error al guardar parte"));
    tx.onabort = () => reject(tx.error || new Error("Transacción abortada al guardar parte"));
  });
}

export async function getPartes() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteParte(id) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const getAllReq = store.getAll();

    getAllReq.onsuccess = () => {
      const all = Array.isArray(getAllReq.result) ? getAllReq.result : [];
      const matches = all.filter(p => (p?.id === id) || (p?.part_id === id));

      for (const p of matches) {
        try { store.delete(p.id); } catch (_) {}
      }
    };

    getAllReq.onerror = () => {
      reject(getAllReq.error || new Error("Error al buscar parte a borrar"));
    };

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error("Error al borrar parte"));
    tx.onabort = () => reject(tx.error || new Error("Transacción abortada al borrar parte"));
  });
}
