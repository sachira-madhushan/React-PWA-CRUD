import { useEffect, useState } from "react";
import { openDB } from "idb";
import bcrypt from 'bcryptjs';
import { decryptPassword, encryptPassword } from "../security/encrypt";
import axios from "axios";
import config from "../configs/config";
const useUserData = () => {
    const [dbInstance, setDbInstance] = useState(null);

    const [user_name, setUsername] = useState();
    const [expireDate, setExpireDate] = useState();
    const [last_sync, setLastSync] = useState();
    const [packageType, setPackageType] = useState();

    useEffect(() => {
        const initializeDB = async () => {
            const db = await openDB('userDB', 1, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains('user')) {
                        db.createObjectStore('user', { keyPath: "key" });
                    }
                }
            });
            setDbInstance(db);
            await loadData(db);
        };

        initializeDB();
    }, [user_name, expireDate, last_sync]);

    const loadData = async (db) => {
        const name = await getItem("user_name", db);
        const expirationDate = await getItem("expire_date", db);
        const lastSyncDate = await getItem("last_sync", db);
        const package_type = await getItem("package_type", db);

        setUsername(name);
        setExpireDate(expirationDate);
        setLastSync(lastSyncDate);
        setPackageType(package_type);

        if (name && expirationDate, lastSyncDate, package_type) {
            localStorage.setItem("user_name", name);
            localStorage.setItem("expire_date", expirationDate);
            localStorage.setItem("last_sync", lastSyncDate);
            localStorage.setItem("package_type", packageType);
        }
    };

    const waitForDB = async () => {
        while (!dbInstance) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return dbInstance;
    };

    const setUserData = async (expire_date, last_sync, user_name, user_email, user_password, package_type) => {
        try {
            const db = await waitForDB();
            const transaction = db.transaction('user', 'readwrite');
            const store = transaction.objectStore('user');

            // const salt = bcrypt.genSaltSync(10);
            // const hashed_password = bcrypt.hashSync(user_password, salt);

            const encrypted_password = encryptPassword(user_password, user_email);

            await store.put({ key: "expire_date", value: expire_date });
            await store.put({ key: "last_sync", value: last_sync });
            await store.put({ key: "user_name", value: user_name });
            await store.put({ key: "user_email", value: user_email });
            await store.put({ key: "user_password", value: encrypted_password });
            await store.put({ key: "package_type", value: package_type });

            await transaction.done;
            setUsername(user_name);
            setExpireDate(expire_date);
            setLastSync(last_sync);

        } catch (error) {
            alert("Error saving data: " + error);
        }
    };

    const getItem = async (key, db) => {
        const currentDB = db || await waitForDB();
        const transaction = currentDB.transaction('user', 'readonly');
        const store = transaction.objectStore('user');
        const result = await store.get(key);
        return result?.value ?? null;
    };

    const getUserName = async () => {
        return await getItem("user_name");
    };

    const getExpireDate = async () => {
        return await getItem("expire_date");
    };

    const getPackageType = async () => {
        return await getItem("package_type");
    };

    const offlineLogin = async (email, password) => {
        const real_email = await getItem("user_email");
        const real_password = await getItem("user_password");

        localStorage.setItem("email",real_email);
        localStorage.setItem("password",real_password);

        const decrypted_password = decryptPassword(real_password, real_email);
        console.log(decrypted_password, real_email, real_password);

        if (!real_email || !real_password) return false;

        const passwordMatch = password === decrypted_password;

        return real_email === email && passwordMatch;
    };

    const setLastSyncDate = async (last_sync) => {
        const db = await waitForDB();
        const transaction = db.transaction('user', 'readwrite');
        const store = transaction.objectStore('user');

        await store.put({ key: "last_sync", value: last_sync });
        await transaction.done;

        setLastSync(last_sync);
    };

    const getLastSyncDate = async () => {
        return await getItem("last_sync");
    };

    const verifyBeforeSync = async() => {
        const real_email = localStorage.getItem("email");
        const real_password =localStorage.getItem("password");
        const decrypted_password = decryptPassword(real_password, real_email);

        try {
            const response = await axios.post(config.URL + "/api/v1/auth/login", {
                email: real_email,
                password: decrypted_password,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                }
            });
    
            if (response.status === 200) {
    
                if (response.data.user.status == 1) {
                    localStorage.setItem("token", response.data.token);
                    try {
                        
                        await setUserData(response.data.expire_date, response.data.last_sync, response.data.user.name, response.data.user.email, password, response.package_type);
    
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
            console.log(response)
        } catch (error) {
            console.log(error);
        }
    }

    return {
        user_name,
        expireDate,
        last_sync,
        setUserData,
        getUserName,
        getExpireDate,
        offlineLogin,
        setLastSyncDate,
        getLastSyncDate,
        getPackageType,
        verifyBeforeSync
    };
};

export default useUserData;
