import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import googleLogo from '../assets/google.png'; 

function GoogleLoginButton() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const login = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
        console.log('Google token (credential):', credentialResponse);
      try {
        const response = await axios.post('https://programsko-inzenjerstvo-projekt-ll9v.onrender.com/api/google-auth/', {
            access_token: credentialResponse.access_token,
        });
        
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
        localStorage.setItem('username', response.data.user.username);

        const userRole = response.data.userRole || response.data.user.role;
        localStorage.setItem('userRole', userRole);

        localStorage.setItem('email', response.data.user.email);

        localStorage.setItem('username', response.data.user.username);

        const role = userRole?.toLowerCase();
        if (role === 'administrator') {
          navigate('/admin');
        } else if (role?.includes('predstavnik')) {
          navigate('/predstavnik');
        } else {
          navigate('/suvlasnici');
        }
      } catch (error) {
        let errorMessage = 'Greška pri Google prijavi. Pokušajte ponovno.';
        if (error.response?.status === 403) {
          errorMessage = 'Nemate pristup ovoj aplikaciji. Kontaktirajte administratora.';
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = `Greška: ${error.message}`;
        }
        setError(errorMessage);
      }
    },
    onError: () => {
      setError('Google prijava je otkazana ili nije uspjela. Pokušajte ponovno.');
    },
  });

  return (
    <div>
      <button type="button" onClick={() => login()} className="google-login-button">
        <img src={googleLogo} alt="Google" className="google-logo" />
        Prijava s Google-om
      </button>
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
    </div>
  );
}

export default GoogleLoginButton;
