from rest_framework import serializers
from .models import (
    Korisnik, Uloga, Sastanak, StatusSastanka,
    Obavijesti, Sudjeluje, TockeDnevReda, Rasprava, Zakljucak
)
from .auth_backend import hash_password


class UlogaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Uloga
        fields = ['id_uloge', 'naziv_uloge']


class KorisnikSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    uloga = UlogaSerializer(source='id_uloge', read_only=True)

    class Meta:
        model = Korisnik
        fields = ['id_korisnik', 'korisnicko_ime', 'email', 'aktivan',
                  'registriran_od', 'password', 'id_uloge', 'uloga']
        read_only_fields = ['id_korisnik', 'registriran_od']
        extra_kwargs = {
            'password_hash': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if password:
            validated_data['password_hash'] = hash_password(password)
        korisnik = Korisnik.objects.create(**validated_data)
        return korisnik

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.password_hash = hash_password(password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class RegisterSerializer(serializers.Serializer):
    korisnicko_ime = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    id_uloge = serializers.IntegerField(required=False, default=3)

    def validate_korisnicko_ime(self, value):
        if Korisnik.objects.filter(korisnicko_ime=value).exists():
            raise serializers.ValidationError("Korisničko ime već postoji.")
        return value

    def validate_email(self, value):
        if Korisnik.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email već postoji.")
        return value

    def validate_id_uloge(self, value):
        if value == 1:
            raise serializers.ValidationError("Ne možete kreirati administratora.")
        if value not in [2, 3]:
            raise serializers.ValidationError("Nevažeća uloga. Dozvoljene su samo uloge 2 i 3.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        password_hash = hash_password(password)

        korisnik = Korisnik.objects.create(
            korisnicko_ime=validated_data['korisnicko_ime'],
            email=validated_data['email'],
            password_hash=password_hash,
            id_uloge_id=validated_data.get('id_uloge', 3),
            aktivan=True
        )
        return korisnik


class StatusSastankaSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusSastanka
        fields = ['id_status', 'naziv_status']


class SastanakSerializer(serializers.ModelSerializer):
    organizator = KorisnikSerializer(source='id_korisnik', read_only=True)
    status = StatusSastankaSerializer(source='id_status', read_only=True)

    class Meta:
        model = Sastanak
        fields = ['id_sastanak', 'naslov', 'napravljen_od', 'lokacija',
                  'datum_vrijeme', 'sazetak', 'id_korisnik', 'id_status',
                  'organizator', 'status']
        read_only_fields = ['id_sastanak', 'napravljen_od']


class ObavijestiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Obavijesti
        fields = ['id_obavijesti', 'poruka', 'poslano_u', 'status_mail', 'id_sastanak']
        read_only_fields = ['id_obavijesti']


class SudjelujeSerializer(serializers.ModelSerializer):
    korisnik = KorisnikSerializer(source='id_korisnik', read_only=True)
    sastanak = SastanakSerializer(source='id_sastanak', read_only=True)

    class Meta:
        model = Sudjeluje
        fields = ['id_sudjelovanja', 'vrijeme_potvrde', 'potvrda',
                  'id_korisnik', 'id_sastanak', 'korisnik', 'sastanak']
        read_only_fields = ['id_sudjelovanja']


class TockeDnevRedaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TockeDnevReda
        fields = ['id_tocke', 'broj_tocke', 'naziv', 'opis',
                  'pravni_ucinak', 'id_sastanak']
        read_only_fields = ['id_tocke']


class RaspravaSerializer(serializers.ModelSerializer):
    tocka = TockeDnevRedaSerializer(source='id_tocke', read_only=True)

    class Meta:
        model = Rasprava
        fields = ['id_rasprave', 'url_stanblog', 'id_tocke', 'tocka']
        read_only_fields = ['id_rasprave']


class ZakljucakSerializer(serializers.ModelSerializer):
    autor = KorisnikSerializer(source='id_korisnik', read_only=True)
    tocka = TockeDnevRedaSerializer(source='id_tocke', read_only=True)

    class Meta:
        model = Zakljucak
        fields = ['id_zakljucak', 'tekst', 'status', 'unesen_u',
                  'id_korisnik', 'id_tocke', 'autor', 'tocka']
        read_only_fields = ['id_zakljucak', 'unesen_u']