import './Login.css'
import profilePic from '../assets/pfp.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithUsernameAndPassword } from '../services/LoginService'

function Login() {
    const [usernameOrEmail, setUsernameOrEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const result = await loginWithUsernameAndPassword(usernameOrEmail, password)
            if (result.ok) {
                localStorage.setItem('access', result.data.access)
                localStorage.setItem('refresh', result.data.refresh)
                localStorage.setItem('username', result.data.username)
                localStorage.setItem('userRole', result.data.userRole)
                
                if (result.data.userRole === 'admin') {
                    navigate('/admin')
                } else if (result.data.userRole === 'predstavnik') {
                    navigate('/predstavnik')
                } else {
                    navigate('/suvlasnici')
                }
            } else {
                setError('Pogrešno korisničko ime/email ili lozinka')
            }
        } catch (err) {
            setError('Greška pri prijavljivanju')
        }
    }

    return (
        <div className='LogInCard'>
            <img className="pfp" src={profilePic} alt="Profile" />
            <h2>PRIJAVA KORISNIKA</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    id="usernameOrEmail"
                    name="usernameOrEmail"
                    placeholder="Korisničko ime ili Email"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    required
                />
                <br />
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Lozinka"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <br />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Prijava</button>
            </form>
        </div>
    );
}

export default Login;
