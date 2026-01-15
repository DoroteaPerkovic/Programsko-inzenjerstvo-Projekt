import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Korisnik, Sastanak, TockeDnevReda, StatusSastanka, Sudjeluje, Zakljucak
from .serializer import (
    RegisterSerializer, ChangePasswordSerializer, 
    SastanakSerializer, SudjelujeSerializer, ZakljucakSerializer
)
from .auth_backend import verify_password, hash_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.views import APIView
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail

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


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'detail': 'Stara i nova lozinka su obavezne.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        korisnik = request.user  

        if not verify_password(old_password, korisnik.password_hash):
            return Response(
                {'detail': 'Stara lozinka nije ispravna.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        korisnik.password_hash = hash_password(new_password)
        korisnik.save()

        return Response(
            {'detail': 'Lozinka uspješno promijenjena.'},
            status=status.HTTP_200_OK
        )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def sastanci_list_create(request):
    """
    GET: List all meetings
    POST: Create a new meeting (only for Predstavnik suvlasnika and Administrator)
    """
    if request.method == 'GET':
        sastanci = Sastanak.objects.all().order_by('-datum_vrijeme')
        
        status_filter = request.query_params.get('status', None)
        if status_filter:
            sastanci = sastanci.filter(id_status__naziv_status=status_filter)
        
        serializer = SastanakSerializer(sastanci, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        korisnik = request.user
        
        if not isinstance(korisnik, Korisnik):
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        role = korisnik.get_role()
        if role not in ['Administrator', 'Predstavnik suvlasnika']:
            return Response(
                {'error': 'Samo administrator i predstavnik suvlasnika mogu kreirati sastanke.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['id_korisnik'] = korisnik.id_korisnik
        
        if 'id_status' not in data:
            try:
                planiran_status = StatusSastanka.objects.get(naziv_status='Planiran')
                data['id_status'] = planiran_status.id_status
            except StatusSastanka.DoesNotExist:
                data['id_status'] = 1
        
        serializer = SastanakSerializer(data=data)
        if serializer.is_valid():
            sastanak = serializer.save(napravljen_od=timezone.now())
            return Response(
                SastanakSerializer(sastanak).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def sastanak_detail(request, pk):
    """
    GET: Retrieve a specific meeting
    PUT: Update a meeting (only for creator, Predstavnik suvlasnika and Administrator)
    DELETE: Delete a meeting (only for creator, Predstavnik suvlasnika and Administrator)
    """
    try:
        sastanak = Sastanak.objects.get(pk=pk)
    except Sastanak.DoesNotExist:
        return Response({'error': 'Sastanak ne postoji.'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = SastanakSerializer(sastanak)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        korisnik = request.user
        role = korisnik.get_role()
        
        # Check permissions
        if not (role in ['Administrator', 'Predstavnik suvlasnika'] or 
                sastanak.id_korisnik == korisnik):
            return Response(
                {'error': 'Nemate dozvolu za uređivanje ovog sastanka.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = SastanakSerializer(sastanak, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        korisnik = request.user
        role = korisnik.get_role()
        
        # Check permissions
        if not (role in ['Administrator', 'Predstavnik suvlasnika'] or 
                sastanak.id_korisnik == korisnik):
            return Response(
                {'error': 'Nemate dozvolu za brisanje ovog sastanka.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        sastanak.delete()
        return Response(
            {'message': 'Sastanak uspješno obrisan.'},
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sastanak_potvrda(request, pk):
    """
    POST: Confirm attendance for a meeting (for Suvlasnik)
    """
    try:
        sastanak = Sastanak.objects.get(pk=pk)
    except Sastanak.DoesNotExist:
        return Response({'error': 'Sastanak ne postoji.'}, status=status.HTTP_404_NOT_FOUND)
    
    korisnik = request.user
    potvrda = request.data.get('potvrda', True)
    
    # Get or create Sudjeluje record
    sudjelovanje, created = Sudjeluje.objects.get_or_create(
        id_korisnik=korisnik,
        id_sastanak=sastanak,
        defaults={'potvrda': potvrda, 'vrijeme_potvrde': timezone.now()}
    )
    
    if not created:
        # Update existing record
        sudjelovanje.potvrda = potvrda
        sudjelovanje.vrijeme_potvrde = timezone.now()
        sudjelovanje.save()
    
    serializer = SudjelujeSerializer(sudjelovanje)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sastanak_change_status(request, pk):
    """
    POST: Change meeting status (Planiran -> Objavljen -> Obavljen -> Arhiviran)
    Only for Predstavnik suvlasnika and Administrator
    """
    try:
        sastanak = Sastanak.objects.get(pk=pk)
    except Sastanak.DoesNotExist:
        return Response({'error': 'Sastanak ne postoji.'}, status=status.HTTP_404_NOT_FOUND)
    
    korisnik = request.user
    role = korisnik.get_role()
    
    if role not in ['Administrator', 'Predstavnik suvlasnika']:
        return Response(
            {'error': 'Nemate dozvolu za promjenu statusa sastanka.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    new_status_name = request.data.get('status')
    if not new_status_name:
        return Response(
            {'error': 'Status je obavezan.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        if sastanak.id_status.naziv_status == new_status_name:
            serializer = SastanakSerializer(sastanak)
            return Response(serializer.data, status=status.HTTP_200_OK)

        new_status = StatusSastanka.objects.get(naziv_status=new_status_name)
        sastanak.id_status = new_status
        sastanak.save()
        
        if new_status_name == 'Objavljen':
            all_users = Korisnik.objects.filter(aktivan=True)
            subject = f'Novi sastanak objavljen: {sastanak.naslov}'
            message = f'''
Poštovani,

Novi sastanak je objavljen i sada je dostupan za pregled.

Detalji sastanka:
Naslov: {sastanak.naslov}
Datum i vrijeme: {sastanak.datum_vrijeme.strftime('%d.%m.%Y. u %H:%Mh')}
Lokacija: {sastanak.lokacija}

Molimo vas da potvrdite svoj dolazak.

Ova poruka je generirana automatski i ne trebate na nju odgovarati.

Lijep pozdrav,
StanPlan
'''
            # recipient_list = [user.email for user in all_users]

            recipient_list = ["luka.mateskovicc@gmail.com"]

            print("Sending email to:", recipient_list)
            
            try:
                send_mail(
                    subject,
                    message, 
                    settings.EMAIL_HOST_USER,
                    recipient_list,
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Error sending email: {e}")

        serializer = SastanakSerializer(sastanak)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except StatusSastanka.DoesNotExist:
        return Response(
            {'error': f'Status "{new_status_name}" ne postoji.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_zakljucci(request):
    """
    POST: Create multiple conclusions (zakljucci) at once
    Expected data format:
    [
        {
            "id_tocke": 1,
            "tekst": "Zaključak tekst",
            "status": "Izglasan" or "Odbijen" or null
        },
        ...
    ]
    """
    korisnik = request.user
    
    if not isinstance(korisnik, Korisnik):
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    zakljucci_data = request.data
    
    if not isinstance(zakljucci_data, list):
        return Response(
            {'error': 'Očekivana je lista zaključaka.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    created_zakljucci = []
    errors = []
    
    for zakljucak_data in zakljucci_data:
        # Skip if tekst is empty or None
        if not zakljucak_data.get('tekst') or zakljucak_data.get('tekst').strip() == '':
            continue
            
        # Add the current user's ID
        zakljucak_data['id_korisnik'] = korisnik.id_korisnik
        
        # Verify that the tocka exists
        id_tocke = zakljucak_data.get('id_tocke')
        if not id_tocke:
            errors.append({'error': 'id_tocke je obavezan', 'data': zakljucak_data})
            continue
            
        try:
            tocka = TockeDnevReda.objects.get(pk=id_tocke)
        except TockeDnevReda.DoesNotExist:
            errors.append({'error': f'Točka s ID {id_tocke} ne postoji', 'data': zakljucak_data})
            continue
        
        serializer = ZakljucakSerializer(data=zakljucak_data)
        if serializer.is_valid():
            zakljucak = serializer.save()
            created_zakljucci.append(serializer.data)
        else:
            errors.append({'error': serializer.errors, 'data': zakljucak_data})
    
    if errors and not created_zakljucci:
        return Response(
            {'error': 'Niti jedan zaključak nije kreiran', 'details': errors},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    response_data = {
        'created': created_zakljucci,
        'count': len(created_zakljucci)
    }
    
    if errors:
        response_data['errors'] = errors
    
    return Response(response_data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_zakljucci_by_sastanak(request, sastanak_id):
    """
    GET: Get all conclusions for a specific meeting
    Returns conclusions grouped by agenda items
    """
    try:
        sastanak = Sastanak.objects.get(pk=sastanak_id)
    except Sastanak.DoesNotExist:
        return Response({'error': 'Sastanak ne postoji.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get all agenda items (tocke) for this meeting
    tocke = TockeDnevReda.objects.filter(id_sastanak=sastanak).order_by('broj_tocke')
    
    result = []
    for tocka in tocke:
        # Get conclusions for this tocka
        zakljucci = Zakljucak.objects.filter(id_tocke=tocka).order_by('-unesen_u')
        zakljucci_data = ZakljucakSerializer(zakljucci, many=True).data
        
        result.append({
            'id_tocke': tocka.id_tocke,
            'broj_tocke': tocka.broj_tocke,
            'naziv': tocka.naziv,
            'zakljucci': zakljucci_data
        })
    
    return Response(result, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_zakljucci_by_tocka(request, tocka_id):
    """
    GET: Get all conclusions for a specific agenda item (tocka)
    """
    try:
        tocka = TockeDnevReda.objects.get(pk=tocka_id)
    except TockeDnevReda.DoesNotExist:
        return Response({'error': 'Točka dnevnog reda ne postoji.'}, status=status.HTTP_404_NOT_FOUND)
    
    zakljucci = Zakljucak.objects.filter(id_tocke=tocka).order_by('-unesen_u')
    serializer = ZakljucakSerializer(zakljucci, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)