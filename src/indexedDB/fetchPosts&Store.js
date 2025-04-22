import initDB from './../db/IndexedDB';
import axios from 'axios'
import config from '../configs/config';
const fetchAndStorePosts = async () => {

  try {
    const response = await axios.get(config.URL + "/api/v1/posts/",
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        }
      });
    const posts = await response.data.posts;

    const db = await initDB();

    const transaction = db.transaction('posts', 'readwrite');
    const store = transaction.objectStore('posts');
    // localStorage.setItem("last_sync",response.data.last_sync)
    store.clear();
    posts.forEach(post => {
      post.syncStatus = 'synced';
      store.put(post);
    });

    await transaction.done;

    console.log('Posts have been successfully stored in IndexedDB!');
  } catch (error) {
    // localStorage.clear();
    // window.location.reload();
    // console.error('Error fetching or storing posts:', error);
  }
};

export default fetchAndStorePosts;
