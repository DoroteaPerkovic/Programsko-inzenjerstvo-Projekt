from rest_framework import serializers
from .models import (
    Korisnik, Uloga, Sastanak, TockeDnevReda, StatusSastanka, Sudjeluje, Zakljucak
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
        from django.utils import timezone
        password = validated_data.pop('password')
        password_hash = hash_password(password)

        korisnik = Korisnik.objects.create(
            korisnicko_ime=validated_data['korisnicko_ime'],
            email=validated_data['email'],
            password_hash=password_hash,
            id_uloge_id=validated_data.get('id_uloge', 3),
            aktivan=True,
            registriran_od=timezone.now()
        )
        return korisnik


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class StatusSastankaSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusSastanka
        fields = ['id_status', 'naziv_status']


class TockeDnevRedaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TockeDnevReda
        fields = ['id_tocke', 'broj_tocke', 'naziv', 'opis', 'pravni_ucinak', 'glasanje', 'poveznica_diskusije', 'id_sastanak']
        read_only_fields = ['id_tocke']


class SastanakIzDiskusijeSerializer(serializers.Serializer):
    naslov = serializers.CharField(max_length=200)
    termin = serializers.DateTimeField()
    tocka_dnevnog_reda = serializers.CharField(max_length=200)
    cilj_sastanka = serializers.CharField(max_length=500)


class SastanakSerializer(serializers.ModelSerializer):
    tocke_dnevnog_reda = TockeDnevRedaSerializer(many=True, required=False, write_only=True)
    status = StatusSastankaSerializer(source='id_status', read_only=True)
    korisnik_ime = serializers.CharField(source='id_korisnik.korisnicko_ime', read_only=True)
    broj_potvrdenih = serializers.SerializerMethodField()

    class Meta:
        model = Sastanak
        fields = ['id_sastanak', 'naslov', 'napravljen_od', 'lokacija', 
                  'datum_vrijeme', 'sazetak', 'id_korisnik', 'id_status', 
                  'status', 'korisnik_ime', 'tocke_dnevnog_reda', 'broj_potvrdenih', 'iz_diskusije']
        read_only_fields = ['id_sastanak', 'napravljen_od']

    def get_broj_potvrdenih(self, obj):
        return Sudjeluje.objects.filter(id_sastanak=obj, potvrda=True).count()

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        tocke = TockeDnevReda.objects.filter(id_sastanak=instance).order_by('broj_tocke')
        representation['tocke_dnevnog_reda'] = TockeDnevRedaSerializer(tocke, many=True).data
        return representation

    def create(self, validated_data):
        tocke_data = validated_data.pop('tocke_dnevnog_reda', [])
        sastanak = Sastanak.objects.create(**validated_data)
        
        for idx, tocka_data in enumerate(tocke_data, start=1):
            tocka_data.pop('broj_tocke', None)
            TockeDnevReda.objects.create(
                id_sastanak=sastanak,
                broj_tocke=idx,
                **tocka_data
            )
        
        return sastanak

    def update(self, instance, validated_data):
        tocke_data = validated_data.pop('tocke_dnevnog_reda', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if tocke_data is not None:
            # Delete existing tocke and create new ones
            TockeDnevReda.objects.filter(id_sastanak=instance).delete()
            for idx, tocka_data in enumerate(tocke_data, start=1):
                TockeDnevReda.objects.create(
                    id_sastanak=instance,
                    broj_tocke=idx,
                    **tocka_data
                )
        
        return instance


class SudjelujeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sudjeluje
        fields = ['id_sudjelovanja', 'vrijeme_potvrde', 'potvrda', 'id_korisnik', 'id_sastanak']
        read_only_fields = ['id_sudjelovanja', 'vrijeme_potvrde']


class ZakljucakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zakljucak
        fields = ['id_zakljucak', 'tekst', 'status', 'unesen_u', 'id_korisnik', 'id_tocke']
        read_only_fields = ['id_zakljucak', 'unesen_u']