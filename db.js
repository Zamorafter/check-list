/**
 * db.js - Servicio de Base de Datos IndexedDB para el Checklist de Guardia
 */

const DB_NAME = "ChecklistGuardiaDB";
const DB_VERSION = 1;
const STORE_NAME = "historial_guardias";

let dbInstance = null;

function initDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            return resolve(dbInstance);
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = function(e) {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = function(e) {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };

        request.onerror = function(e) {
            console.error("Error al abrir la base de datos:", e.target.error);
            reject(e.target.error);
        };
    });
}

function saveGuardRecord(record) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!dbInstance) await initDB();

            const transaction = dbInstance.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(record);

            request.onsuccess = function() {
                resolve(record.id);
            };

            request.onerror = function(e) {
                reject(e.target.error);
            };
        } catch (err) {
            reject(err);
        }
    });
}

function getGuardRecord(id) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!dbInstance) await initDB();

            const transaction = dbInstance.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = function(e) {
                resolve(e.target.result);
            };

            request.onerror = function(e) {
                reject(e.target.error);
            };
        } catch (err) {
            reject(err);
        }
    });
}

function deleteGuardRecord(id) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!dbInstance) await initDB();

            const transaction = dbInstance.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = function() {
                resolve();
            };

            request.onerror = function(e) {
                reject(e.target.error);
            };
        } catch (err) {
            reject(err);
        }
    });
}

function getAllGuardRecords() {
    return new Promise(async (resolve, reject) => {
        try {
            if (!dbInstance) await initDB();

            const transaction = dbInstance.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = function(e) {
                resolve(e.target.result);
            };

            request.onerror = function(e) {
                reject(e.target.error);
            };
        } catch (err) {
            reject(err);
        }
    });
}
