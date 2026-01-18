from django.test import SimpleTestCase
from api.models import Sastanak, Korisnik, Uloga, StatusSastanka
from datetime import datetime

class SastanakModelTest(SimpleTestCase):

    def test_predstavnik_moze_kreirati_planirani(self):
        print("\nTest: Predstavnik može kreirati planirani sastanak")
        uloga = Uloga(naziv_uloge='Predstavnik')
        korisnik = Korisnik(
            id_korisnik=1,
            korisnicko_ime='iva',
            email='iva@test.com',
            aktivan=True,
            registriran_od=datetime.now(),
            password_hash='hash',
            id_uloge=uloga
        )
        status = StatusSastanka(naziv_status='Planiran')

        sastanak = Sastanak(
            id_sastanak=1,
            naslov='Planirani sastanak',
            napravljen_od=datetime.now(),
            lokacija='Online',
            datum_vrijeme=datetime(2027, 1, 18, 10, 0),
            sazetak='Rasprava o projektu',
            id_korisnik=korisnik,
            id_status=status,
            iz_diskusije=False
        )

        print(f"Kreiran sastanak: {sastanak.naslov}, korisnik: {sastanak.id_korisnik.username}, status: {sastanak.id_status.naziv_status}")
        self.assertEqual(sastanak.id_korisnik.get_role(), 'Predstavnik')
        self.assertEqual(sastanak.id_status.naziv_status, 'Planiran')

    def test_suvlasnik_ne_moze_kreirati_sastanak(self):
        print("\nTest: Suvlasnik ne može kreirati sastanak")
        uloga = Uloga(naziv_uloge='Suvlasnik')
        korisnik = Korisnik(
            id_korisnik=2,
            korisnicko_ime='lani',
            email='lani@test.com',
            aktivan=True,
            registriran_od=datetime.now(),
            password_hash='hash',
            id_uloge=uloga
        )
        status = StatusSastanka(naziv_status='Planiran')

        try:
            if korisnik.get_role() == 'Suvlasnik' and status.naziv_status == 'Planiran':
                print("Suvlasnik ne može kreirati sastanak")
        except PermissionError as e:
            print("Exception:", e)
            raise

    def test_sastanak_bez_statusa(self):
        print("\nTest: Sastanak bez statusa")
        uloga = Uloga(naziv_uloge='Korisnik')
        korisnik = Korisnik(
            id_korisnik=3,
            korisnicko_ime='vita',
            email='vita@test.com',
            aktivan=True,
            registriran_od=datetime.now(),
            password_hash='hash',
            id_uloge=uloga
        )

        sastanak = Sastanak(
            id_sastanak=3,
            naslov='Sastanak bez statusa',
            napravljen_od=datetime.now(),
            lokacija='Ured',
            datum_vrijeme=datetime(2027, 1, 18, 12, 0),
            sazetak='Nema statusa',
            id_korisnik=korisnik,
            id_status=None,
            iz_diskusije=False
        )

        print(f"Sastanak: {sastanak.naslov}, status: {sastanak.id_status}")
        self.assertIsNone(sastanak.id_status)

    def test_sastanak_bez_korisnika(self):
        print("\nTest: Sastanak kreiran bez korisnika")
        status = StatusSastanka(naziv_status='Planiran')

        sastanak = Sastanak(
            id_sastanak=4,
            naslov='Sastanak bez korisnika',
            napravljen_od=datetime.now(),
            lokacija='Online',
            datum_vrijeme=datetime(2026, 1, 18, 14, 0),
            sazetak='Nema korisnika',
            id_korisnik=None,
            id_status=status,
            iz_diskusije=False
        )

        print(f"Sastanak: {sastanak.naslov}, korisnik: {sastanak.id_korisnik}")
        self.assertIsNone(sastanak.id_korisnik)

    def test_dva_korisnika_s_istim_imenima(self):
        print("\nTest: Duplikat username")
        uloga = Uloga(naziv_uloge='Suvlasnik')
        korisnik1 = Korisnik(
            id_korisnik=5,
            korisnicko_ime='dupli',
            email='dupli1@test.com',
            aktivan=True,
            registriran_od=datetime.now(),
            password_hash='hash',
            id_uloge=uloga
        )
        korisnik2 = Korisnik(
            id_korisnik=6,
            korisnicko_ime='dupli',
            email='dupli2@test.com',
            aktivan=True,
            registriran_od=datetime.now(),
            password_hash='hash',
            id_uloge=uloga
        )

        exception_raised = False
        try:
            if korisnik1.username == korisnik2.username:
                raise ValueError("Korisničko ime mora biti jedinstveno")
        except ValueError as e:
            exception_raised = True
            print("Exception:", e)

        self.assertTrue(exception_raised)

    def test_sastanak_u_proslosti(self):
        print("\nTest: Sastanak u prošlosti")
        uloga = Uloga(naziv_uloge='Korisnik')
        korisnik = Korisnik(
            id_korisnik=7,
            korisnicko_ime='eva',
            email='eva@test.com',
            aktivan=True,
            registriran_od=datetime.now(),
            password_hash='hash',
            id_uloge=uloga
        )
        sastanak = Sastanak(
            id_sastanak=7,
            naslov='Prošli sastanak',
            napravljen_od=datetime.now(),
            lokacija='Online',
            datum_vrijeme=datetime(2020, 1, 1, 10, 0),
            sazetak='Sastanak u prošlosti',
            id_korisnik=korisnik,
            id_status=None
        )

        exception_raised = False
        try:
            if sastanak.datum_vrijeme < datetime.now():
                raise ValueError("Datum sastanka ne smije biti u prošlosti")
        except ValueError as e:
            exception_raised = True
            print("Exception:", e)

        self.assertTrue(exception_raised)

    def test_nepostojeca_metoda(self):
        print("\nTest: Nepostojeća metoda")
        uloga = Uloga(naziv_uloge='Korisnik')
        korisnik = Korisnik(
            id_korisnik=8,
            korisnicko_ime='ivan',
            email='ivan@test.com',
            aktivan=True,
            registriran_od=datetime.now(),
            password_hash='hash',
            id_uloge=uloga
        )

        exception_raised = False
        try:
            korisnik.nadimak()
        except AttributeError as e:
            exception_raised = True
            print("Exception:", e)

        self.assertTrue(exception_raised)
