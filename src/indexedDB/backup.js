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

        const date_time = moment.tz("Asia/Colomo").format("YYYY-MM-DD HH:mm:ss");
        a.download = 'posts-backup-' + date_time + '.json';
        a.click();

        alert("Backup successfull!")
    };

    return {
        backupIndexedDB
    }
}

module.exports=useBackup