import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Zakljucak.css";

const testSastanci = [
  {
    id: 1,
    naslov: "Redoviti sastanak suvlasnika - Studeni 2025",
    točkeDnevnogReda: [
      { tekst: "Obnova fasade", pravniUcinak: true, glasanje: true },
      {
        tekst: "Odabir tvrtke za čišćenje",
        pravniUcinak: false,
        glasanje: false,
      },
      { tekst: "Obnova fasade", pravniUcinak: true, glasanje: true },
      {
        tekst: "Odabir tvrtke za čišćenje",
        pravniUcinak: false,
        glasanje: false,
      },
    ],
  },
];

function Zakljucak() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sastanakId } = location.state || {};

  const [sastanak, setSastanak] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("customSastanci") || "[]");
    const allSastanci = [...testSastanci, ...saved];
    const current =
      allSastanci.find((s) => s.id === sastanakId) || allSastanci[0];

    const točke = current.točkeDnevnogReda.map((t) => ({
      ...t,
      zakljucak: t.zakljucak || "",
      glasano: t.glasano ?? null,
    }));

    setSastanak({ ...current, točkeDnevnogReda: točke });
  }, [sastanakId]);

  const handleTockaChange = (index, field, value) => {
    setSastanak((prev) => {
      const noveTocke = [...prev.točkeDnevnogReda];
      noveTocke[index] = { ...noveTocke[index], [field]: value };
      return { ...prev, točkeDnevnogReda: noveTocke };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    for (let t of sastanak.točkeDnevnogReda) {
      if (t.pravniUcinak && t.zakljucak.trim() === "") {
        setError(
          `Zaključak je obavezan za točku "${t.tekst}" s pravnim učinkom!`
        );
        return;
      }
      if (t.glasanje && t.glasano === null) {
        setError(`Molimo označite rezultat glasanja za točku "${t.tekst}"`);
        return;
      }
    }

    setError("");
    alert("Zaključci spremljeni:\n" + JSON.stringify(sastanak, null, 2));
    navigate(-1);
  };

  if (!sastanak) return <p>Učitavanje...</p>;

  return (
    <div className="back">
      <div className="dodavanjeZakljucak">
        <h1>{sastanak.naslov}</h1>
        <form className="formaZakljucak" onSubmit={handleSubmit}>
          <div className="tockeScroll">
            {sastanak.točkeDnevnogReda.map((t, index) => (
              <div key={index} className="tockaRedaZ">
                <div className="goreTockaZ">
                  <strong>{t.tekst}</strong>
                  {t.pravniUcinak && <span className="pravni">Ⓟ</span>}
                  {t.glasanje && <i> (glasanje)</i>}
                </div>
                <div className="zakljucak">
                  <label>
                    Zaključak {t.pravniUcinak && "*"}:
                    <textarea
                      value={t.zakljucak}
                      onChange={(e) =>
                        handleTockaChange(index, "zakljucak", e.target.value)
                      }
                      placeholder="Upiši zaključak"
                    />
                  </label>
                  <div className="glasanjeZakljucak">
                    {t.glasanje && (
                      <>
                        <label>
                          Izglasan:
                          <input
                            type="radio"
                            name={`glasanje-${index}`}
                            checked={t.glasano === true}
                            onChange={() =>
                              handleTockaChange(index, "glasano", true)
                            }
                          />
                        </label>
                        <label>
                          Odbijen:
                          <input
                            type="radio"
                            name={`glasanje-${index}`}
                            checked={t.glasano === false}
                            onChange={() =>
                              handleTockaChange(index, "glasano", false)
                            }
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="actions">
            <button type="submit">Spremi</button>
            <button type="button" onClick={() => navigate(-1)}>
              Natrag
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Zakljucak;
