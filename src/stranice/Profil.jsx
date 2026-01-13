import Header from '../komponente/Header.jsx';
import './Profil.css'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { API_URL } from '../config';


function Profil(){

    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const username = localStorage.getItem('username')
    const email = localStorage.getItem('email')
    const role = localStorage.getItem('userRole')

    const handleLogout = () => {
        localStorage.clear();  
        navigate('/', { replace: true });  
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMsg('');
    
        if (newPassword !== confirmPassword) {
          setMsg('Nova lozinka i potvrda se ne podudaraju.');
          return;
        }
    
        try { 
          const token = localStorage.getItem('access');
    
          const res = await fetch(`${API_URL}/api/change-password/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              old_password: oldPassword,
              new_password: newPassword,
            }),
          });
    
          const data = await res.json();
    
          if (!res.ok) {
            setMsg(data.detail || data.error || 'Greška pri promjeni lozinke.');
          } else {
            setMsg('Lozinka je uspješno promijenjena.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }
        } catch (err) {
          setMsg('Greška na serveru. Pokušajte kasnije.');
        }
      };
 
  return(
    <>
    <Header userRole={role}/>
    <div className="blockProfila">

        <div className="podatci">
            <h2 className='naslov1'>Vaši podatci:</h2>
            <p className='podElm'><i>Korisničko ime:</i> <span>{username}</span></p>
            <p className='podElm'><i>Email: </i> <span>{email}</span></p>
            <p className='podElm'><i>Uloga:</i> <span>{role}</span> </p>

            <button 
            type="button" 
            className="logout-btn"  
            onClick={handleLogout}
            >
            Odjavi se
            </button>
        </div>

        <form className="password-form" onSubmit={handleChangePassword}>
            <h2>Promjena lozinke</h2>
            
            <div className="unosLozinke">
                <label>Stara lozinka:</label>
                <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                />
            </div>

            <div className="unosLozinke">
                <label>Nova lozinka:</label>
                <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                />
            </div>

            <div className="unosLozinke">
                <label>Potvrdi novu lozinku:</label>
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                />
            </div>

            {msg && <p style={{ color: 'red' }}>{msg}</p>}
            <button type="submit">Promijeni lozinku</button>
        </form>
    </div>
    </>
  );

}

export default Profil;