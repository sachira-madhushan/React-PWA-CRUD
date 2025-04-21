import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CRUD from './Pages/CRUD'
import Login from './Pages/auth/Login'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Register from './Pages/auth/Register'
function App() {
  const token= localStorage.getItem("token");
  const user= localStorage.getItem("user");
  const expire_date= localStorage.getItem("expire_date");
  const last_sync= localStorage.getItem("last_sync");

  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/register" element={<Register />} />
        
        {token&&user&&expire_date&&last_sync?
          <Route path="/" element={<CRUD/>} />:<Route path="/" element={<Login />} />
        }
      </Routes>
    </BrowserRouter>
  )
}

export default App
