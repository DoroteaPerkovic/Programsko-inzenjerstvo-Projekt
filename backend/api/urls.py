from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import create_user_by_admin, CustomTokenObtainPairView, google_auth


urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google-auth/', google_auth, name='google_auth'),
    path('create-user-admin/', create_user_by_admin, name='create_user_by_admin'),
]