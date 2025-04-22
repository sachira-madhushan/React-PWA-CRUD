
import React, { useState, useEffect } from "react";
import axios from "axios";
import usePostsIDB from "../indexedDB/usePosts";
import idbPostCRUD from "../indexedDB/CRUD";
import fetchAndStorePosts from "../indexedDB/fetchPosts&Store";
import moment from "moment-timezone";
import userData from "../indexedDB/userData";

const CRUD = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const { postsFromIDB, isOffline } = usePostsIDB();
    const { postsIDB, allPostsIDB, getPostsIDB, addPostIDB, updatePostIDB, deletePostIDB, sync } = idbPostCRUD();
    const [syncStatusLocal, setSyncStatusLocal] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const { getUserName,getExpireDate } = userData();
    const [user_name, setUsername] = useState();
    const [expireDate,setExpireDate]=useState();
    const [remaining, setRemaining] = useState(0);

    const logout = async () => {
        localStorage.clear();
        // indexedDB.deleteDatabase("postsDB");
        window.location.reload()
    }



    useEffect(() => {
        
        setInterval(() => {
            const timer = async () => {
                const now = moment.tz("Asia/Colombo");
                const last_sync = localStorage.getItem("last_sync");

                const expire_date =await moment.tz(expireDate, "YYYY-MM-DD HH:mm:ss", "Asia/Colombo");
                const last_sync_formatted = moment.tz(last_sync, "YYYY-MM-DD HH:mm:ss", "Asia/Colombo");

                if (now < last_sync_formatted || expire_date < now) {
                    localStorage.clear();
                    window.location.reload();
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
        // try {
        //     const response = await axios.get("http://localhost:4000/posts", {
        //         headers: {

        //             "Content-Type": "application/json",
        //             "Accept": "application/json",
        //         }
        //     });
        //     setPosts(response.data);
        //     console.log(response.data);
        // } catch (error) {
        //     console.error("Error fetching posts:", error);
        // }
        const user = await getUserName();
        setUsername(user);

        const expire_date=await getExpireDate();
        setExpireDate(expire_date);


        const filteredPosts = allPostsIDB.filter(post => post.syncStatus !== 'synced');
        if (filteredPosts.length > 0) {
            setSyncStatusLocal(false);
        }
        setPosts(postsIDB);


    };

    const createPost = async () => {
        // try {
        //     const response = await axios.post("http://localhost:4000/posts", {
        //         title:title,
        //         body:body,
        //     }, {
        //         headers: {

        //             "Content-Type": "application/json",
        //             "Accept": "application/json",
        //         }
        //     });
        //     setPosts([response.data, ...posts]);
        //     setTitle("");
        //     setBody("");
        // } catch (error) {
        //     console.error("Error creating post:", error);
        // }

        setSyncStatusLocal(false);
        addPostIDB({ title, body });

    };

    const deletePost = async (id) => {
        // try {
        //     await axios.delete(`http://localhost:4000/posts/${id}`);
        //     setPosts(posts.filter((post) => post.id !== id));
        // } catch (error) {
        //     console.error("Error deleting post:", error);
        // }
        setSyncStatusLocal(false);
        deletePostIDB(id);
        console.log(posts, postsIDB);

    };

    const syncToCloud = async () => {

        if (isOffline) {
            alert("You are offline. Please connect to the internet to sync.");
        } else {
            setIsLoading(true);
            await sync()
            setIsLoading(false)
            setSyncStatusLocal(true);
            fetchPosts();
        }
        // if (!isOffline) {
        //     try {
        //         const response = await axios.post("http://localhost:4000/posts/sync", {
        //             posts:postsIDB
        //         },

        //             {
        //                 headers: {
        //                     "Content-Type": "application/json",
        //                     "Accept": "application/json",
        //                 }
        //             });
        //         if(response.status==200){
        //             console.log(response.data);
        //             //await fetchAndStorePosts();
        //             // await getPostsIDB();
        //             // await setPosts(postsIDB);
        //             //setSyncStatusLocal(true);
        //             // setPosts(response.data.posts);
        //             alert("Successfully sync with cloud")
        //         }else{
        //             alert("Error while syncing")
        //         }

        //         console.log(response.data);
        //     } catch (error) {
        //         console.error("Error fetching posts:", error);
        //     } finally {
        //         setIsLoading(false);

        //     }

        // } else {

        // }
    }

    useEffect(() => {
        fetchPosts();
    }, [postsIDB]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {isOffline && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline"> You are currently offline.</span>
                </div>
            )}
            {
                !syncStatusLocal && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-4 rounded mb-4" role="alert">
                        <span className="block sm:inline">There are some unsynced Data please sync.</span>

                        <button
                            onClick={() => syncToCloud()}
                            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 float-right"
                        >
                            {isLoading ? "Syncing..." : "Sync"}
                        </button>
                    </div>
                )
            }
            <div>
                <h1 className="">{formatDuration(remaining)}</h1>
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
        </div>
    );
};

export default CRUD;
