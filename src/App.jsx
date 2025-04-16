import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CRUD from './Pages/CRUD'
import Login from './Pages/auth/Login'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Register from './Pages/auth/Register'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/CRUD" element={<CRUD/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
