import { use, useEffect, useState } from 'react';
import initDB from '../db/IndexedDB';

const idbPostCRUD = () => {
    const [postsIDB, setPosts] = useState([]);
    const [db, setDb] = useState(null);
    const [syncStatus, setSyncStatus] = useState(false);

    useEffect(() => {
        const initializeDB = async () => {
            const database = await initDB();
            setDb(database);
        };
        initializeDB();
    }, []);

    useEffect(() => {
        getPostsIDB();
    }, [db])

    const getPostsIDB = async () => {
        if (db) {
            const allPosts = await db.getAll('posts');
            const filteredPosts = allPosts.filter(post => post.syncStatus !== 'deleted');
            setPosts(filteredPosts);
        }
    };

    const addPostIDB = async (post) => {
        post.syncStatus = 'pending';
        if (db) {
            await db.add('posts', post);
            getPostsIDB();
        }
    };


    const updatePostIDB = async (post) => {
        if (db) {
            post.syncStatus = 'updated';
            await db.put('posts', post);
            getPostsIDB();
        }
    };


    const deletePostIDB = async (id) => {
        if (db) {
            const post = postsIDB.find((post) => post.id === id);

            if (post) {
                post.syncStatus = 'deleted';
                await db.put('posts', post);
                
                getPostsIDB();
            }

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
