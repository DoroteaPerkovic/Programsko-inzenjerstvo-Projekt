
import './UserAdd.css'

function UserAdd(){

  return(
    <div className="Kontenjer">
      <div className="Blok">
        <div className ="ZaglavljeBloka">NOVI KORISNIK</div>
        <div className ="TijeloBloka">
            <form className="Registracija">
              <div className="Labeli">
                <div className="polje">
                  <label htmlFor="ime">Korisničko ime:</label>
                  <input type="text" id="ime" name="ime" placeholder="Unesi ime" required />
                </div>
                <div className="polje">
                  <label htmlFor="email">Email adresa:</label>
                  <input type="email" id="email" name="email" placeholder="Unesi email" required />
                </div>
                <div className="polje">
                  <label htmlFor="password">Lozinka:</label>
                  <input type="password" id="password" name="password" placeholder="Unesi lozinku" required />
                </div>
              </div>
                <fieldset className="Uloga">
                    <legend>ULOGA</legend>
                    <label>
                        <input type="radio" name="uloga" value="Predstavnik suvlasnika" required defaultChecked/>
                        Suvlasnik
                    </label>
                    <br />
                    <label>
                        <input type="radio" name="uloga" value="Suvlasnik" />
                        Predstavnik suvlasnika
                    </label>
                </fieldset>
                
                <button type="submit">Dodaj</button>
            </form>
        </div>
      </div>
    </div>
  );

}

export default UserAdd