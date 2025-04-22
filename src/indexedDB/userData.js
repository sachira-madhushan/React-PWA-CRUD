import { useEffect, useState } from "react";
import { openDB } from "idb";
import bcrypt from 'bcryptjs';

const useUserData = () => {
  const [dbInstance, setDbInstance] = useState(null);

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
    };

    initializeDB();
  }, []);

  // Wait until DB is ready
  const waitForDB = async () => {
    while (!dbInstance) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return dbInstance;
  };

  const setUserData = async (expire_date, last_sync, user_name, user_email, user_password) => {
    try {
      const db = await waitForDB();
      const transaction = db.transaction('user', 'readwrite');
      const store = transaction.objectStore('user');

      const salt = bcrypt.genSaltSync(10);
      const hashed_password = bcrypt.hashSync(user_password, salt);

      await store.put({ key: "expire_date", value: expire_date });
      await store.put({ key: "last_sync", value: last_sync });
      await store.put({ key: "user_name", value: user_name });
      await store.put({ key: "user_email", value: user_email });
      await store.put({ key: "user_password", value: hashed_password });

      await transaction.done;
    } catch (error) {
      alert("Error saving data: " + error);
    }
  };

  const getItem = async (key) => {
    const db = await waitForDB();
    const transaction = db.transaction('user', 'readonly');
    const store = transaction.objectStore('user');
    const result = await store.get(key);
    return result?.value || null;
  };

  const getUserName = async () => {
    return await getItem("user_name");
  };

  const getExpireDate = async () => {
    return await getItem("expire_date");
  };

  const offlineLogin = async (email, password) => {
    const real_email = await getItem("user_email");
    const real_password = await getItem("user_password");

    const passwordMatch = await bcrypt.compare(password, real_password);

    return real_email === email && passwordMatch;
  };

  return {
    setUserData,
    getUserName,
    getExpireDate,
    offlineLogin
  };
};

export default useUserData;
