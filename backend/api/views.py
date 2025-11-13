from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Korisnik
from .serializer import RegisterSerializer
from .auth_backend import verify_password
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user_by_admin(request):
    korisnik = request.user
    if not isinstance(korisnik, Korisnik) or not korisnik.is_admin():
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

    id_uloge = request.data.get('id_uloge', 3)
    if id_uloge == 1:
        return Response({'error': 'Ne možete kreirati administratora'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({'message': 'Korisnik kreiran!'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


GOOGLE_CLIENT_ID = '826648226919-fpclgpuee5fhdrdb6mas7fevhkkjq2lr.apps.googleusercontent.com'  

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """Authenticate user via Google OAuth"""
    token = request.data.get('token')
    if not token:
        return Response({'error': 'No token provided'}, status=400)

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo.get('email')

        try:
            korisnik = Korisnik.objects.get(email=email, aktivan=True)
        except Korisnik.DoesNotExist:
            return Response({'error': 'Nemate pristup ovoj aplikaciji.'}, status=403)

        refresh = RefreshToken.for_user(korisnik)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': korisnik.korisnicko_ime,
            'email': korisnik.email,
            'role': korisnik.get_role()
        })
    except ValueError:
        return Response({'error': 'Invalid token'}, status=400)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        if isinstance(user, Korisnik):
            token['email'] = user.email
            token['role'] = user.get_role()
        return token

    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field, '')
        password = attrs.get('password', '')

        korisnik = None
        if '@' in username_or_email:
            try:
                korisnik = Korisnik.objects.get(email=username_or_email, aktivan=True)
            except Korisnik.DoesNotExist:
                pass
        else:
            try:
                korisnik = Korisnik.objects.get(korisnicko_ime=username_or_email, aktivan=True)
            except Korisnik.DoesNotExist:
                pass

        if korisnik and verify_password(password, korisnik.password_hash):
            refresh = self.get_token(korisnik)
            data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': korisnik.korisnicko_ime,
                'email': korisnik.email,
                'role': korisnik.get_role(),
                'user_id': korisnik.id_korisnik
            }
            return data
        else:
            from rest_framework_simplejwt.exceptions import AuthenticationFailed
            raise AuthenticationFailed('Neispravno korisničko ime ili lozinka.')


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
