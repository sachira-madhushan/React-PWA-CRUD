import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CRUD from './Pages/CRUD'
import Login from './Pages/auth/Login'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './Pages/auth/Register'

function App() {
  const user = localStorage.getItem("user_login");

  useEffect(() => {
    if (window.electron) {
      window.electron.onHostIP((ip) => {
        console.log('Received Host IP from Electron:', ip);
        localStorage.setItem("IP", ip);
      });
  
      window.electron.onRole((role) => {
        console.log('Role determined by Electron:', role);
        localStorage.setItem("ROLE", role);
      });
  
      console.log('Electron bridge is working!');
    } else {
      console.log('No Electron bridge found.');
    }
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
