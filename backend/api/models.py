from django.db import models


class Uloga(models.Model):
    id_uloge = models.AutoField(primary_key=True)
    naziv_uloge = models.CharField(max_length=50)

    class Meta:
        db_table = 'uloga'
        managed = False

    def __str__(self):
        return self.naziv_uloge


class Korisnik(models.Model):
    id_korisnik = models.AutoField(primary_key=True)
    korisnicko_ime = models.CharField(max_length=50, unique=True)
    email = models.CharField(max_length=100, unique=True)
    aktivan = models.BooleanField(default=True)
    registriran_od = models.DateTimeField()
    password_hash = models.CharField(max_length=255)
    id_uloge = models.ForeignKey(Uloga, on_delete=models.SET_NULL, null=True, db_column='id_uloge')

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return self.aktivan

    @property
    def username(self):
        return self.korisnicko_ime

    @property
    def pk(self):
        return self.id_korisnik

    @property
    def id(self):
        return self.id_korisnik

    def get_role(self):
        if self.id_uloge:
            return self.id_uloge.naziv_uloge
        return None

    def is_admin(self):
        return self.id_uloge and self.id_uloge.naziv_uloge == 'Administrator'

    class Meta:
        db_table = 'korisnik'
        managed = False

    def __str__(self):
        return self.korisnicko_ime


class StatusSastanka(models.Model):
    id_status = models.AutoField(primary_key=True)
    naziv_status = models.CharField(max_length=30)

    class Meta:
        db_table = 'status_sastanka'
        managed = False

    def __str__(self):
        return self.naziv_status


class Sastanak(models.Model):
    id_sastanak = models.AutoField(primary_key=True)
    naslov = models.CharField(max_length=200)
    napravljen_od = models.DateTimeField()
    lokacija = models.CharField(max_length=200)
    datum_vrijeme = models.DateTimeField()
    sazetak = models.TextField(blank=True, null=True)
    id_korisnik = models.ForeignKey(Korisnik, on_delete=models.SET_NULL, null=True, db_column='id_korisnik', related_name='sastanci')
    id_status = models.ForeignKey(StatusSastanka, on_delete=models.SET_NULL, null=True, db_column='id_status')

    class Meta:
        db_table = 'sastanak'
        managed = False

    def __str__(self):
        return self.naslov


class Obavijesti(models.Model):
    id_obavijesti = models.AutoField(primary_key=True)
    poruka = models.TextField()
    poslano_u = models.DateTimeField(blank=True, null=True)
    status_mail = models.CharField(max_length=30, blank=True, null=True)
    id_sastanak = models.ForeignKey(Sastanak, on_delete=models.CASCADE, null=True, db_column='id_sastanak')

    class Meta:
        db_table = 'obavijesti'
        managed = False

    def __str__(self):
        return f"Obavijest {self.id_obavijesti}"


class Sudjeluje(models.Model):
    id_sudjelovanja = models.AutoField(primary_key=True)
    vrijeme_potvrde = models.DateTimeField(blank=True, null=True)
    potvrda = models.BooleanField(blank=True, null=True)
    id_korisnik = models.ForeignKey(Korisnik, on_delete=models.CASCADE, db_column='id_korisnik')
    id_sastanak = models.ForeignKey(Sastanak, on_delete=models.CASCADE, db_column='id_sastanak')

    class Meta:
        db_table = 'sudjeluje'
        managed = False
        unique_together = (('id_korisnik', 'id_sastanak'),)

    def __str__(self):
        return f"{self.id_korisnik} - {self.id_sastanak}"


class TockeDnevReda(models.Model):
    id_tocke = models.AutoField(primary_key=True)
    broj_tocke = models.IntegerField()
    naziv = models.CharField(max_length=200)
    opis = models.TextField(blank=True, null=True)
    pravni_ucinak = models.BooleanField(default=False)
    id_sastanak = models.ForeignKey(Sastanak, on_delete=models.CASCADE, null=True, db_column='id_sastanak')

    class Meta:
        db_table = 'tockednevreda'
        managed = False

    def __str__(self):
        return f"{self.broj_tocke}. {self.naziv}"


class Rasprava(models.Model):
    id_rasprave = models.AutoField(primary_key=True)
    url_stanblog = models.CharField(max_length=255, db_column='url_stanblog')
    id_tocke = models.ForeignKey(TockeDnevReda, on_delete=models.CASCADE, null=True, db_column='id_tocke')

    class Meta:
        db_table = 'rasprava'
        managed = False

    def __str__(self):
        return f"Rasprava {self.id_rasprave}"


class Zakljucak(models.Model):
    id_zakljucak = models.AutoField(primary_key=True)
    tekst = models.TextField()
    status = models.CharField(max_length=30, blank=True, null=True)
    unesen_u = models.DateTimeField(auto_now_add=True)
    id_korisnik = models.ForeignKey(Korisnik, on_delete=models.SET_NULL, null=True, db_column='id_korisnik')
    id_tocke = models.ForeignKey(TockeDnevReda, on_delete=models.CASCADE, null=True, db_column='id_tocke')

    class Meta:
        db_table = 'zakljucak'
        managed = False

    def __str__(self):
        return f"Zakljucak {self.id_zakljucak}"