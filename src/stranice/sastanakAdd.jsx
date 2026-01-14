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
      {
        tekst: "",
        pravniUcinak: false,
        potrebnoGlasanje: false,
        poveznica_diskusije: "",
      },
    ],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [diskusije, setDiskusije] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

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
              poveznica_diskusije: t.poveznica_diskusije || "",
            })) || [
              {
                tekst: "",
                pravniUcinak: false,
                potrebnoGlasanje: false,
                poveznica_diskusije: "",
              },
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
        {
          tekst: "",
          pravniUcinak: false,
          potrebnoGlasanje: false,
          poveznica_diskusije: "",
        },
      ],
    }));

  const fetchDiskusije = async () => {
    try {
      const response = await fetch(
        "https://f18d2259-cbd6-4cda-b632-383992fbefa5.mock.pstmn.io/api/fetch-positive-outcome-discussions"
      );
      const data = await response.json();
      setDiskusije(data);
    } catch (err) {
      console.error("Error fetching discussions:", err);
      setError("Greška pri dohvaćanju diskusija");
    }
  };

  const toggleDropdown = async (index) => {
    if (openDropdown === index) {
      setOpenDropdown(null);
    } else {
      if (diskusije.length === 0) {
        await fetchDiskusije();
      }
      setOpenDropdown(index);
    }
  };

  const handleDiskusijaChange = (index, e) => {
    const selectedPoveznica = e.target.value;
    handleTockaChange(index, "poveznica_diskusije", selectedPoveznica);
    setOpenDropdown(null);
  };

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
        poveznica_diskusije: tocka.poveznica_diskusije || "",
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
        <h1 className="naslov">
          {sastanakId ? "Uredi sastanak" : "Novi sastanak"}
        </h1>
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

                    <button
                      type="button"
                      className="button2"
                      onClick={() => toggleDropdown(index)}
                    >
                      Poveži s diskusijom
                    </button>
                    {openDropdown === index && (
                      <div className="diskusije">
                        {diskusije.length > 0 ? (
                          <select
                            onChange={(e) => handleDiskusijaChange(index, e)}
                          >
                            <option value="">-- Odaberi diskusiju --</option>
                            <option value="">Odustani</option>
                            {diskusije.map((diskusija, idx) => (
                              <option key={idx} value={diskusija.poveznica}>
                                {diskusija.naslov} - {diskusija.pitanje}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p>Učitavanje diskusija...</p>
                        )}
                      </div>
                    )}
                    {tocka.poveznica_diskusije && (
                      <div className="oznacenaDiskusija">
                        <small>    
                          {(() => {
                            const diskusija = diskusije.find(
                              (d) => d.poveznica === tocka.poveznica_diskusije
                            );
                            return diskusija
                              ? `${diskusija.naslov} - ${diskusija.pitanje}`
                              : tocka.poveznica_diskusije;
                          })()}
                        </small>{" "}
                      </div>
                    )}
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
