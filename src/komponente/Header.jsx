import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css'
import logo from '../assets/STAN.png'
import profile from '../assets/profile.png'
import filter from '../assets/Filter.png'
import { Link } from 'react-router-dom';


function Header({ userRole, onSelectcategory }) {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const menuItems = {
        predstavnik: ["Planirani", "Objavljeni", "Obavljeni", "Arhivirani", "Novi sastanak"],
        suvlasnik: ["Objavljeni", "Arhivirani"],
        admin: ["Planirani", "Objavljeni", "Obavljeni", "Arhivirani", "Novi sastanak"]
    };
    const itemsToShow = menuItems[userRole] || [];
    return (
        <div>
            <img className="stanLogo" src={logo} alt="Logo" />
            <div className="Headerbox">
                <div className="gornji"></div>
                <div className="doljnji">
                    <div className="lijevo"></div>
                    <div className="desno1"></div>
                    <div className="desno2"
                        onMouseEnter={() => setShowMenu(true)}
                        onMouseLeave={() => setShowMenu(false)}>
                        <img className="filter" src={filter} alt="filter" />
                        {showMenu && itemsToShow.length > 0 && (
                            <div className="Menu">
                                <ul>
                                    {itemsToShow.map((item) => (
                                        <li
                                            key={item}
                                            onClick={() => {
                                                if (item === "Novi sastanak") {
                                                    navigate('/sastanakAdd');
                                                    return;
                                                }
                                                onSelectcategory && onSelectcategory(item);
                                            }}
                                        >
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="desno3">
                        <Link to ="/profil">
                            <img className="profile" src={profile} alt="Profile" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;

