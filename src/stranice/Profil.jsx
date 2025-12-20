import Header from '../komponente/Header.jsx';
import './Profil.css'


function Profil(){

    const username = localStorage.getItem('username')
    const email = localStorage.getItem('email')
    const role = localStorage.getItem('userRole')

 
  return(
    <>
    <Header userRole={role}/>
    <div className="blockProfila">

        <div className="podatci">
            <h2 className='naslov1'>Vaši podatci:</h2>
            <p className='podElm'><i>Korisničko ime:</i> <span>{username}</span></p>
            <p className='podElm'><i>Email: </i> <span>{email}</span></p>
            <p className='podElm'><i>Uloga:</i> <span>{role}</span> </p>
        </div>

        <form className="password-form">
            <h2>Promjena lozinke</h2>
            
            <div className="unosLozinke">
                <label>Stara lozinka:</label>
                <input
                type="password"
                />
            </div>

            <div className="unosLozinke">
                <label>Nova lozinka:</label>
                <input
                type="password"
                />
            </div>

            <div className="unosLozinke">
                <label>Potvrdi novu lozinku:</label>
                <input
                type="password"
                />
            </div>

            <button type="submit">Promijeni lozinku</button>

        </form>
    </div>
    </>
  );

}

export default Profil;