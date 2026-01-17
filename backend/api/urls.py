from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    create_user_by_admin, CustomTokenObtainPairView, google_auth, ChangePasswordView,
    sastanci_list_create, sastanak_detail, sastanak_potvrda, sastanak_change_status,
    create_zakljucci, get_zakljucci_by_sastanak, get_zakljucci_by_tocka,
    sastanak_iz_diskusije
)


urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google-auth/', google_auth, name='google_auth'),
    path('create-user-admin/', create_user_by_admin, name='create_user_by_admin'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    path('sastanci/', sastanci_list_create, name='sastanci_list_create'),
    path('sastanci/<int:pk>/', sastanak_detail, name='sastanak_detail'),
    path('sastanci/<int:pk>/potvrda/', sastanak_potvrda, name='sastanak_potvrda'),
    path('sastanci/<int:pk>/status/', sastanak_change_status, name='sastanak_change_status'),
    path('sastanci-iz-diskusije/', sastanak_iz_diskusije, name='sastanak_iz_diskusije'),
    
    path('zakljucci/', create_zakljucci, name='create_zakljucci'),
    path('zakljucci/sastanak/<int:sastanak_id>/', get_zakljucci_by_sastanak, name='get_zakljucci_by_sastanak'),
    path('zakljucci/tocka/<int:tocka_id>/', get_zakljucci_by_tocka, name='get_zakljucci_by_tocka'),
]