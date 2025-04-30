import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CRUD from './Pages/CRUD'
import Login from './Pages/auth/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './Pages/auth/Register'

function App() {
  // const user = localStorage.getItem("user_login");
  const user =sessionStorage.getItem("user_login");

  useEffect(() => {
    const onHostIP = (e) => {
      const ip = e.detail;
      console.log("Host IP received from Electron:", ip);
      // localStorage.setItem("IP", ip);
      sessionStorage.setItem("IP", ip);
    };

    const onRole = (e) => {
      const role = e.detail;
      console.log("Role received from Electron:", role);
      // localStorage.setItem("ROLE", role);
      sessionStorage.setItem("ROLE", role);
    };

    window.addEventListener('host-ip', onHostIP);
    window.addEventListener('role', onRole);

    return () => {
      window.removeEventListener('host-ip', onHostIP);
      window.removeEventListener('role', onRole);
    };
  }, []);

  
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/register" element={<Register />} />

        {user ?
          <Route path="/" element={<CRUD />} /> : <Route path="/" element={<Login />} />
        }
      </Routes>
    </BrowserRouter>
  )
}

export default App
