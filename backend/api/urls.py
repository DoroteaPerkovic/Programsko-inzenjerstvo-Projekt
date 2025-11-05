
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import register, change_password, create_user_by_admin
from .views import google_auth

urlpatterns = [
    path('register/', register, name='register'),
    path('change-password/', change_password, name='change_password'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create-user-admin/', create_user_by_admin, name='create_user_by_admin'),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('google-auth/', google_auth, name='google_auth'),
]
