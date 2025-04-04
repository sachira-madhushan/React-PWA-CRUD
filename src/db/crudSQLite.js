import { useEffect, useState } from "react";
import initializeDatabase from "./initializeDB";
const sqlLiteCRUD=async()=>{
    const [db,setDB]=useState(null);

    useEffect(() => {
        initialize();
        
        
    }, []);

    const initialize = async () => {
        const database=await initializeDatabase();
        setDB(database);
    }
    const createTable=()=>{

    }


    return {
        createTable
    }
}

export default sqlLiteCRUD;