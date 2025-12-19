import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './stranice/Login'
import Admin from './stranice/Admin'
import Predstavnik from './stranice/Predstavnik'
import Suvlasnici from './stranice/Suvlasnici'
import SastanakAdd from './stranice/sastanakAdd'
import Profil from './stranice/Profil'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/predstavnik" element={<Predstavnik />} />
        <Route path="/suvlasnici" element={<Suvlasnici />} />
        <Route path="/sastanakAdd" element={<SastanakAdd />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/profil" element={<Profil />} />

      </Routes>
    </Router>
  )
}

export default App
