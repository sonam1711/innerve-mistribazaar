"""
Supabase JWT Authentication for Django REST Framework
Verifies Supabase JWT tokens and links to Django users
"""
from rest_framework import authentication, exceptions
from django.conf import settings
import jwt
import requests
from users.models import User


class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Supabase JWT tokens
    """
    
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode and verify the Supabase JWT token
            decoded = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                audience='authenticated'
            )
            
            supabase_user_id = decoded.get('sub')
            email = decoded.get('email')
            
            if not supabase_user_id:
                raise exceptions.AuthenticationFailed('Invalid token: missing user ID')
            
            if not email:
                raise exceptions.AuthenticationFailed('Invalid token: missing email')
            
            # Get or create Django user linked to Supabase user
            user, created = User.objects.get_or_create(
                supabase_id=supabase_user_id,
                defaults={
                    'email': email,
                    'name': decoded.get('user_metadata', {}).get('name', email.split('@')[0]),
                }
            )
            
            # Update email if it changed in Supabase
            if email and user.email != email:
                user.email = email
                user.save()
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
