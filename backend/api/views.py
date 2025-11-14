import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Korisnik
from .serializer import RegisterSerializer
from .auth_backend import verify_password
from rest_framework_simplejwt.tokens import RefreshToken
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

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    access_token = request.data.get('access_token')
    if not access_token:
        return Response({'error': 'No token provided'}, status=400)

    userinfo_response = requests.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        headers={'Authorization': f'Bearer {access_token}'}
    )

    if userinfo_response.status_code != 200:
        return Response({'error': 'Failed to fetch user info from Google'}, status=400)

    userinfo = userinfo_response.json()
    email = userinfo.get('email')

    if not email:
        return Response({'error': 'Email not found in Google response'}, status=400)

    try:
        korisnik = Korisnik.objects.get(email=email, aktivan=True)
    except Korisnik.DoesNotExist:
        return Response({'error': 'Nemate pristup ovoj aplikaciji. Kontaktirajte administratora.'}, status=403)

    refresh = RefreshToken.for_user(korisnik)

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': {
            'username': korisnik.korisnicko_ime,
            'email': korisnik.email,
            'role': korisnik.get_role()
        },
        'userRole': korisnik.get_role()
    })


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
