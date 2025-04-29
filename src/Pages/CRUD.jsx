
import React, { useState, useEffect } from "react";
import axios from "axios";
import usePostsIDB from "../indexedDB/usePosts";
import idbPostCRUD from "../indexedDB/CRUD";
import fetchAndStorePosts from "../indexedDB/fetchPosts&Store";
import moment from "moment-timezone";
import useUserData from "../indexedDB/userData";
import config from "../configs/config";
import useBackup from '../indexedDB/backup'
const CRUD = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const { isOffline } = usePostsIDB();
    const { postsIDB, allPostsIDB, addPostIDB, deletePostIDB, sync } = idbPostCRUD();
    const [syncStatusLocal, setSyncStatusLocal] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [remaining, setRemaining] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const user_name = localStorage.getItem("user_name");
    const package_type = localStorage.getItem("package_type");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isBackupOpen, setIsBackupOpen] = useState(false);

    const { backupIndexedDB, restoreIndexedDB } = useBackup();

    const [selectedFile, setSelectedFile] = useState(null);

    const [role, setRole] = useState(localStorage.getItem("ROLE"));


    const { setLastSyncDate,verifyBeforeSync } = useUserData();


    const logout = async () => {
        // localStorage.removeItem("user_name");
        // localStorage.removeItem("expire_date");
        // localStorage.removeItem("last_sync");
        // localStorage.removeItem("package_type");
        localStorage.removeItem("user_login");
        localStorage.removeItem("token");
        window.location.reload()
    }
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/json') {
            const filenameRegex = /^posts-backup-\d{4}-\d{2}-\d{2} \d{2}_\d{2}_\d{2}\.json$/;

            if (!filenameRegex.test(file.name)) {
                alert('Please select a valid backup file.');
                return;
            }

            setSelectedFile(file);

        } else {
            alert('Please select a valid backup file.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(config.URL + "/api/v1/auth/login", {
                email: email,
                password: password,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                }
            });

            if (response.status === 200) {

                if (response.data.user.status == 1) {
                    alert("Successfully verified!");
                    localStorage.setItem("token", response.data.token);
                    try {

                        await setUserData(response.data.expire_date, response.data.last_sync, response.data.user.name, response.data.user.email, password, response.package_type);

                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    alert("Your account is not activated yet. Please contact admin.");
                }
            }
            else {
                alert("Invalid credentials. Please try again.");
            }

        } catch (error) {
            alert("Invalid credentials. Please try again.");
        }

        setIsOpen(false);
    };

    useEffect(() => {
        setRole(localStorage.getItem("ROLE"));
        setInterval(() => {
            const timer = async () => {
                const now = moment.tz("Asia/Colombo");

                const last_sync = localStorage.getItem("last_sync");
                const expireDate = localStorage.getItem("expire_date");

                const expire_date = moment.tz(expireDate, "YYYY-MM-DD HH:mm:ss", "Asia/Colombo");

                const last_sync_formatted = moment.tz(last_sync, "YYYY-MM-DD HH:mm:ss", "Asia/Colombo");

                if (now < last_sync_formatted || expire_date < now) {
                    alert("Your system time has been changed. Please correct your system time and login.")
                    localStorage.clear();
                    localStorage.setItem("package_expired", 1)
                    indexedDB.deleteDatabase("usersDB");
                    window.location.reload();
                } else {
                    setLastSyncDate(moment().format("YYYY-MM-DD HH:mm:ss"));
                }


                const diffInMinutes = expire_date.diff(now, 'minutes');

                const diffInSeconds = expire_date.diff(now, 'seconds');

                if (diffInSeconds == 60 * 60 * 24) {
                    alert("Your package will expire in 24 hours. Please contact admin to update your package.")
                } else if (diffInSeconds == 60 * 60) {
                    alert("Your package will expire in 1 hour. Please contact admin to update your package.")

                } else if (diffInSeconds == 30 * 60) {
                    alert("Your package will expire in 30 minutes. Please contact admin to update your package.")
                } else if (diffInSeconds == 15 * 60) {
                    alert("Your package will expire in 15 minutes. Please contact admin to update your package.")

                } else if (diffInSeconds == 5 * 60) {
                    alert("Your package will expire in 5 minutes. Please contact admin to update your package.")
                } else if (diffInSeconds == 1 * 60) {
                    alert("Your package will expire in 1 minute. Please contact admin to update your package.")
                }

                setRemaining(diffInMinutes);
            }

            timer();

        }, 1000);
    }, [remaining]);



    useEffect(() => {


        const intervalId = setInterval(() => {
        
            const autoSync = async () => {
                console.log("called")
                // if (package_type != 1) return;
                console.log("Package online")
                const token = localStorage.getItem("token");
                setIsLoading(true);
    
                if (token) {
                    
                    console.log("Token is available");
                    await sync();
                    setSyncStatusLocal(true);
                } else {
                    console.log("Token generated");
                    await verifyBeforeSync();
                    await sync();
                }
    
                setIsLoading(false);
                fetchPosts();
            };
    
            autoSync();
        }, 15000);
    
        return () => clearInterval(intervalId);
    }, [package_type]);
    

    function formatDuration(minutes) {
        const duration = moment.duration(minutes, 'minutes');

        const years = Math.floor(duration.asYears());
        const months = Math.floor(duration.asMonths() % 12);
        const days = Math.floor(duration.asDays() % 30);
        const hours = Math.floor(duration.asHours() % 24);
        const mins = Math.floor(duration.asMinutes() % 60);

        return `${years}y ${months}mo ${days}d ${hours}h ${mins}m`;
    }


    const fetchPosts = async () => {
        const filteredPosts = allPostsIDB.filter(post => post.syncStatus !== 'synced');
        if (filteredPosts.length > 0) {
            setSyncStatusLocal(false);
        }
        setPosts(postsIDB);


    };

    const createPost = async () => {
        setSyncStatusLocal(false);
        addPostIDB({ title, body });

    };

    const deletePost = async (id) => {
        setSyncStatusLocal(false);
        deletePostIDB(id);
        console.log(posts, postsIDB);

    };

    const syncToCloud = async () => {

        if (isOffline) {
            alert("You are offline. Please connect to the internet to sync.");
        } else {
            const token = localStorage.getItem("token");
            if (token) {
                setIsLoading(true);
                await sync()
                setIsLoading(false)
                setSyncStatusLocal(true);
                fetchPosts();
            } else {
                setIsOpen(true);
            }

        }

    }

    useEffect(() => {
        fetchPosts();
    }, [postsIDB]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {isOffline && package_type == 1 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline"> You are currently offline.</span>
                </div>
            )}
            {
                isLoading && package_type == 1 && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-4 rounded mb-4" role="alert">
                        <span className="block sm:inline">Your posts are auto syncing to the cloud...</span>

                        {/* <button
                            onClick={() => syncToCloud()}
                            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 float-right"
                        >
                            {isLoading ? "Syncing..." : "Sync"}
                        </button> */}
                    </div>
                )
            }
            <div className="bg-green-100 rounded p-2 mb-2 overflow-auto">
                <div className="float-start">
                    <div>
                        <h1 className="pl-2 pt-2 text-green-800">{formatDuration(remaining) + " "}</h1>
                        <h1 className="pl-2 text-red-800 bg-red-100 rounded">{"Role :" + role}</h1>
                    </div>
                </div>
                <div className="float-end">
                    <button type="button" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={() => backupIndexedDB()}>Backup</button>
                    <button type="button" className="bg-green-500 text-white px-4 py-2 mx-2 rounded hover:bg-green-600" onClick={() => setIsBackupOpen(true)}>Restore Backup</button>
                </div>
            </div>
            <div>
                <h1 className="text-2xl font-bold mb-4 float-left">PWA</h1>
                <h1 className="text-2xl font-bold mb-4 float-right">Hello {user_name}!</h1>
                <button type="button" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 float-right mr-2" onClick={() => logout()}>Logout</button>
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
                <button
                    onClick={createPost}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Create Post
                </button>
            </div>
            <div>
                {Array.isArray(posts) && posts.map((post) => (
                    <div
                        key={post.id}
                        className="border p-4 mb-4 rounded shadow-sm flex justify-between items-center"
                    >
                        <div>
                            <h2 className="font-bold">{post.title}</h2>
                            <p>{post.body}</p>
                        </div>
                        <button
                            onClick={() => deletePost(post.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Verify to Sync</h2>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                >
                                    Verify
                                </button>
                                <button
                                    type="button"
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isBackupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <h2 className="text-2xl font-semibold mb-4 text-center">Restore Backup</h2>

                        <form onSubmit={() => restoreIndexedDB(selectedFile)} className="space-y-4">
                            <div>
                                <input
                                    type="file"
                                    id="restore-json"
                                    accept="application/json"

                                    onChange={handleFileSelect}
                                />
                            </div>
                            <div className="flex justify-between items-center">

                                <button
                                    type="submit"
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
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRUD;
