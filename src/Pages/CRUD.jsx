import React, { useState, useEffect } from "react";
import axios from "axios";
import usePostsIDB from "../indexedDB/usePosts";
import idbPostCRUD from "../indexedDB/CRUD";

const CRUD = () => {
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const { postsFromIDB, isOffline}=usePostsIDB();
    const { postsIDB,getPostsIDB, addPostIDB, updatePostIDB, deletePostIDB } = idbPostCRUD();

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
        if(!isOffline){
            setPosts(postsIDB);
        }
        

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

        if(!isOffline){
            addPostIDB({ title, body });
        }

    };

    const deletePost = async (id) => {
        // try {
        //     await axios.delete(`http://localhost:4000/posts/${id}`);
        //     setPosts(posts.filter((post) => post.id !== id));
        // } catch (error) {
        //     console.error("Error deleting post:", error);
        // }
        if(!isOffline){
            deletePostIDB({id,title,body});
        }
    };

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
                {posts.map((post) => (
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