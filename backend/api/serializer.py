from rest_framework import serializers
from .models import (
    Korisnik, Uloga
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