from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from django.conf import settings
from api.models import UserProfile

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173" 
    client_class = OAuth2Client

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        user_email = sociallogin.account.extra_data.get('email')
        User = get_user_model()

        if not User.objects.filter(email=user_email).exists():
            user = User.objects.create_user(username=sociallogin.account.extra_data.get('name', user_email), email=user_email)
            UserProfile.objects.create(user=user, role='suvlasnik') 
            sociallogin.connect(request, user)
            return

        if user_email and User.objects.filter(email=user_email).exists():
            user = User.objects.get(email=user_email)
            sociallogin.connect(request, user)
