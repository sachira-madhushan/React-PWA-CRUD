import { useEffect, useState } from 'react';
import initDB from './../db/IndexedDB';
import fetchAndStorePosts from './fetchPosts&Store';
const usePostsIDB = () => {
  const [postsFromIDB, setPosts] = useState([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    const getPostsFromDB = async () => {
      const db = await initDB();
      const postsFromDB = await db.getAll('posts');
      setPosts(postsFromDB);
    };

    if (navigator.onLine) {
      // fetchAndStorePosts();
      getPostsFromDB();
      setIsOffline(false);
    } else {
      getPostsFromDB();
    }
  }, []);

  return { postsFromIDB, isOffline };
};

export default usePostsIDB;
