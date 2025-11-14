from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.core.exceptions import PermissionDenied
from api.models import Korisnik

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        email = sociallogin.account.extra_data.get('email')

        if not Korisnik.objects.filter(email=email, aktivan=True).exists():
            raise PermissionDenied("Nemate pristup ovoj aplikaciji. Kontaktirajte administratora.")

        korisnik = Korisnik.objects.get(email=email, aktivan=True)

        if not sociallogin.is_existing:
            sociallogin.connect(request, korisnik)