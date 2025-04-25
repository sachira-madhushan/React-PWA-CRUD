import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CRUD from './Pages/CRUD'
import Login from './Pages/auth/Login'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Register from './Pages/auth/Register'
function App() {
  const user= localStorage.getItem("user_login");
  
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/register" element={<Register />} />
        
        {user?
          <Route path="/" element={<CRUD/>} />:<Route path="/" element={<Login />} />
        }
      </Routes>
    </BrowserRouter>
  )
}

export default App
