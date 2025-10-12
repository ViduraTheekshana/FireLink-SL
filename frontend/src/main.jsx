import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './index.css'
import { SupplierAuthProvider } from './context/supplierAuth.jsx'
import { AuthProvider } from './context/auth.jsx'

// Google OAuth Client ID - Replace with your actual client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id-here"

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <SupplierAuthProvider>
          <App />
        </SupplierAuthProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);