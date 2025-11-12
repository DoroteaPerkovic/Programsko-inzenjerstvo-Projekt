import bcrypt
from django.contrib.auth.backends import BaseBackend
from .models import Korisnik


class KorisnikAuthBackend(BaseBackend):

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        try:
            if '@' in username:
                korisnik = Korisnik.objects.get(email=username, aktivan=True)
            else:
                korisnik = Korisnik.objects.get(korisnicko_ime=username, aktivan=True)

            if bcrypt.checkpw(password.encode('utf-8'), korisnik.password_hash.encode('utf-8')):
                return korisnik
        except Korisnik.DoesNotExist:
            return None
        except Exception as e:
            print(f"Authentication error: {e}")
            return None

        return None

    def get_user(self, user_id):
        try:
            return Korisnik.objects.get(pk=user_id)
        except Korisnik.DoesNotExist:
            return None


def hash_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password, password_hash):
    try:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except Exception:
        return False
