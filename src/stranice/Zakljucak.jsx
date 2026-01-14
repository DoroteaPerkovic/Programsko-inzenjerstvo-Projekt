import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Zakljucak.css";
import { getSastanak, changeSastanakStatus } from "../services/SastanakService";
import { createZakljucci } from "../services/ZakljucakService";

function Zakljucak() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sastanakId } = location.state || {};

  const [sastanak, setSastanak] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSastanak = async () => {
      if (!sastanakId) {
        setError("ID sastanka nije pronađen");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getSastanak(sastanakId);
        
        const točke = (data.tocke_dnevnog_reda || []).map((t) => ({
          id_tocke: t.id_tocke,
          tekst: t.naziv,
          pravniUcinak: t.pravni_ucinak || false,
          glasanje: t.glasanje || false,
          zakljucak: "",
          glasano: null,
        }));

        setSastanak({
          id: data.id_sastanak,
          naslov: data.naslov,
          točkeDnevnogReda: točke
        });
      } catch (err) {
        setError("Greška pri dohvaćanju sastanka");
      } finally {
        setLoading(false);
      }
    };

    fetchSastanak();
  }, [sastanakId]);

  const handleTockaChange = (index, field, value) => {
    setSastanak((prev) => {
      const noveTocke = [...prev.točkeDnevnogReda];
      noveTocke[index] = { ...noveTocke[index], [field]: value };
      return { ...prev, točkeDnevnogReda: noveTocke };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let t of sastanak.točkeDnevnogReda) {
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
    setSubmitting(true);

    try {
      const zakljucci = sastanak.točkeDnevnogReda.map((t) => ({
        id_tocke: t.id_tocke,
        tekst: t.zakljucak,
        status: t.glasano === true ? "Izglasan" : t.glasano === false ? "Odbijen" : null,
      }));

      const result = await createZakljucci(zakljucci);

      if (result.ok) {
        const archiveResult = await changeSastanakStatus(sastanak.id, "Arhiviran");
        
        if (archiveResult.ok) {
          alert("Zaključci uspješno spremljeni i sastanak je arhiviran!");
        } else {
          alert("Zaključci su spremljeni, ali sastanak nije mogao biti arhiviran.");
        }
        
        navigate(-1);
      } else {
        setError(result.data?.error || "Greška pri spremanju zaključaka");
      }
    } catch (err) {
      setError("Greška pri spremanju zaključaka. Provjerite internetsku vezu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Učitavanje...</p>;
  if (!sastanak) return <p>Sastanak nije pronađen</p>;

  return (
    <div className="back">
      <div className="dodavanjeZakljucak">
        <h1>{sastanak.naslov}</h1>
        <form className="formaZakljucak" onSubmit={handleSubmit}>
          <div className="tockeScroll">
            {sastanak.točkeDnevnogReda.map((t, index) => (
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
            <button type="submit" disabled={submitting}>
              {submitting ? "Spremanje..." : "Spremi"}
            </button>
            <button type="button" onClick={() => navigate(-1)} disabled={submitting}>
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
