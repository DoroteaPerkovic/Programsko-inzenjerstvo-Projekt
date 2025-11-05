import {useState} from 'react';
import './Header.css'
import logo from '../assets/STAN.png'
import profile from '../assets/profile.png'
import archive from '../assets/archive.png'


function Header({userRole, onSelectcategory}) {
    const [showMenu, setShowMenu] = useState(false);
    const menuItems = {
        predstavnik: ["Planirani", "Objavljeni", "Obavljeni", "Arhivirani", "Novi sastanak"],
        suvlasnik: ["Objavljeni", "Arhivirani"],
        admin: []
    };
    const itemsToShow = menuItems[userRole] || [];
    return (
        <>
            <img className="stanLogo" src={logo} alt="Logo" />
            <div className="Headerbox">
                <div className="gornji"></div>
                <div className="doljnji">
                    <div className="lijevo"></div>
                    <div className="desno1"></div>
                    <div className="desno2"
                    onMouseEnter={()=> setShowMenu(true)}
                    onMouseLeave={() => setShowMenu(false)}>
                        <img className="archive" src={archive} alt="archive" />
                        {showMenu && itemsToShow.length > 0 &&(
                            <div className ="Menu">
                                <ul>
                                    {itemsToShow.map((item) => (
                                        <li key = {item} onClick={() => { if(item === "Novi sastanak") return; //tu cemo trebat dodat novu stranicu
                                            onSelectcategory(item);
                                        }}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
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

