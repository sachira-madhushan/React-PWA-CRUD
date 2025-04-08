function cacheDataInServiceWorker(data) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            action: 'cacheIDBData',
            data: data,
        });
    }
}


function getDataFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open('postsDB');
        dbRequest.onsuccess = (e) => {
            const db = e.target.result;
            const store = db.transaction('posts', 'readonly').objectStore('posts');
            const allDataRequest = store.getAll();

            allDataRequest.onsuccess = (event) => {
                resolve(event.target.result);
            };
            allDataRequest.onerror = reject;
        };
    });
}


async function restoreDataFromCache() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                if (event.data.action === 'restoreIDBData') {
                    const restoredData = event.data.data;
                    restoreToIndexedDB(restoredData);
                }
            };

            navigator.serviceWorker.controller.postMessage(
                { action: 'loadIDBDataFromCache' },
                [messageChannel.port2]
            );
        });
    }
}


function restoreToIndexedDB(data) {
    const dbRequest = indexedDB.open('yourDatabaseName');
    dbRequest.onsuccess = (e) => {
        const db = e.target.result;
        const store = db.transaction('yourObjectStore', 'readwrite').objectStore('yourObjectStore');

        store.clear();

        data.forEach((item) => {
            store.add(item);
        });
        console.log('Data restored to IndexedDB');
    };
}
