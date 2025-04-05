import initDB from './../db/IndexedDB';

const fetchAndStorePosts = async () => {
  try {
    const response = await fetch('https://react-pwa-crud-backend.onrender.com/posts');
    const posts = await response.json();

    const db = await initDB();

    const transaction = db.transaction('posts', 'readwrite');
    const store = transaction.objectStore('posts');
    store.clear();
    posts.forEach(post => {
      post.syncStatus='synced';
      store.put(post);
    });

    await transaction.done;

    console.log('Posts have been successfully stored in IndexedDB!');
  } catch (error) {
    console.error('Error fetching or storing posts:', error);
  }
};

export default fetchAndStorePosts;
