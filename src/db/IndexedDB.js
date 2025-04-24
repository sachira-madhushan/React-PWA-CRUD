// src/db.js
import { openDB } from 'idb';

const initDB = async () => {
  const db = await openDB('postsDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('posts')) {
        const store = db.createObjectStore('posts', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });
  
  return db;
};

export default initDB;
