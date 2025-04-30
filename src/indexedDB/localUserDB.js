import { useEffect, useState } from 'react';
import initLocalUserDB from '../db/initLocalUserDB';
import axios from 'axios';
import userData from './userData';
import config from '../configs/config';
import moment from 'moment-timezone';

const localUserDB = () => {
    const [usersIDB, setUsers] = useState([]);
    const [allUsersIDB, setAllUsersIDB] = useState([]);
    const [db, setDb] = useState(null);
    const [syncStatus, setSyncStatus] = useState(false);
    const { setLastSyncDate } = userData();

    useEffect(() => {
        const initializeDB = async () => {
            const database = await initLocalUserDB();
            setDb(database);
        };
        initializeDB();
    }, []);

    useEffect(() => {
        getUsersIDB();
    }, [db]);

    const getUsersIDB = async () => {
        if (db) {
            const allUsers = await db.getAll('users');
            setAllUsersIDB(allUsers);
            const filteredUsers = allUsers.filter(user => user.syncStatus !== 'deleted');
            setUsers(filteredUsers);
        }
    };

    const addUserIDB = async (user) => {
        user.syncStatus = 'pending';
        user.created_at = moment().format("YYYY-MM-DD HH:mm:ss");
        user.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
        if (db) {
            await db.add('users', user);
            await getUsersIDB();
        }
    };

    const updateUserIDB = async (user) => {
        if (db) {
            user.syncStatus = 'updated';
            user.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
            await db.put('users', user);
            getUsersIDB();
        }
    };

    const deleteUserIDB = async (id) => {
        if (db) {
            const user = usersIDB.find((u) => u.id === id);
            if (user) {
                user.syncStatus = 'deleted';
                user.updated_at = moment().format("YYYY-MM-DD HH:mm:ss");
                await db.put('users', user);
                getUsersIDB();
            }
        }
    };

    const sync = async () => {
        if (!db) return;
        const allUsers = await db.getAll('users');
        setAllUsersIDB(allUsers);
        try {
            const response = await axios.post(config.URL + "/api/v1/users/sync", {
                users: allUsers
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                }
            });
            if (response.status === 200) {
                await db.transaction('users', 'readwrite').objectStore('users').clear();
                const syncedUsers = response.data.users || [];
                for (const user of syncedUsers) {
                    await db.add('users', user);
                }
                await getUsersIDB();
                setLastSyncDate(response.data.last_sync);
            } else {
                alert("Error while syncing users with cloud");
            }
        } catch (error) {
            console.log("Sync error:", error);
        }
    };

    return {
        syncStatus,
        usersIDB,
        allUsersIDB,
        getUsersIDB,
        addUserIDB,
        updateUserIDB,
        deleteUserIDB,
        sync
    };
};

export default localUserDB;
