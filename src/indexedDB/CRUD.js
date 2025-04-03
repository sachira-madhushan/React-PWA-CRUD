import { use, useEffect, useState } from 'react';
import initDB from '../db/IndexedDB';

const idbPostCRUD = () => {
    const [postsIDB, setPosts] = useState([]);
    const [db, setDb] = useState(null);
    const [syncStatus, setSyncStatus] = useState(true);

    useEffect(() => {
        const initializeDB = async () => {
            const database = await initDB();
            setDb(database);
        };
        initializeDB();
    }, []);

    useEffect(() => {
        getPostsIDB();
    },[db])

    const getPostsIDB = async () => {
        if (db) {
            const allPosts = await db.getAll('posts');
            setPosts(allPosts);
        }
    };

    const addPostIDB = async (id) => {
        if (db) {
            await db.add('posts', id);
            getPostsIDB();
        }
    };


    const updatePostIDB = async (post) => {
        if (db) {
            await db.put('posts', post);
            getPostsIDB();
        }
    };


    const deletePostIDB = async (id) => {
        if (db) {
            await db.delete('posts', id);
            getPostsIDB();
        }
    };


    return {
        syncStatus,
        postsIDB,
        getPostsIDB,
        addPostIDB,
        updatePostIDB,
        deletePostIDB,
    };
};

export default idbPostCRUD;
