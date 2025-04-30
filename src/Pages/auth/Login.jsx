import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import userData from "../../indexedDB/userData";
import config from "../../configs/config";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setUserData, getUserName, offlineLogin } = userData();
    const [role, setRole] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        login();
    };


    useEffect(() => {

        const interval = setInterval(() => {
            const value = sessionStorage.getItem('ROLE');
            if (value) {
                setRole(value);
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);

    }, []);

    const login = async () => {
        const name = await getUserName();
        const package_type = localStorage.getItem("package_expired");

        if (name && !package_type && navigator.onLine) {
            const result = await offlineLogin(email, password);
            if (result) {
                // localStorage.setItem("user_login", "true");
                sessionStorage.setItem("user_login", "true");
                alert("Login success!");
                window.location.reload();
            } else {
                const expired = localStorage.getItem("package_expired");
                if (expired && expired == 1) {
                    alert("Your package has been expired. Please contact admin to reactivate.")
                } else {
                    alert("Invalid credentials. Please try again.")
                }
            }
        } else {

            if (navigator.onLine) {
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
                            alert("Login successful!");
                            // localStorage.setItem("user_login", "true");
                            sessionStorage.setItem("user_login", "true");
                            localStorage.setItem("token", response.data.token);
                            localStorage.removeItem("package_expired");
                            // localStorage.setItem("user", JSON.stringify(response.data.user));
                            // localStorage.setItem("expire_date", JSON.stringify(response.data.expire_date));
                            // localStorage.setItem("last_sync", JSON.stringify(response.data.last_sync));

                            try {

                                await setUserData(response.data.expire_date, response.data.last_sync, response.data.user.name, response.data.user.email, password, response.data.package_type);

                            } catch (error) {
                                console.log(error);
                            }
                        } else {
                            alert("Your package is not activated yet. Please contact admin.");
                        }
                        window.location.href = "/";
                    }
                    else {
                        alert("Invalid credentials. Please try again.");
                    }

                } catch (error) {
                    alert("Invalid credentials. Please try again.");
                }
            } else {
                alert("Go online to login")
            }

        }

    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        />
                    </div>
                    {
                        //this must be change to !role in production removed for testing
                        role ? (
                            <button
                                disabled
                                type="submit"
                                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                Please wait...
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                Login as {role}
                            </button>
                        )
                    }

                </form>
                <p className="text-sm text-center text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-500 hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;