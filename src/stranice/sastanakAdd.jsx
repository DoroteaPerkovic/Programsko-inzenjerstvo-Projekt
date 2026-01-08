import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./sastanakAdd.css";

function SastanakAdd() {
  const navigate = useNavigate();

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
      },
    ],
  });

  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleTockaChange = (index, field, value) => {
    setForm((prev) => {
      const noveTocke = [...prev.tockeDnevnogReda];
      noveTocke[index] = {
        ...noveTocke[index],
        [field]: value,
      };
      return { ...prev, tockeDnevnogReda: noveTocke };
    });
  };

  const dodajTocku = () => {
    setForm((prev) => ({
      ...prev,
      tockeDnevnogReda: [...prev.tockeDnevnogReda, ""],
    }));
  };

  const ukloniTocku = (index) => {
    if (form.tockeDnevnogReda.length === 1) return;
    setForm((prev) => ({
      ...prev,
      tockeDnevnogReda: prev.tockeDnevnogReda.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const prazneTocke = form.tockeDnevnogReda.filter((t) => t.trim() !== "");

    if (!form.naslov || !form.sazetak || !form.vrijeme || !form.mjesto) {
      setError("Molimo ispunite naslov, sažetak, vrijeme i mjesto.");
      return;
    }

    if (prazneTocke.length === 0) {
      setError("Molimo unesite barem jednu točku dnevnog reda.");
      return;
    }

    const noviSastanak = {
      id: Date.now(),
      naslov: form.naslov,
      sazetak: form.sazetak,
      vrijeme: form.vrijeme,
      mjesto: form.mjesto,
      stanje: "Planiran",
      brojPotvrdjenihSudjelovanja: 1,
      tockeDnevnogReda: prazneTocke,
    };

    const saved = JSON.parse(localStorage.getItem("customSastanci") || "[]");
    localStorage.setItem(
      "customSastanci",
      JSON.stringify([...saved, noviSastanak])
    );
    navigate(-1);
  };

  return (
    <div className="back">
      <div className="dodavanjeOkvir">
        <h1>Novi sastanak</h1>
        <form className="formaDodaj" onSubmit={handleSubmit}>
          <div className="desno">
            <label>
              Naslov
              <input
                type="text"
                value={form.naslov}
                onChange={handleChange("naslov")}
              />
            </label>
            <label>
              Sažetak
              <textarea
                value={form.sazetak}
                onChange={handleChange("sazetak")}
              />
            </label>
            <label>
              Datum
              <input
                type="date"
                value={form.datum || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, datum: e.target.value }))
                }
                required
              />
            </label>

            <label>
              Vrijeme
              <input
                type="time"
                value={form.vrijeme || ""}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, vrijeme: e.target.value }))
                }
                required
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
              <button type="submit">Spremi</button>
              <button type="button" onClick={() => navigate(-1)}>
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
