import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment-timezone";
import useUserData from "../indexedDB/userData";
import getConfig from "../configs/config";
import userManagement from "../local_server/userManagement";

const CRUD = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [remaining, setRemaining] = useState(0);
    const [isBackupOpen, setIsBackupOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [role, setRole] = useState("Please wait...");
    const user_name = localStorage.getItem("user_name");
    const [isOpenManageUsersModel,setOpenManageUsersModel] = useState(false);
    
    const { setLastSyncDate} = useUserData();


    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserRole, setNewUserRole] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");

    const config = getConfig();

    const { createUser, users } = userManagement();

    const logout = () => {
        sessionStorage.removeItem("user_login");
        localStorage.removeItem("token");
        window.location.reload();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.name.endsWith('.db')) {
            const filenameRegex = /^backup-\d{4}-\d{2}-\d{2} \d{2}_\d{2}_\d{2}\.db$/;
            if (!filenameRegex.test(file.name)) {
                alert('Please select a valid .db backup file.');
                return;
            }
            setSelectedFile(file);
        } else {
            alert('Please select a valid .db backup file.');
        }
    };

    useEffect(() => {
        setRole(sessionStorage.getItem("ROLE"));
        const interval = setInterval(() => {
            const roleFromLocalStorage = sessionStorage.getItem("ROLE");
            if (roleFromLocalStorage) {
                setRole(roleFromLocalStorage);
            }

            const now = moment.tz("Asia/Colombo");
            const last_sync = localStorage.getItem("last_sync");
            const expireDate = localStorage.getItem("expire_date");

            if (!last_sync || !expireDate) {
                return;
            }

            const expire_date = moment.tz(expireDate, "YYYY-MM-DD HH:mm:ss", "Asia/Colombo");
            const last_sync_formatted = moment.tz(last_sync, "YYYY-MM-DD HH:mm:ss", "Asia/Colombo");

            if (now.isBefore(last_sync_formatted)) {
                alert("Your system time has been changed. Please correct your system time and login.");
                localStorage.clear();
                indexedDB.deleteDatabase("usersDB");
                sessionStorage.clear();
                window.location.reload();
                return;
            } else if (now.isAfter(expire_date)) {
                alert("Your package has expired. Please contact admin to reactivate.");
                localStorage.clear();
                localStorage.setItem("package_expired", 1);
                indexedDB.deleteDatabase("usersDB");
                sessionStorage.clear();
                window.location.reload();
                return;
            } else {
                const nowFormatted = moment.tz("Asia/Colombo").format("YYYY-MM-DD HH:mm:ss");

                if (now.isAfter(last_sync_formatted)) {
                    setLastSyncDate(nowFormatted);
                    localStorage.setItem("last_sync", nowFormatted);
                }
            }



            const diffInMinutes = expire_date.diff(now, 'minutes');
            const diffInSeconds = expire_date.diff(now, 'seconds');

            if ([1440, 3600, 1800, 900, 300, 60].includes(diffInSeconds)) {
                const minutes = diffInSeconds / 60;
                alert(`Your package will expire in ${minutes} ${minutes > 1 ? "minutes" : "minute"}. Please contact admin to update your package.`);
            }

            setRemaining(diffInMinutes);
        }, 1000);

        return () => clearInterval(interval);
    }, [remaining]);

    const formatDuration = (minutes) => {
        const duration = moment.duration(minutes, 'minutes');
        const years = Math.floor(duration.asYears());
        const months = Math.floor(duration.asMonths() % 12);
        const days = Math.floor(duration.asDays() % 30);
        const hours = Math.floor(duration.asHours() % 24);
        const mins = Math.floor(duration.asMinutes() % 60);
        return `${years}y ${months}mo ${days}d ${hours}h ${mins}m`;
    };

    const fetchPosts = async () => {

        const response = await axios.get(config.LOCAL_HOST + "/api/posts", {});

        if (response.status === 200) {

            const filteredPosts = response.data.posts.filter(post => post.sync_status !== 'deleted');
            setPosts(filteredPosts);
        }

    };

    const createPost = async () => {
        const response = await axios.post(config.LOCAL_HOST + "/api/posts", {
            title: title,
            body: body,
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        });

        if (response.status === 200) {

            const filteredPosts = response.data.posts.filter(post => post.sync_status !== 'deleted');
            setPosts(filteredPosts);
        }
    };

    const deletePost = async (id) => {
        const response = await axios.delete(config.LOCAL_HOST + "/api/posts/" + id, {});

        if (response.status === 200) {
            const filteredPosts = response.data.posts.filter(post => post.sync_status !== 'deleted');
            setPosts(filteredPosts);
        }
    };

    const addUser = async () => {
        if (role == "host") {
            await createUser(newUserName, newUserEmail, newUserPassword, newUserRole);
        }
    }

    const manageUsers = () => {
        setOpenManageUsersModel(true);
    }


    const getBackup = async () => {
        const response = await axios.get(config.LOCAL_HOST + "/api/backup", {});
        if (response.status === 200) {
            alert("Backup saved to downloads folder.")
        }
    }

    const restoreBackup = async () => {
        const formData = new FormData();
        formData.append("backupFile", selectedFile);

        const response = await axios.post(config.LOCAL_HOST + "/api/backup", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Accept": "application/json",
            }
        });

        if (response.status === 200) {
            alert("Backup saved successfully.");
        }
    }

    useEffect(() => {
        fetchPosts();
    }, [posts]);

    return (
        <div className="p-6 max-w-4xl mx-auto">

            <div className="bg-green-100 rounded p-2 mb-2 overflow-auto">
                <div className="float-start">
                    <h1 className="pl-2 pt-2 text-green-800">{formatDuration(remaining) + " "}</h1>
                    <h1 className="pl-2 text-red-800 bg-red-100 rounded">{"Role :" + role}</h1>
                </div>
                {
                    role == "host" && (
                        <div className="float-end">
                            <button type="button" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={() => getBackup()}>Backup</button>
                            <button type="button" className="bg-green-500 text-white px-4 py-2 mx-2 rounded hover:bg-green-600" onClick={() => setIsBackupOpen(true)}>Restore Backup</button>
                        </div>
                    )
                }
            </div>

            <div>
                <h1 className="text-2xl font-bold mb-4 float-left">PWA</h1>
                <h1 className="text-2xl font-bold mb-4 float-right">Hello {user_name}!</h1>
                <button type="button" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 float-right mr-2" onClick={logout}>Logout</button>
                {

                    role == "host" && (

                        <button type="button" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 float-right mr-2" onClick={manageUsers}>Manage Users</button>

                    )
                }
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border p-2 w-full mb-2 rounded"
                />
                <textarea
                    placeholder="Body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="border p-2 w-full mb-2 rounded"
                />
                <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={createPost}>Create Post</button>
            </div>

            <div>
                {posts.map((post, index) => (
                    <div key={index} className="border p-4 mb-2 rounded shadow">
                        <h2 className="text-xl font-semibold">{post.title}</h2>
                        <p>{post.body}</p>
                        {
                            role == "host" && (
                                <button type="button" className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 mt-2" onClick={() => deletePost(post.id)}>Delete</button>
                            )
                        }
                    </div>
                ))}
            </div>
            {isBackupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Restore Backup</h2>

                        <form className="space-y-4">
                            <div>
                                <input
                                    type="file"
                                    id="restore-db"
                                    accept=".db"
                                    onChange={handleFileSelect}
                                />
                            </div>
                            {
                                role === "host" && (
                                    <div className="flex justify-between items-center">

                                        <button
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                await restoreBackup();
                                            }}
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                        >
                                            Restore
                                        </button>
                                        <button
                                            type="button"
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={() => setIsBackupOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )
                            }
                        </form>
                    </div>
                </div>
            )}

            {isOpenManageUsersModel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Add new user</h2>

                        <form onSubmit={() => addUser()} className="space-y-4">
                            <div className="">
                                <input type="text" className="w-full border rounded p-2 mb-2" placeholder="Username" onChange={(e) => setNewUserName(e.target.value)} />
                                <input type="text" className="w-full border rounded p-2 mb-2" placeholder="Email" onChange={(e) => setNewUserEmail(e.target.value)} />
                                <input type="text" className="w-full border rounded p-2 mb-2" placeholder="Role" onChange={(e) => setNewUserRole(e.target.value)} />
                                <input type="text" className="w-full border rounded p-2 mb-2" placeholder="Password" onChange={(e) => setNewUserPassword(e.target.value)} />
                            </div>
                            <div className="flex justify-between items-center">

                                <button
                                    type="submit"
                                    className="bg-green-600 w-full mr-2 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setOpenManageUsersModel(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                            <div>
                                {
                                    users.map((user, index) => (
                                        <div key={user.email || index} className="border rounded ">
                                            <div className="p-2">
                                                <h1>Username : {user.name}</h1>
                                                <h1>Email : {user.email}</h1>
                                                <h1>Role : {user.role}</h1>
                                                <h1>Password : {user.password}</h1>
                                            </div>
                                        </div>
                                    ))
                                }

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRUD;
