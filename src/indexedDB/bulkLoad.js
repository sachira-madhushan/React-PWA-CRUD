import { openDB } from 'idb';
const addBulkDataToIndexedDB = async (count = 10000) => {
    const db = await openDB('postsDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('posts')) {
                db.createObjectStore('items', { keyPath: 'id' });
            }
        }
    });

    const tx = db.transaction('posts', 'readwrite');
    const store = tx.objectStore('posts');

    for (let i = 0; i < count; i++) {
        await store.put({
            title: `Test Item ${i}`,
            body: `This is a test item number ${i}`,
            syncStatus: 'pending',
        });
    }

    await tx.done;
    console.log(`${count} records added to IndexedDB`);
};

export default addBulkDataToIndexedDB;