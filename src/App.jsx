import React from 'react'
import CameraDetection from './Componet/CamerDetection'
import { Routes, Route } from "react-router-dom"
import HomePage from './Componet/HomePage'

function App() {
  return (
    <div>
      <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route path="/home" element={ <CameraDetection/> } />
        
      </Routes>
    </div>
  )
}

export default App
