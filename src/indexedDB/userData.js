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
        let isMounted = true;

        const initializeDB = async () => {
            try {
                const db = await openDB('userDB', 1, {
                    upgrade(db) {
                        if (!db.objectStoreNames.contains('user')) {
                            db.createObjectStore('user', { keyPath: "key" });
                        }
                    }
                });

                if (isMounted) {
                    setDbInstance(db);
                    await loadData(db);
                } else {
                    db.close();
                }
            } catch (error) {
                console.error("DB Initialization error:", error);
            }
        };

        initializeDB();

        return () => {
            isMounted = false;
            if (dbInstance && !dbInstance.closed) {
                dbInstance.close();
            }
        };
    }, []);

    const waitForDB = async () => {
        if (dbInstance && !dbInstance.closed) return dbInstance;

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (dbInstance && !dbInstance.closed) {
                    clearInterval(interval);
                    resolve(dbInstance);
                }
            }, 50);
        });
    };

    const loadData = async (db) => {
        const name = await getItem("user_name", db);
        const expirationDate = await getItem("expire_date", db);
        const lastSyncDate = await getItem("last_sync", db);
        const package_type = await getItem("package_type", db);
    
        console.log("Loaded from IndexedDB:", {
            name, expirationDate, lastSyncDate, package_type
        });
    
        setUsername(name);
        setExpireDate(expirationDate);
        setLastSync(lastSyncDate);
        setPackageType(package_type);
    
        if (name && expirationDate && lastSyncDate) {
            localStorage.setItem("user_name", name);
            localStorage.setItem("expire_date", expirationDate);
            localStorage.setItem("last_sync", lastSyncDate);
            localStorage.setItem("package_type", package_type);
        } else {
            console.warn("Some values were missing, localStorage not fully set.");
        }
    };
    

    const setUserData = async (expire_date, last_sync, user_name, user_email, user_password, package_type) => {
        try {
            const db = await waitForDB();
            const transaction = db.transaction('user', 'readwrite');
            const store = transaction.objectStore('user');

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
            setPackageType(package_type);

        } catch (error) {
            alert("Error saving data: " + error.message);
        }
    };

    const getItem = async (key, db = null) => {
        try {
            const currentDB = db || await waitForDB();
            const transaction = currentDB.transaction('user', 'readonly');
            const store = transaction.objectStore('user');
            const result = await store.get(key);
            return result?.value ?? null;
        } catch (error) {
            console.error(`Error getting item '${key}':`, error);
            return null;
        }
    };

    const getUserName = async () => await getItem("user_name");

    const getExpireDate = async () => await getItem("expire_date");

    const getPackageType = async () => await getItem("package_type");

    const getLastSyncDate = async () => await getItem("last_sync");

    const setLastSyncDate = async (last_sync) => {
        try {
            const db = await waitForDB();
            const transaction = db.transaction('user', 'readwrite');
            const store = transaction.objectStore('user');

            await store.put({ key: "last_sync", value: last_sync });
            await transaction.done;

            setLastSync(last_sync);
        } catch (error) {
            console.error("Failed to set last sync date:", error);
        }
    };

    const offlineLogin = async (email, password) => {
        const real_email = await getItem("user_email");
        const real_password = await getItem("user_password");

        localStorage.setItem("email", real_email);
        localStorage.setItem("password", real_password);

        const decrypted_password = decryptPassword(real_password, real_email);

        if (!real_email || !real_password) return false;

        const db = await waitForDB();

        await loadData(db);
        
        const passwordMatch = password === decrypted_password;
        return real_email === email && passwordMatch;
    };

    const verifyBeforeSync = async () => {
        const real_email = localStorage.getItem("email");
        const real_password = localStorage.getItem("password");
        const decrypted_password = decryptPassword(real_password, real_email);

        try {
            const response = await axios.post(`${config.URL}/api/v1/auth/login`, {
                email: real_email,
                password: decrypted_password,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                }
            });

            if (response.status === 200 && response.data.user?.status == 1) {
                localStorage.setItem("token", response.data.token);
                await setUserData(
                    response.data.expire_date,
                    response.data.last_sync,
                    response.data.user.name,
                    response.data.user.email,
                    decrypted_password,
                    response.data.package_type
                );
            }
        } catch (error) {
            console.error("Verify sync failed:", error);
        }
    };

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
