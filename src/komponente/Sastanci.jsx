import React, { useState } from 'react';
import './Sastanci.css'

const sastanciData = [
    {
        id: 1,
        naslov: "Redoviti sastanak suvlasnika - Studeni 2025",
        sazetak: "Rasprava o planu održavanja fasade i čišćenju stubišta.",
        vrijeme: "2025-11-10T18:00",
        mjesto: "Upraviteljev ured, Savska cesta 45",
        stanje: "Objavljen",
        točkeDnevnogReda: [
            { naziv: "Obnova fasade", pravniUcinak: true },
            { naziv: "Odabir tvrtke za čišćenje", pravniUcinak: false }
        ],
        brojPotvrdjenihSudjelovanja: 7
    },
    {
        id: 2,
        naslov: "Hitni sastanak - Popravak lifta",
        sazetak: "Razmatranje ponude za hitni servis lifta i troškove popravka.",
        vrijeme: "2025-11-15T19:30",
        mjesto: "Online (Teams poveznica)",
        stanje: "Planiran",
        točkeDnevnogReda: [
            { naziv: "Odobrenje troška popravka lifta", pravniUcinak: true }
        ],
        brojPotvrdjenihSudjelovanja: 4
    },
    {
        id: 3,
        naslov: "Godišnji sastanak suvlasnika - Prosinac 2025",
        sazetak: "Planirani troškovi i budžet za 2026. te prijedlozi uređenja okućnice.",
        vrijeme: "2025-12-20T17:00",
        mjesto: "Društvena prostorija zgrade, Trg Zrinjskog 8",
        stanje: "Arhiviran",
        točkeDnevnogReda: [
            { naziv: "Usvajanje financijskog plana za 2026.", pravniUcinak: true },
            { naziv: "Uređenje zelene površine ispred zgrade", pravniUcinak: false },
            { naziv: "Postavljanje video-nadzora", pravniUcinak: true }
        ],
        brojPotvrdjenihSudjelovanja: 10
    },
    {
        id: 4,
        naslov: "Godišnji sastanak suvlasnika - Prosinac 2025",
        sazetak: "Planirani troškovi i budžet za 2026. te prijedlozi uređenja okućnice.",
        vrijeme: "2025-12-20T17:00",
        mjesto: "Društvena prostorija zgrade, Trg Zrinjskog 8",
        stanje: "Obavljen",
        točkeDnevnogReda: [
            { naziv: "Usvajanje financijskog plana za 2026.", pravniUcinak: true },
            { naziv: "Uređenje zelene površine ispred zgrade", pravniUcinak: false },
            { naziv: "Postavljanje video-nadzora", pravniUcinak: true }
        ],
        brojPotvrdjenihSudjelovanja: 10
    },
    {
        id: 5,
        naslov: "Godišnji sastanak suvlasnika - Prosinac 2025",
        sazetak: "Planirani troškovi i budžet za 2026. te prijedlozi uređenja okućnice.",
        vrijeme: "2025-12-20T17:00",
        mjesto: "Društvena prostorija zgrade, Trg Zrinjskog 8",
        stanje: "Objavljen",
        točkeDnevnogReda: [
            { naziv: "Usvajanje financijskog plana za 2026.", pravniUcinak: true },
            { naziv: "Uređenje zelene površine ispred zgrade", pravniUcinak: false },
            { naziv: "Postavljanje video-nadzora", pravniUcinak: true }
        ],
        brojPotvrdjenihSudjelovanja: 10
    }
];


function Sastanci({ category }) {
    const [potvrde, setPotvrde] = useState({});

    const handleCheckboxChange = (id, checked) => {
        setPotvrde(prev => ({
            ...prev,
            [id]: checked ? (prev[id] || sastanciData.find(s => s.id === id).brojPotvrdjenihSudjelovanja) + 1
                : (prev[id] || sastanciData.find(s => s.id === id).brojPotvrdjenihSudjelovanja) - 1
        }));
    };

    return (
        <div>
            <h1 className='Naslov'> {category ? `${category} sastanci:` : 'Sastanci:'} </h1>
            <div className='okvirAS'>
                {sastanciData
                    .filter(sastanak => {
                        if (category === "Planirani") return sastanak.stanje === "Planiran";
                        if (category === "Objavljeni") return sastanak.stanje === "Objavljen";
                        if (category === "Obavljeni") return sastanak.stanje === "Obavljen";
                        if (category === "Arhivirani") return sastanak.stanje === "Arhiviran";
                        return true;
                    })

                    .map((sastanak) => (
                        <div key={sastanak.id} className='sastanakAS'>
                            <div className={`naslovAS ${sastanak.stanje.toLowerCase()}`}>
                                <h3>{sastanak.naslov}</h3>
                            </div>
                            <div className={`sredina ${sastanak.stanje.toLowerCase()}`}>
                                <div className='sazetakAS'>
                                    <p>{sastanak.sazetak}</p>
                                </div>
                                <div>
                                    <p className={`emoji ${sastanak.stanje.toLowerCase()}`}>⇢ Točke dnevnog reda ⇠</p>
                                    <ul>
                                        {sastanak.točkeDnevnogReda.map((toc, idx) => (
                                            <li key={idx}>
                                                {toc.naziv} {toc.pravniUcinak ? "Ⓟ" : ""}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className={`emoji ${sastanak.stanje.toLowerCase()}`}>🗓️</p>
                                <div className='vrijemeAS'>
                                    <p>{new Date(sastanak.vrijeme).toLocaleString()}</p>
                                </div>
                                <p className={`emoji ${sastanak.stanje.toLowerCase()}`}>📍</p>
                                <div className='mjestoAS'>
                                    <p>{sastanak.mjesto}</p>
                                </div>
                                <p className={`emoji ${sastanak.stanje.toLowerCase()}`}>👥</p>
                                <p className='psAS'>{potvrde[sastanak.id] ?? sastanak.brojPotvrdjenihSudjelovanja}</p>
                                <p className='kontrolaVisine '></p>
                            </div>
                            <div>
                                <label className={`cbAS ${sastanak.stanje.toLowerCase()}`}>
                                    Potvrđujem dolazak
                                    <input
                                        type="checkbox"
                                        onChange={e => handleCheckboxChange(sastanak.id, e.target.checked)}
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default Sastanci;
