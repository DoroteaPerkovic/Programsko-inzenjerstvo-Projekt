from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    change_password, create_user_by_admin, list_users, google_auth,
    CustomTokenObtainPairView, KorisnikViewSet, SastanakViewSet,
    ObavijestiViewSet, SudjelujeViewSet, TockeDnevRedaViewSet,
    RaspravaViewSet, ZakljucakViewSet
)

router = DefaultRouter()
router.register(r'korisnici', KorisnikViewSet, basename='korisnik')
router.register(r'sastanci', SastanakViewSet, basename='sastanak')
router.register(r'obavijesti', ObavijestiViewSet, basename='obavijesti')
router.register(r'sudjelovanja', SudjelujeViewSet, basename='sudjeluje')
router.register(r'tocke-dnevnog-reda', TockeDnevRedaViewSet, basename='tocke')
router.register(r'rasprave', RaspravaViewSet, basename='rasprava')
router.register(r'zakljucci', ZakljucakViewSet, basename='zakljucak')

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google-auth/', google_auth, name='google_auth'),

    path('change-password/', change_password, name='change_password'),
    path('create-user-admin/', create_user_by_admin, name='create_user_by_admin'),
    path('list-users/', list_users, name='list_users'),

    path('', include(router.urls)),

    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
]
