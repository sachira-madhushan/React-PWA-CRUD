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
  const start_date= localStorage.getItem("start_date");
  const end_date= localStorage.getItem("expire_date");

  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/register" element={<Register />} />
        
        {token&&user&&start_date&&end_date?
          <Route path="/" element={<CRUD/>} />:<Route path="/" element={<Login />} />
        }
      </Routes>
    </BrowserRouter>
  )
}

export default App
