from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import change_password, create_user_by_admin, list_users, CustomTokenObtainPairView, CustomGoogleLogin
from .adapters import GoogleLogin

urlpatterns = [
    path('change-password/', change_password, name='change_password'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/google/', CustomGoogleLogin.as_view(), name='google_login'),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('create-user-admin/', create_user_by_admin, name='create_user_by_admin'),
    path('list-users/', list_users, name='list_users'),
]
