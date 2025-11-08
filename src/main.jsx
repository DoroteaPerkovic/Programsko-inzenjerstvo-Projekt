import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Suvlasnici from './stranice/Suvlasnici.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suvlasnici />
  </StrictMode>,
)
