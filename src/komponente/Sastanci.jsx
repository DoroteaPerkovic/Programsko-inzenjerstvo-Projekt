import React, { useEffect, useState } from "react";
import "./Sastanci.css";
import { useNavigate } from "react-router-dom";

const sastanciData = [
  {
    id: 1,
    naslov: "Redoviti sastanak suvlasnika - Studeni 2025",
    sazetak: "Rasprava o planu održavanja fasade i čišćenju stubišta.",
    vrijeme: "2025-11-10T18:00",
    mjesto: "Upraviteljev ured, Savska cesta 45",
    stanje: "Objavljen",
    točkeDnevnogReda: [
      { naziv: "Obnova fasade", pravniUcinak: true, glasanje: true },
      {
        naziv: "Odabir tvrtke za čišćenje",
        pravniUcinak: false,
        glasanje: true,
      },
    ],
    brojPotvrdjenihSudjelovanja: 7,
  },
  {
    id: 2,
    naslov: "Hitni sastanak - Popravak lifta",
    sazetak: "Razmatranje ponude za hitni servis lifta i troškove popravka.",
    vrijeme: "2025-11-15T19:30",
    mjesto: "Online (Teams poveznica)",
    stanje: "Planiran",
    točkeDnevnogReda: [
      {
        naziv: "Odobrenje troška popravka lifta",
        pravniUcinak: true,
        glasanje: true,
      },
    ],
    brojPotvrdjenihSudjelovanja: 4,
  },
  {
    id: 3,
    naslov: "Godišnji sastanak suvlasnika - Prosinac 2025",
    sazetak:
      "Planirani troškovi i budžet za 2026. te prijedlozi uređenja okućnice.",
    vrijeme: "2025-12-20T17:00",
    mjesto: "Društvena prostorija zgrade, Trg Zrinjskog 8",
    stanje: "Arhiviran",
    točkeDnevnogReda: [
      {
        naziv: "Usvajanje financijskog plana za 2026.",
        pravniUcinak: true,
        glasanje: true,
      },
      {
        naziv: "Uređenje zelene površine ispred zgrade",
        pravniUcinak: false,
        glasanje: true,
      },
      {
        naziv: "Postavljanje video-nadzora",
        pravniUcinak: true,
        glasanje: true,
      },
    ],
    brojPotvrdjenihSudjelovanja: 10,
  },
  {
    id: 4,
    naslov: "Godišnji sastanak suvlasnika - Prosinac 2025",
    sazetak:
      "Planirani troškovi i budžet za 2026. te prijedlozi uređenja okućnice.",
    vrijeme: "2025-12-20T17:00",
    mjesto: "Društvena prostorija zgrade, Trg Zrinjskog 8",
    stanje: "Obavljen",
    točkeDnevnogReda: [
      {
        naziv: "Usvajanje financijskog plana za 2026.",
        pravniUcinak: true,
        glasanje: true,
      },
      {
        naziv: "Uređenje zelene površine ispred zgrade",
        pravniUcinak: false,
        glasanje: true,
      },
      {
        naziv: "Postavljanje video-nadzora",
        pravniUcinak: true,
        glasanje: true,
      },
    ],
    brojPotvrdjenihSudjelovanja: 10,
  },
  {
    id: 5,
    naslov: "Godišnji sastanak suvlasnika - Prosinac 2025",
    sazetak:
      "Planirani troškovi i budžet za 2026. te prijedlozi uređenja okućnice.",
    vrijeme: "2026-12-20T17:00",
    mjesto: "Društvena prostorija zgrade, Trg Zrinjskog 8",
    stanje: "Objavljen",
    točkeDnevnogReda: [
      {
        naziv: "Usvajanje financijskog plana za 2026.",
        pravniUcinak: true,
        glasanje: true,
      },
      {
        naziv: "Uređenje zelene površine ispred zgrade",
        pravniUcinak: false,
        glasanje: true,
      },
      {
        naziv: "Postavljanje video-nadzora",
        pravniUcinak: true,
        glasanje: true,
      },
    ],
    brojPotvrdjenihSudjelovanja: 10,
  },
];

function Sastanci({ category, userRole }) {
  const [potvrde, setPotvrde] = useState({});
  const [sastanci, setSastanci] = useState(sastanciData);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("customSastanci") || "[]");
    if (Array.isArray(saved) && saved.length > 0) {
      setSastanci([...sastanciData, ...saved]);
    }
  }, []);

  const handleCheckboxChange = (id, checked) => {
    setPotvrde((prev) => {
      const current = sastanci.find((s) => s.id === id);
      const base = prev[id] ?? current?.brojPotvrdjenihSudjelovanja ?? 0;
      return {
        ...prev,
        [id]: checked ? base + 1 : base - 1,
      };
    });
  };

  return (
    <div className="tijelo">
      <h1 className="Naslov">
        {" "}
        {category ? `${category} sastanci:` : "Sastanci:"}{" "}
      </h1>
      <div className="okvirAS">
        {sastanci
          .filter((sastanak) => {
            if (category === "Planirani") return sastanak.stanje === "Planiran";
            if (category === "Objavljeni")
              return sastanak.stanje === "Objavljen";
            if (category === "Obavljeni") return sastanak.stanje === "Obavljen";
            if (category === "Arhivirani")
              return sastanak.stanje === "Arhiviran";
            return true;
          })

          .map((sastanak) => (
            <div key={sastanak.id} className="sastanakAS">
              <div className={`naslovAS ${sastanak.stanje.toLowerCase()}`}>
                <h3>{sastanak.naslov}</h3>
                {sastanak.stanje === "Planiran" && (
                  <div className="gumbici">
                    <button
                      className="urediBtn"
                      onClick={() => navigate("/sastankAdd")}
                    >
                      Uredi
                    </button>
                    <button className="objaviBtn">Objavi</button>
                  </div>
                )}
                {new Date() > new Date(sastanak.vrijeme) &&
                  sastanak.stanje === "Objavljen" &&
                  userRole !== "Suvlasnik" && (
                    <button className="obavljenBtn">Obavljen</button>
                  )}
                {userRole !== "Suvlasnik" && sastanak.stanje === "Obavljen" && (
                  <div className="gumbici">
                    <button className="dodajZakljBtn">Dodaj zaključak</button>
                    <button className="arhBtn">Arhiviraj</button>
                  </div>
                )}
              </div>
              <div className={`sredina ${sastanak.stanje.toLowerCase()}`}>
                <div className="sazetakAS">
                  <p>{sastanak.sazetak}</p>
                </div>
                <div>
                  <p className={`emoji ${sastanak.stanje.toLowerCase()}`}>
                    Točke dnevnog reda
                  </p>
                  <ul>
                    {sastanak.točkeDnevnogReda.map((toc, idx) => (
                      <li key={idx}>
                        {toc.naziv} {toc.pravniUcinak ? "Ⓟ" : ""}{" "}
                        {toc.glasanje ? <i> - Održat će se glasanje</i> : ""}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className={`emoji ${sastanak.stanje.toLowerCase()}`}>🗓️</p>
                <div className="vrijemeAS">
                  <p>
                    {new Date(sastanak.vrijeme).toLocaleDateString("hr-HR")}
                  </p>
                </div>
                <p className={`emoji ${sastanak.stanje.toLowerCase()}`}>📍</p>
                <div className="mjestoAS">
                  <p>{sastanak.mjesto}</p>
                </div>
                <p className={`emoji ${sastanak.stanje.toLowerCase()}`}>👥</p>
                <p className="psAS">
                  {potvrde[sastanak.id] ?? sastanak.brojPotvrdjenihSudjelovanja}
                </p>
                <p className="kontrolaVisine "></p>
              </div>
              {sastanak.stanje === "Objavljen" && userRole === "Suvlasnik" && (
                <div>
                  <label className={`cbAS ${sastanak.stanje.toLowerCase()}`}>
                    Potvrđujem dolazak
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleCheckboxChange(sastanak.id, e.target.checked)
                      }
                    />
                  </label>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Sastanci;
