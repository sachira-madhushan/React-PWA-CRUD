import { use, useEffect, useState } from 'react';
import initDB from '../db/IndexedDB';
import axios from 'axios';
import fetchAndStorePosts from './fetchPosts&Store';

const idbPostCRUD = () => {
    const [postsIDB, setPosts] = useState([]);
    const [allPostsIDB, setAllPostsIDB] = useState([]);
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
            setAllPostsIDB(allPosts);
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


    const sync = async () => {

        try {
            const response = await axios.post("http://localhost:4000/posts/sync", {
                posts: allPostsIDB
            },

                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    }
                });
            if (response.status == 200) {
                
                await fetchAndStorePosts();
                await getPostsIDB();
                alert("Successfully sync with cloud")
            } else {
                alert("Error while syncing")
            }

        
        } catch (error) {
            console.error("Error fetching posts:", error);
        }

    }

    return {
        syncStatus,
        postsIDB,
        allPostsIDB,
        getPostsIDB,
        addPostIDB,
        updatePostIDB,
        deletePostIDB,
        sync
    };
};

export default idbPostCRUD;
