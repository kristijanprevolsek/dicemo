import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { migrateStorage } from './lib/migrateStorage'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'

migrateStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
