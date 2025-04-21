import { useEffect, useState } from "react";
import { openDB } from "idb";
import bcrypt from 'bcryptjs'

const userData = () => {
    const [db, setDb] = useState();

    useEffect(() => {
        const initializeDB = async () => {

            const db = await openDB('userDB', 1, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains('user')) {
                        const store = db.createObjectStore('user', {
                            keyPath: "key"
                        });
                    }
                },
            });

            setDb(db);

        };
        initializeDB();
    }, []);

    const setUserData = async (expire_date, last_sync, user_name, user_email, user_password) => {
        try {
            const transaction = await db.transaction('user', 'readwrite');
            const store = await transaction.objectStore('user');

            const salt = bcrypt.genSaltSync(10);
            const hashed_password = bcrypt.hashSync(user_password, salt);

            store.put({ key: "expire_date", value: expire_date });
            store.put({ key: "last_sync", value: last_sync });
            store.put({ key: "user_name", value: user_name });
            store.put({ key: "user_email", value: user_email });
            store.put({ key: "user_password", value: hashed_password });
        } catch (error) {
            alert(error)
        }
    }

    const getUserName = async () => {
        
        const transaction = await db.transaction('user', 'readwrite');
        const store = await transaction.objectStore('user');
        return await store.get("user_name");
    }

    const getExpireDate = async () => {

    }

    const setLastSyncDate = async () => {

    }

    const getLastSyncDate = async () => {

    }

    const offlineLogin = async (email, password) => {
        const transaction = await db.transaction('user', 'readwrite');
        const store = await transaction.objectStore('user');
        const real_email=await store.get("user_email");
        const real_password=store.get("user_password");

        if(real_email.value==email && bcrypt.compare(password,real_password.value)){
            return true;
        }else{
            return false;
        }
    }

    return {
        setUserData,
        getUserName,
        offlineLogin
    }

}


export default userData;