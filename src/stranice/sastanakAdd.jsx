import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./sastanakAdd.css";
import {
  createSastanak,
  updateSastanak,
  getSastanak,
} from "../services/SastanakService";

function SastanakAdd() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sastanakId } = location.state || {};

  const [form, setForm] = useState({
    naslov: "",
    sazetak: "",
    vrijeme: "",
    mjesto: "",
    tockeDnevnogReda: [
      { tekst: "", pravniUcinak: false, potrebnoGlasanje: false },
    ],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSastanak = async () => {
      if (sastanakId) {
        try {
          setLoading(true);
          const data = await getSastanak(sastanakId);

          setForm({
            naslov: data.naslov,
            sazetak: data.sazetak,
            vrijeme: data.datum_vrijeme,
            mjesto: data.lokacija,
            tockeDnevnogReda: data.tocke_dnevnog_reda?.map((t) => ({
              tekst: t.naziv,
              pravniUcinak: t.pravni_ucinak || false,
              potrebnoGlasanje: t.glasanje || false,
            })) || [
              { tekst: "", pravniUcinak: false, potrebnoGlasanje: false },
            ],
          });
        } catch (err) {
          console.error("Error fetching sastanak:", err);
          setError("Greška pri dohvaćanju sastanka");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSastanak();
  }, [sastanakId]);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleTockaChange = (index, field, value) => {
    setForm((prev) => {
      const noveTocke = [...prev.tockeDnevnogReda];
      noveTocke[index] = { ...noveTocke[index], [field]: value };
      return { ...prev, tockeDnevnogReda: noveTocke };
    });
  };

  const dodajTocku = () =>
    setForm((prev) => ({
      ...prev,
      tockeDnevnogReda: [
        ...prev.tockeDnevnogReda,
        { tekst: "", pravniUcinak: false, potrebnoGlasanje: false },
      ],
    }));

  const ukloniTocku = (index) => {
    if (form.tockeDnevnogReda.length === 1) return;
    setForm((prev) => ({
      ...prev,
      tockeDnevnogReda: prev.tockeDnevnogReda.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const prazneTocke = form.tockeDnevnogReda.filter(
      (t) => t.tekst.trim() !== ""
    );

    if (!form.naslov || !form.sazetak || !form.vrijeme || !form.mjesto) {
      setError("Molimo ispunite naslov, sažetak, vrijeme i mjesto.");
      return;
    }

    if (prazneTocke.length === 0) {
      setError("Molimo unesite barem jednu točku dnevnog reda.");
      return;
    }

    const sastanakData = {
      naslov: form.naslov,
      sazetak: form.sazetak,
      datum_vrijeme: form.vrijeme,
      lokacija: form.mjesto,
      tocke_dnevnog_reda: prazneTocke.map((tocka, index) => ({
        broj_tocke: index + 1,
        naziv: tocka.tekst,
        opis: "",
        pravni_ucinak: tocka.pravniUcinak,
        glasanje: tocka.potrebnoGlasanje,
      })),
    };

    try {
      setLoading(true);
      let result;

      if (sastanakId) {
        result = await updateSastanak(sastanakId, sastanakData);
      } else {
        result = await createSastanak(sastanakData);
      }

      if (result.ok) {
        navigate(-1);
      } else {
        setError(result.data?.error || "Greška pri spremanju sastanka");
      }
    } catch (err) {
      console.error("Error saving sastanak:", err);
      setError("Greška pri spremanju sastanka. Provjerite internetsku vezu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="back">
      <div className="dodavanjeOkvir">
        <h1>{sastanakId ? "Uredi sastanak" : "Novi sastanak"}</h1>
        {loading && <p>Učitavanje...</p>}
        <form className="formaDodaj" onSubmit={handleSubmit}>
          <div className="desno">
            <label>
              Naslov
              <input
                type="text"
                value={form.naslov}
                onChange={handleChange("naslov")}
                maxLength={50}
              />
            </label>
            <label>
              Sažetak
              <textarea
                value={form.sazetak}
                onChange={handleChange("sazetak")}
                maxLength={500}
              />
            </label>
            <label>
              Datum i vrijeme
              <input
                type="datetime-local"
                value={form.vrijeme}
                onChange={handleChange("vrijeme")}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </label>
            <label>
              Mjesto
              <input
                type="text"
                value={form.mjesto}
                onChange={handleChange("mjesto")}
              />
            </label>
          </div>

          <div className="lijevo">
            <label className="tdr">Točke dnevnog reda</label>
            <div className="tdrContainer">
              {form.tockeDnevnogReda.map((tocka, index) => (
                <div key={index} className="tockaReda">
                  <div className="goreTocka">
                    <input
                      type="text"
                      value={tocka.tekst}
                      onChange={(e) =>
                        handleTockaChange(index, "tekst", e.target.value)
                      }
                      placeholder={`Točka ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => ukloniTocku(index)}
                      disabled={form.tockeDnevnogReda.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="doleTocka">
                    <button
                      type="button"
                      className={`button2 ${
                        tocka.pravniUcinak ? "active" : ""
                      }`}
                      onClick={() =>
                        handleTockaChange(
                          index,
                          "pravniUcinak",
                          !tocka.pravniUcinak
                        )
                      }
                    >
                      Pravni učinak
                    </button>

                    <button
                      type="button"
                      className={`button2 ${
                        tocka.potrebnoGlasanje ? "active" : ""
                      }`}
                      onClick={() =>
                        handleTockaChange(
                          index,
                          "potrebnoGlasanje",
                          !tocka.potrebnoGlasanje
                        )
                      }
                    >
                      Glasanje
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" onClick={dodajTocku}>
              + Dodaj točku
            </button>

            <div className="actions">
              <button type="submit" disabled={loading}>
                {loading ? "Spremanje..." : "Spremi"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Natrag
              </button>
            </div>
            {error && <p className="error">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default SastanakAdd;
