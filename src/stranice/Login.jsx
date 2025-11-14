import './Login.css'
import profilePic from '../assets/pfp.png'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithUsernameAndPassword } from '../services/LoginService'
import GoogleLoginButton from '../komponente/google'

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
                // Store tokens and user info
                localStorage.setItem('access', result.data.access)
                localStorage.setItem('refresh', result.data.refresh)
                localStorage.setItem('username', result.data.username)
                localStorage.setItem('email', result.data.email)
                localStorage.setItem('userRole', result.data.role)
                localStorage.setItem('userId', result.data.user_id)

                const role = result.data.role
                if (role === 'Administrator') {
                    navigate('/admin')
                } else if (role === 'Predstavnik suvlasnika') {
                    navigate('/predstavnik')
                } else if (role === 'Suvlasnik') {
                    navigate('/suvlasnici')
                } else {
                    navigate('/suvlasnici')
                }
            } else {
                setError('Pogrešno korisničko ime/email ili lozinka')
            }
        } catch (err) {
            console.error('Login error:', err)
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
                <br />
                <GoogleLoginButton setError={setError}/>
            </form>
        </div>
    );
}

export default Login;
