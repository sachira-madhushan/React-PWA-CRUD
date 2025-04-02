import { useEffect, useState } from 'react';
import initDB from './db';

const usePosts = () => {
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
      fetchAndStorePosts();
      setIsOffline(false);
    } else {
      getPostsFromDB();
    }
  }, []);

  return { postsFromIDB, isOffline };
};

export default usePosts;
