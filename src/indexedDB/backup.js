import { openDB } from 'idb';
import moment from 'moment-timezone';

const useBackup = () => {
    const backupIndexedDB = async () => {
        const db = await openDB('postsDB', 1);
        const backup = {};

        for (const storeName of db.objectStoreNames) {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            backup[storeName] = await store.getAll();
        }

        const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;

        const date_time = moment().format("YYYY-MM-DD HH:mm:ss");
        a.download = 'posts-backup-' + date_time + '.json';
        a.click();

        alert("Backup successfull!\nBackup saved to the downloads.")
    };

    const restoreIndexedDB = async (file) => {
        if(!file){
            alert("Please select your backup file.")
            return;
        }
        const reader = new FileReader();

        reader.onload = async (e) => {
            const json = e.target.result;
            const data = JSON.parse(json);

            const db = await openDB('postsDB', 1, {
                upgrade(db) {
                    for (const storeName in data) {
                        if (!db.objectStoreNames.contains(storeName)) {
                            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
                        }
                    }
                },
            });

            for (const storeName in data) {
                const tx = db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                for (const item of data[storeName]) {
                    await store.put(item);
                }
                await tx.done;
            }

            alert('Post data restore completed!');
        };

        reader.readAsText(file);
    };


    return {
        backupIndexedDB,
        restoreIndexedDB
    }
}

export default useBackup