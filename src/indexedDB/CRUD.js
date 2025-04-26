import { use, useEffect, useState } from 'react';
import initDB from '../db/IndexedDB';
import axios from 'axios';
import fetchAndStorePosts from './fetchPosts&Store';
import userData from './userData'
import config from '../configs/config';
import moment from 'moment-timezone';
const idbPostCRUD = () => {
    const [postsIDB, setPosts] = useState([]);
    const [allPostsIDB, setAllPostsIDB] = useState([]);
    const [db, setDb] = useState(null);
    const [syncStatus, setSyncStatus] = useState(false);
    const { setLastSyncDate } = userData();

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
        post.created_at = moment().format("YYYY-MM-DD HH:mm:ss");
        post.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
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
                post.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
                await db.put('posts', post);

                getPostsIDB();
            }

        }
    };


    const sync = async () => {

        try {
            const response = await axios.post(config.URL + "/api/v1/posts/sync", {
                posts: allPostsIDB
            },

                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    }
                });
            if (response.status == 200) {
                // db.transaction('posts', 'readwrite').objectStore('posts').clear();
                await fetchAndStorePosts();
                await getPostsIDB();
                alert("Successfully sync with cloud")
                setLastSyncDate(response.data.last_sync);
            } else {
                alert("Error while syncing posts with cloud");
            }

        } catch (error) {
            alert("Your account has been deactivated. Please contact admin to reactivate.");
            // localStorage.clear();
            window.location.reload();
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