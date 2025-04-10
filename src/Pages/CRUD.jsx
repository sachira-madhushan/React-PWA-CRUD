
import React, { useState, useEffect } from "react";
import axios from "axios";
import usePostsIDB from "../indexedDB/usePosts";
import idbPostCRUD from "../indexedDB/CRUD";
import fetchAndStorePosts from "../indexedDB/fetchPosts&Store";
import addBulkDataToIndexedDB from "../indexedDB/bulkLoad";

const CRUD = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const { postsFromIDB, isOffline } = usePostsIDB();
    const { postsIDB, allPostsIDB, getPostsIDB, addPostIDB, updatePostIDB, deletePostIDB, sync } = idbPostCRUD();
    const [syncStatusLocal, setSyncStatusLocal] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

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

            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-4 rounded mb-4" role="alert">
                <span className="block sm:inline">Add bulk data</span>

                <button
                    onClick={() => addBulkDataToIndexedDB()}
                    className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 float-right"
                >Add
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">CRUD Posts</h1>
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
