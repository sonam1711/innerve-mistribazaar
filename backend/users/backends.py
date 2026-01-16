"""
Custom authentication backend for phone-based login
"""
from django.contrib.auth.backends import ModelBackend
from .models import User


class PhoneBackend(ModelBackend):
    """
    Authenticate using phone number instead of username
    """
    
    def authenticate(self, request, phone=None, password=None, **kwargs):
        try:
            user = User.objects.get(phone=phone)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
