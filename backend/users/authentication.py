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
        # Try both META (WSGI standard) and headers (DRF/ASGI)
        auth_header = request.META.get('HTTP_AUTHORIZATION') or request.headers.get('Authorization')
        
        print(f"DEBUG: Auth Header: {auth_header[:20] if auth_header else 'None'}...")
        
        if not auth_header:
            print("DEBUG: No auth header found")
            return None
        
        if not auth_header.startswith('Bearer '):
            print("DEBUG: Invalid header prefix")
            return None
        
        token = auth_header.split(' ')[1]
        print(f"DEBUG: Token found: {token[:10]}...")
        
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
            user_metadata = decoded.get('user_metadata', {})
            
            if not supabase_user_id:
                raise exceptions.AuthenticationFailed('Invalid token: missing user ID')
            
            if not email:
                raise exceptions.AuthenticationFailed('Invalid token: missing email')
            
            # Get or create Django user linked to Supabase user
            user, created = User.objects.get_or_create(
                supabase_id=supabase_user_id,
                defaults={
                    'email': email,
                    'name': user_metadata.get('name', email.split('@')[0]),
                    'phone': user_metadata.get('phone'),
                    'role': user_metadata.get('role', 'CUSTOMER'),
                    'latitude': user_metadata.get('latitude'),
                    'longitude': user_metadata.get('longitude'),
                }
            )
            
            # Update user details if they changed in Supabase metadata
            should_save = False
            
            if email and user.email != email:
                user.email = email
                should_save = True
                
            # Update fields from metadata if they exist and are different
            if user_metadata.get('phone') and user.phone != user_metadata.get('phone'):
                user.phone = user_metadata.get('phone')
                should_save = True
                
            if user_metadata.get('role') and user.role != user_metadata.get('role'):
                user.role = user_metadata.get('role')
                should_save = True
                
            if user_metadata.get('name') and user.name != user_metadata.get('name'):
                user.name = user_metadata.get('name')
                should_save = True
                
            if user_metadata.get('latitude') and user.latitude != user_metadata.get('latitude'):
                user.latitude = user_metadata.get('latitude')
                should_save = True
                
            if user_metadata.get('longitude') and user.longitude != user_metadata.get('longitude'):
                user.longitude = user_metadata.get('longitude')
                should_save = True
                
            if should_save:
                user.save()
            
            return (user, token)
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            print(f"DEBUG: Auth Exception: {str(e)}")
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
