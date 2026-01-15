import React, { useEffect, useState } from "react";
import "./Sastanci.css";
import { useNavigate } from "react-router-dom";
import {
  getSastanci,
  potvrdaSastanak,
  changeSastanakStatus,
} from "../services/SastanakService";
import { getZakljucciBySastanak } from "../services/ZakljucakService";

const parseLocalDateTime = (dt) => {
  if (!dt) return null;
  const s = String(dt).replace(" ", "T");
  const [datePart, timePartRaw] = s.split("T");
  if (!datePart || !timePartRaw) return new Date(dt);
  const timePart = timePartRaw.slice(0, 8);
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss = 0] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, ss, 0);
};

function Sastanci({ category, userRole }) {
  const [potvrde, setPotvrde] = useState({});
  const [sastanci, setSastanci] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zakljucciData, setZakljucciData] = useState({});
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSastanakId, setSelectedSastanakId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    const fetchSastanci = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching sastanci from API...");
        console.log(
          "Access token:",
          localStorage.getItem("access") ? "Present" : "Missing"
        );

        const data = await getSastanci();
        console.log("Received sastanci data:", data);

        if (!Array.isArray(data)) {
          console.error("API did not return an array:", data);
          throw new Error("Invalid API response");
        }

        const transformedData = data.map((sastanak) => ({
          id: sastanak.id_sastanak,
          naslov: sastanak.naslov,
          sazetak: sastanak.sazetak,
          vrijeme: sastanak.datum_vrijeme,
          mjesto: sastanak.lokacija,
          stanje: sastanak.status?.naziv_status || "Planiran",
          tockeDnevnogReda:
            sastanak.tocke_dnevnog_reda?.map((tocka) => ({
              id_tocke: tocka.id_tocke,
              naziv: tocka.naziv,
              pravniUcinak: tocka.pravni_ucinak,
              glasanje: tocka.glasanje || false,
              poveznica_diskusije: tocka.poveznica_diskusije || "",
              zakljucak: tocka.opis,
            })) || [],
          brojPotvrdjenihSudjelovanja: sastanak.broj_potvrdenih || 0,
        }));

        console.log("Transformed sastanci:", transformedData);
        setSastanci(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching sastanci:", err);
        console.error("Error message:", err.message);
        setError(`Greška pri dohvaćanju sastanaka: ${err.message}`);
        console.log("Using fallback data");
        setSastanci([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSastanci();
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("customSastanci") || "[]");
    if (Array.isArray(saved) && saved.length > 0) {
      setSastanci((prev) => [...prev, ...saved]);
    }
  }, []);

  useEffect(() => {
    const fetchZakljucci = async () => {
      const arhiviraniSastanci = sastanci.filter(s => s.stanje === "Arhiviran");
      
      for (const sastanak of arhiviraniSastanci) {
        try {
          const zakljucci = await getZakljucciBySastanak(sastanak.id);
          setZakljucciData(prev => ({
            ...prev,
            [sastanak.id]: zakljucci
          }));
        } catch (err) {
          console.error(`Error fetching zakljucci for sastanak ${sastanak.id}:`, err);
        }
      }
    };

    if (sastanci.length > 0) {
      fetchZakljucci();
    }
  }, [sastanci]);

  const handleCheckboxChange = async (id, checked) => {
    try {
      await potvrdaSastanak(id, checked);

      setPotvrde((prev) => {
        const current = sastanci.find((s) => s.id === id);
        const base = prev[id] ?? current?.brojPotvrdjenihSudjelovanja ?? 0;
        return {
          ...prev,
          [id]: checked ? base + 1 : base - 1,
        };
      });
    } catch (err) {
      console.error("Error confirming attendance:", err);
      alert("Greška pri potvrđivanju dolaska");
    }
  };

  const handleObjaviClick = (sastanakId) => {
    setSelectedSastanakId(sastanakId);
    setConfirmAction("objava");
    setShowConfirm(true);
  };

  const handleObaviClick = (sastanakId) => {
    setSelectedSastanakId(sastanakId);
    setConfirmAction("obavljanje");
    setShowConfirm(true);
  };

  const handleArhivirajClick = (sastanakId) => {
    setSelectedSastanakId(sastanakId);
    setConfirmAction("arhiva");
    setShowConfirm(true);
  };

  const confirmStatusChange = async () => {
    setShowConfirm(false);

    try {
      const newStatus = {
        objava: "Objavljen",
        obavljanje: "Obavljen",
        arhiva: "Arhiviran",
      }[confirmAction];

      const result = await changeSastanakStatus(selectedSastanakId, newStatus);

      if (result.ok) {
        setSastanci((prev) =>
          prev.map((s) =>
            s.id === selectedSastanakId ? { ...s, stanje: newStatus } : s
          )
        );

        const toastText = {
          objava: "Sastanak objavljen!",
          obavljanje: "Sastanak označen kao obavljen!",
          arhiva: "Sastanak arhiviran!",
        }[confirmAction];

        setToastMessage(toastText);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert("Greška pri promjeni statusa sastanka");
      }
    } catch (err) {
      console.error("Error changing meeting status:", err);
      alert("Greška pri promjeni statusa sastanka");
    }

    setSelectedSastanakId(null);
    setConfirmAction(null);
  };

  const cancelObjava = () => {
    setShowConfirm(false);
  };

  return (
    <div className="tijelo">
      <h1 className="Naslov">
        {" "}
        {category ? `${category} sastanci` : "Sastanci:"}{" "}
      </h1>
      <hr className={`pregrada ${category ? category.toLowerCase() : ""}`} />

      {loading && <p style={{color:"black"}}>Učitavanje sastanaka...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

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
                <h3 className="razmak">{sastanak.naslov}</h3>
                {sastanak.stanje === "Planiran" && (
                  <div className="gumbici">
                    <button
                      className="urediBtn"
                      onClick={() =>
                        navigate("/sastanakAdd", {
                          state: { sastanakId: sastanak.id },
                        })
                      }
                    >
                      Uredi
                    </button>
                    <button
                      className="objaviBtn"
                      onClick={() => handleObjaviClick(sastanak.id)}
                    >
                      Objavi
                    </button>
                    {showToast && (
                      <div className="toast success">{toastMessage}</div>
                    )}
                  </div>
                )}
                {Date.now() > parseLocalDateTime(sastanak.vrijeme)?.getTime() &&
                  sastanak.stanje === "Objavljen" &&
                  userRole !== "Suvlasnik" && (
                    <button
                      className="obavljenBtn"
                      onClick={() => handleObaviClick(sastanak.id)}
                    >
                      Obavljen
                    </button>
                  )}
                {showConfirm && (
                  <div className="modalOverlay">
                    <div className="modal">
                      <p>
                        {confirmAction === "objava" &&
                          "Jeste li sigurni da želite objaviti sastanak (time šaljete mail svim suvlasnicima)?"}
                        {confirmAction === "obavljanje" &&
                          "Jeste li sigurni da želite označiti ovaj sastanak kao obavljen?"}
                        {confirmAction === "arhiva" &&
                          "Jeste li sigurni da želite arhivirati sastanak?"}
                      </p>
                      <div className="modalButtons">
                        <button onClick={confirmStatusChange}>Da</button>
                        <button onClick={cancelObjava}>Ne</button>
                      </div>
                    </div>
                  </div>
                )}
                {userRole !== "Suvlasnik" && sastanak.stanje === "Obavljen" && (
                  <div className="gumbici">
                    <button
                      className="dodajZakljBtn"
                      onClick={() =>
                        navigate("/zakljucak", {
                          state: { sastanakId: sastanak.id },
                        })
                      }
                    >
                      Dodaj zaključak
                    </button>
                    <button
                      className="arhBtn"
                      onClick={() => handleArhivirajClick(sastanak.id)}
                    >
                      Arhiviraj
                    </button>
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
                    {(sastanak.tockeDnevnogReda || []).map((toc, idx) => {
                      const tockaZakljucci = zakljucciData[sastanak.id]?.find(
                        z => z.id_tocke === toc.id_tocke
                      );
                      const zakljucakTekst = tockaZakljucci?.zakljucci?.[0]?.tekst;
                      const zakljucakStatus = tockaZakljucci?.zakljucci?.[0]?.status;
                      
                      return (
                        <li key={idx}>
                          <div>
                            {toc.naziv} {toc.pravniUcinak ? "Ⓟ" : ""}{" "}
                            {toc.glasanje ? <i> - Održat će se glasanje</i> : ""}
                          </div>
                          {toc.poveznica_diskusije && (
                            <div style={{ marginTop: "5px", fontSize: "0.9em" }}>
                              <a 
                                href={toc.poveznica_diskusije} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: "#007bff", textDecoration: "underline" }}
                              >
                                🔗 Povezana diskusija
                              </a>
                            </div>
                          )}
                          {sastanak.stanje === "Arhiviran" && (
                            <div className="zaklj">
                              <strong>Zaključak:</strong>{" "}
                              {zakljucakTekst || "Zaključak nije unesen."}
                              {zakljucakStatus && (
                                <span style={{ marginLeft: "10px", fontStyle: "italic", color: zakljucakStatus === "Izglasan" ? "green" : "red" }}>
                                  ({zakljucakStatus})
                                </span>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <p className={`emoji ${sastanak.stanje.toLowerCase()}`}>🗓️</p>
                <div className="vrijemeAS">
                  <p>
                    {String(sastanak.vrijeme).slice(0, 16).replace("T", " ")}
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
                    Potvrđujem dolazak{" "}
                    {/*tu bi se zbilja trebalo zapisivati broj potvrdenih dolazaka */}
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
      <hr className={`pregrada ${category ? category.toLowerCase() : ""}`} />
    </div>
  );
}

export default Sastanci;
