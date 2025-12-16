import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './sastanakAdd.css';

function SastanakAdd() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        naslov: '',
        sazetak: '',
        vrijeme: '',
        mjesto: '',
    });
    const [error, setError] = useState('');

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!form.naslov || !form.sazetak || !form.vrijeme || !form.mjesto) {
            setError('Molimo ispunite naslov, sažetak, vrijeme i mjesto.');
            return;
        }

        const noviSastanak = {
            id: Date.now(),
            naslov: form.naslov,
            sazetak: form.sazetak,
            vrijeme: form.vrijeme,
            mjesto: form.mjesto,
            stanje: 'Planiran',
            brojPotvrdjenihSudjelovanja: 1,
            točkeDnevnogReda: [],
        };

        const saved = JSON.parse(localStorage.getItem('customSastanci') || '[]');
        localStorage.setItem('customSastanci', JSON.stringify([...saved, noviSastanak]));
        navigate(-1);
    };

    return (
        <div className="dodavanjeOkvir">
            <h1>Novi sastanak</h1>
            <form className="formaDodaj" onSubmit={handleSubmit}>
                <label>
                    Naslov
                    <input type="text" value={form.naslov} onChange={handleChange('naslov')} />
                </label>
                <label>
                    Sažetak
                    <textarea value={form.sazetak} onChange={handleChange('sazetak')} />
                </label>
                <label>
                    Vrijeme
                    <input type="datetime-local" value={form.vrijeme} onChange={handleChange('vrijeme')} />
                </label>
                <label>
                    Mjesto
                    <input type="text" value={form.mjesto} onChange={handleChange('mjesto')} />
                </label>
                <div className="actions">
                    <button type="submit">Spremi</button>
                    <button type="button" onClick={() => navigate(-1)}>Natrag</button>
                </div>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}

export default SastanakAdd;