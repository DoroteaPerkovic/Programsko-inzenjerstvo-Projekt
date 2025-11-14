import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <GoogleOAuthProvider clientId="826648226919-fpclgpuee5fhdrdb6mas7fevhkkjq2lr.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);