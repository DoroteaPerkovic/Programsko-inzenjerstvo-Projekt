from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from django.conf import settings
from api.models import UserProfile
from django.core.exceptions import PermissionDenied
from django.contrib.auth.models import User


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173" 
    client_class = OAuth2Client

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        email = sociallogin.account.extra_data.get('email')
        User = get_user_model()
        if not User.objects.filter(email=email).exists():
            raise PermissionDenied("Prijava nije moguća – kontaktirajte administratora.")
        user = User.objects.get(email=email)
        sociallogin.connect(request, user)
