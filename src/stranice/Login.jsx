import './Login.css'
import profilePic from './assets/pfp.png'

function Login() {
    return (
        <div className='LogInCard'>
            <img className="pfp" src={profilePic} alt="Profile" />
            <h2>MEMBER LOGIN</h2>
            <form>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Email"
                    required
                />
                <br />
                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    required
                />
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
