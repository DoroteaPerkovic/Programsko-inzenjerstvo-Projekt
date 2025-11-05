from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    USER_ROLES = [
        ('admin', 'Administrator'),
        ('predstavnik', 'Predstavnik suvlasnika'),
        ('suvlasnik', 'Suvlasnik'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=USER_ROLES, default='suvlasnik')
    stanblog_url = models.URLField(blank=True, null=True)  # za povezivanje sučelja

    def __str__(self):
        return self.user.username

