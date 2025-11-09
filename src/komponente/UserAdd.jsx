import React, { useState } from 'react';
import './UserAdd.css';
import { createUserByAdmin, refreshAccessToken } from '../services/UserService.js';

function UserAdd() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'suvlasnik',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    let token = localStorage.getItem('access');
    let res = await createUserByAdmin(form, token);
    // If token expired, try to refresh
    if (res.data && res.data.code === 'token_not_valid' && res.data.messages[0].message.includes('expired')) {
      const refresh = localStorage.getItem('refresh');
      const refreshRes = await refreshAccessToken(refresh);
      if (refreshRes.ok && refreshRes.data.access) {
        localStorage.setItem('access', refreshRes.data.access);
        token = refreshRes.data.access;
        res = await createUserByAdmin(form, token);
      } else {
        alert('Refresh token je nevažeći, prijavite se ponovno.');
        return;
      }
    }
    if (res.ok) {
      alert('Korisnik dodan!');
      setForm({ username: '', email: '', password: '', role: 'suvlasnik' });
    } else {
      alert('Greška: ' + JSON.stringify(res.data));
    }
  };

  return (
    <div className="Kontenjer">
      <div className="Blok">
        <div className="ZaglavljeBloka">NOVI KORISNIK</div>
        <div className ="TijeloBloka">
          <form className="Registracija" onSubmit={handleSubmit}>
            <div className="Labeli">
              <div className="polje">
                <label htmlFor="username">Korisničko ime:</label>
                <input type="text" id="username" name="username" placeholder="Unesi ime" required value={form.username} onChange={handleChange} />
              </div>
              <div className="polje">
                <label htmlFor="email">Email adresa:</label>
                <input type="email" id="email" name="email" placeholder="Unesi email" required value={form.email} onChange={handleChange} />
              </div>
              <div className="polje">
                <label htmlFor="password">Lozinka:</label>
                <input type="password" id="password" name="password" placeholder="Unesi lozinku" required value={form.password} onChange={handleChange} />
              </div>
              {/*
              <div className="polje">
                <label htmlFor="stanblog_url">Stan Blog URL:</label>
                <input type="url" id="stanblog_url" name="stanblog_url" placeholder="URL" value={form.stanblog_url} onChange={handleChange} />
              </div>
              */}
            </div>
            <fieldset className="Uloga">
              <legend>ULOGA</legend>
              <label>
                <input type="radio" name="role" value="suvlasnik" checked={form.role === 'suvlasnik'} onChange={handleChange} />
                Suvlasnik
              </label>
              <br />
              <label>
                <input type="radio" name="role" value="predstavnik" checked={form.role === 'predstavnik'} onChange={handleChange} />
                Predstavnik suvlasnika
              </label>
              <br />
            </fieldset>
            <button type="submit">Dodaj</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserAdd;