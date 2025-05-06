import axios from "axios";
import getConfig from "../configs/config";
import { useEffect,useState } from "react";

const userManagement = () => {
    const [users, setUsers] = useState([]);
    const config=getConfig();

    useEffect(
        () => {
            getUsers();
        },[]
    )

    const getUsers = async () => {
        const response = await axios.get(config.LOCAL_HOST + "/api/users", {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
            }
        });

        if (response.status === 200) {
            setUsers(response.data.users);
        }
    }


    const createUser = async (name, email, password, role) => {
        const response = await axios.post(config.LOCAL_HOST + "/api/users", {
            name: name,
            email: email,
            password: password,
            role: role
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('token')}`,
            }
        });

        if (response.status === 201) {
            alert("User created successfully!");
        }
    }

    return {
        users,
        getUsers,
        createUser
    }

}


export default userManagement;