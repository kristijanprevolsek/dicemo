import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { migrateStorage } from '../lib/migrateStorage'
import 'leaflet/dist/leaflet.css'
import '../index.css'
import './admin.css'
import { AuthProvider } from '../auth/AuthContext'
import { AdminApp } from './AdminApp'

migrateStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  </StrictMode>,
)
