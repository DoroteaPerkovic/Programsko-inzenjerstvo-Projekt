import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/google.png';

function GoogleLoginButton({ setError }) {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await axios.post('http://localhost:8000/api/dj-rest-auth/google/', {
          access_token: tokenResponse.access_token,
        });
        
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        localStorage.setItem('username', response.data.user.username);
        localStorage.setItem('userRole', response.data.user.role);

        console.log('Response:', response.data.user.username)
        console.log('Response:', response.data.user.role)

        console.log('Login uspješan', response.data);

        if (response.data.user.role === 'admin') {
            navigate('/admin');
        } else if (response.data.user.role === 'predstavnik') {
            navigate('/predstavnik');
        } else {
            navigate('/suvlasnici');
        }
      } catch (error) {
        console.error('Login greška', error);
        setError('Greška pri Google prijavi. Pokušajte ponovno.');
      }
    },
    onError: () => {
      console.log('Google login failed');
      setError('Prijava putem Google-a nije uspjela.');
    },
  });

  return (
    <button type="button" onClick={() => login()} className="google-login-button">
        <img src={googleLogo} alt="Google" className="google-logo" />
        Prijava s Google-om
    </button>
  );
}

export default GoogleLoginButton;
