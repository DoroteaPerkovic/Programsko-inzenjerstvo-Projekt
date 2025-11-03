CREATE TABLE Uloga (
    id_uloge SERIAL PRIMARY KEY,
    naziv_uloge VARCHAR(50) NOT NULL
);

CREATE TABLE Korisnik (
    id_korisnik SERIAL PRIMARY KEY,
    korisnicko_ime VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    aktivan BOOLEAN DEFAULT TRUE,
    registriran_od TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password_hash VARCHAR(255) NOT NULL,
    id_uloge INT REFERENCES Uloga(id_uloge)
);

CREATE TABLE Status_sastanka (
    id_status SERIAL PRIMARY KEY,
    naziv_status VARCHAR(30) NOT NULL
);

CREATE TABLE Sastanak (
    id_sastanak SERIAL PRIMARY KEY,
    naslov VARCHAR(200) NOT NULL,
    napravljen_od TIMESTAMP NOT NULL,
    lokacija VARCHAR(200) NOT NULL,
    datum_vrijeme TIMESTAMP NOT NULL,
    sazetak TEXT,
    id_korisnik INT REFERENCES Korisnik(id_korisnik),
    id_status INT REFERENCES Status_sastanka(id_status)
);

CREATE TABLE Obavijesti (
    id_obavijesti SERIAL PRIMARY KEY,
    poruka TEXT NOT NULL,
    poslano_u TIMESTAMP,
    status_mail VARCHAR(30),
    id_sastanak INT REFERENCES Sastanak(id_sastanak)
);

CREATE TABLE Sudjeluje (
    id_sudjelovanja SERIAL PRIMARY KEY,
    vrijeme_potvrde TIMESTAMP,
    potvrda BOOLEAN,
    id_korisnik INT REFERENCES Korisnik(id_korisnik),
    id_sastanak INT REFERENCES Sastanak(id_sastanak),
    UNIQUE (id_korisnik, id_sastanak)
);

CREATE TABLE TockeDnevReda (
    id_tocke SERIAL PRIMARY KEY,
    broj_tocke INT NOT NULL,
    naziv VARCHAR(200) NOT NULL,
    opis TEXT,
    pravni_ucinak BOOLEAN DEFAULT FALSE,
    id_sastanak INT REFERENCES Sastanak(id_sastanak)
);

CREATE TABLE Rasprava (
    id_rasprave SERIAL PRIMARY KEY,
    url_StanBlog VARCHAR(255) NOT NULL,
    id_tocke INT REFERENCES TockeDnevReda(id_tocke)
);

CREATE TABLE Zakljucak (
    id_zakljucak SERIAL PRIMARY KEY,
    tekst TEXT NOT NULL,
    status VARCHAR(30),
    unesen_u TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_korisnik INT REFERENCES Korisnik(id_korisnik),
    id_tocke INT REFERENCES TockeDnevReda(id_tocke)
);
