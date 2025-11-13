import { useState } from 'react';
import './UserAdd.css';
import { createUserByAdmin, refreshAccessToken } from '../services/UserService.js';

function UserAdd() {
  const [form, setForm] = useState({
    korisnicko_ime: '',
    email: '',
    password: '',
    id_uloge: 3,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    let token = localStorage.getItem('access');
    let res = await createUserByAdmin(form, token)

    if (res.data && res.data.code === 'token_not_valid') {
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setForm({ korisnicko_ime: '', email: '', password: '', id_uloge: 3 });
    } else {
      setErrorMsg(res.data.korisnicko_ime?.[0] || res.data.email?.[0] || res.data.error || JSON.stringify(res.data));
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  return (
    <div className="Kontenjer">
      {showSuccess && <div className="toast success">Korisnik uspješno dodan!</div>}
      {showError && <div className="toast error">{errorMsg}</div>}
      <div className="Blok">
        <div className="ZaglavljeBloka">NOVI KORISNIK</div>
        <div className ="TijeloBloka">
          <form className="Registracija" onSubmit={handleSubmit}>
            <div className="Labeli">
              <div className="polje">
                <label htmlFor="korisnicko_ime">Korisničko ime:</label>
                <input type="text" id="korisnicko_ime" name="korisnicko_ime" placeholder="Unesi ime" required value={form.korisnicko_ime} onChange={handleChange} />
              </div>
              <div className="polje">
                <label htmlFor="email">Email adresa:</label>
                <input type="email" id="email" name="email" placeholder="Unesi email" required value={form.email} onChange={handleChange} />
              </div>
              <div className="polje">
                <label htmlFor="password">Lozinka:</label>
                <input type="password" id="password" name="password" placeholder="Unesi lozinku" required value={form.password} onChange={handleChange} />
              </div>
            </div>
            <fieldset className="Uloga">
              <legend>ULOGA</legend>
              <label>
                <input type="radio" name="id_uloge" value="3" checked={form.id_uloge === 3} onChange={(e) => setForm({ ...form, id_uloge: parseInt(e.target.value) })} />
                Suvlasnik
              </label>
              <br />
              <label>
                <input type="radio" name="id_uloge" value="2" checked={form.id_uloge === 2} onChange={(e) => setForm({ ...form, id_uloge: parseInt(e.target.value) })} />
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
