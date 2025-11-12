from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import UserProfile
from django.contrib.auth import authenticate
from .serializer import RegisterSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
import json
from django.http import JsonResponse
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter


@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_users(request):
    users = User.objects.all()
    serializer = RegisterSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data['old_password']
    new_password = request.data['new_password']
    if not user.check_password(old_password):
        return Response({'error': 'Stara lozinka nije ispravna'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response({'message': 'Lozinka promijenjena'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_user_by_admin(request):
    data = request.data
    user = User.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )
    UserProfile.objects.create(
        user=user,
        role=data.get('role', 'suvlasnik'),
        stanblog_url=data.get('stanblog_url', '')
    )
    return Response({'message': 'Korisnik kreiran!'}, status=status.HTTP_201_CREATED)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CustomGoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        user = self.user
        if user.is_authenticated:
            try:
                profile = UserProfile.objects.get(user=user)
                response.data['user'] = {
                    'username': user.username,
                    'role': profile.role
                }
            except UserProfile.DoesNotExist:
                response.data['user'] = {
                    'username': user.username,
                    'role': None
                }
        return response