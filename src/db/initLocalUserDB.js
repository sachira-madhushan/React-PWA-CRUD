// src/db.js
import { openDB } from 'idb';

const initLocalUserDB = async () => {
  const db = await openDB('localUsersDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });
  
  return db;
};

export default initLocalUserDB;
