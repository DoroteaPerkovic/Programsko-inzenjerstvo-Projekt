from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        user_email = sociallogin.account.extra_data.get('email')
        User = get_user_model()
        if user_email and User.objects.filter(email=user_email).exists():
            user = User.objects.get(email=user_email)
            sociallogin.connect(request, user)
