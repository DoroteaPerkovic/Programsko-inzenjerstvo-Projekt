from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('role', 'stanblog_url')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        return super().get_token(user)
        
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field, '')
        
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                attrs[self.username_field] = user_obj.username
            except User.DoesNotExist:
                pass
        
        data = super().validate(attrs)
        
        user = self.user
        profile = UserProfile.objects.get(user=user)
        data['username'] = user.username
        data['userRole'] = profile.role
        
        return data
    