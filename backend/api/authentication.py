from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Korisnik


class KorisnikJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token['user_id']
        except KeyError:
            user_id = validated_token.get('id_korisnik')

        try:
            korisnik = Korisnik.objects.get(id_korisnik=user_id, aktivan=True)
            return korisnik
        except Korisnik.DoesNotExist:
            return None
