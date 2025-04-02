import initDB from './../db/IndexedDB';

const fetchAndStorePosts = async () => {
  try {
    const response = await fetch('http://localhost:3000/posts');
    const posts = await response.json();

    const db = await initDB();

    const transaction = db.transaction('posts', 'readwrite');
    const store = transaction.objectStore('posts');

    posts.forEach(post => {
      store.put(post);
    });

    await transaction.done;

    console.log('Posts have been successfully stored in IndexedDB!');
  } catch (error) {
    console.error('Error fetching or storing posts:', error);
  }
};

export default fetchAndStorePosts;
