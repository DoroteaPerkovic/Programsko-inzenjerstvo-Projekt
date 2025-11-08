import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import profilePic from '../assets/pfp.png';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithUsernameAndPassword, loginWithProvider } from '../services/LoginService';
import AuthService from '../services/AuthService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await loginWithUsernameAndPassword(email, password);
      if (result.ok) {
        AuthService.setAuthInfo(result.data);
        console.log('Prijavljeni korisnik:', result.data.username);
        console.log('Uloga korisnika:', result.data.userRole);
        
        switch (result.data.userRole) {
          case 'admin':
            navigate('/sastanci/admin');
            break;
          case 'predstavnik':
            navigate('/sastanci/predstavnik');
            break;
          case 'suvlasnik':
            navigate('/sastanci');
            break;
          default:
            navigate('/sastanci');
        }
      } else {
        alert('Neuspješan login! Provjeri username i lozinku');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Došlo je do greške prilikom prijave. Pokušajte ponovno.');
    }
  };

  const handleGoogleLogin = async (idToken) => {
    try {
      const response = await fetch('http://localhost:8000/api/google-auth/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await response.json();
      
      if (response.ok) {
        AuthService.setAuthInfo(data);
        
        switch (data.userRole) {
          case 'admin':
            navigate('/sastanci/admin');
            break;
          case 'predstavnik':
            navigate('/sastanci/predstavnik');
            break;
          case 'suvlasnik':
            navigate('/sastanci');
            break;
          default:
            navigate('/sastanci');
        }
      } else {
        alert('Google prijava neuspješna: ' + data.error);
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Došlo je do greške prilikom Google prijave. Pokušajte ponovno.');
    }
  };
  

  return (
    <div className="LogInCard">
      <img className="pfp" src={profilePic} alt="Profile" />
      <h2>MEMBER LOGIN</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="email"
          name="email"
          placeholder="Username or Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button type="submit">Login</button>
      </form>
      <GoogleLogin
            onSuccess={credentialResponse => {
                handleGoogleLogin(credentialResponse.credential);
            }}
            onError={() => {
                alert('Google login error!');
            }}
      />
      {/* <>
        <button onClick={() => loginWithProvider('google')}>Login with Google</button>
      </> */}
    </div>
  );
}

export default Login;

