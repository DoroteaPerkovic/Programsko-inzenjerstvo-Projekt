import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Admin from './stranice/Admin.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Admin />
  </StrictMode>,
)
