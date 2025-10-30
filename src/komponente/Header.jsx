import './Header.css'
import logo from '../assets/STAN.png'
import profile from '../assets/profile.png'
import archive from '../assets/archive.png'


function Header() {
    return (
        <>
            <img className="stanLogo" src={logo} alt="Logo" />
            <div className="Headerbox">
                <div className="gornji"></div>
                <div className="doljnji">
                    <div className="lijevo"></div>
                    <div className="desno1"></div>
                    <div className="desno2">
                        <img className="archive" src={archive} alt="archive" />
                    </div>
                    <div className="desno3">
                        <img className="profile" src={profile} alt="Profile" />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;

