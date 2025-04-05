import { useEffect, useState } from "react";
import initializeDatabase from "./initializeDB";
const sqlLiteCRUD=async()=>{
    const [db,setDB]=useState(null);
    const [posts,setPosts]=useState([]);

    useEffect(() => {
        initialize();
        
        
    }, []);

    const initialize = async () => {
        const database=await initializeDatabase();
        setDB(database);
    }
    const addPost=(post)=>{
        const { title, body } = post;
        db.run(`INSERT INTO posts (title, body) VALUES (?, ?)`, [title, body]);
    }

    const deletePost=(id)=>{
        db.run(`DELETE FROM posts WHERE id = ?`, [id]);
    }

    const getPosts=()=>{
        const posts = db.exec("SELECT * FROM posts");
        setPosts(posts)
    }

    const saveToIndexedDB = (db) => {
        const data = db.export();
        const request = indexedDB.open("myDb", 1);
      
        request.onsuccess = (event) => {
          const dbRequest = event.target.result;
          const transaction = dbRequest.transaction("sqlite", "readwrite");
          const store = transaction.objectStore("sqlite");
          store.put(data, "dbFile");
        };
      };
      

    return {
        createTable
    }
}

export default sqlLiteCRUD;