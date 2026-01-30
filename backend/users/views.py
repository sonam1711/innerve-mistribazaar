"""
Authentication views for user registration and login
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserRegistrationSerializer, UserSerializer, UserUpdateSerializer
from .otp_manager import OTPManager


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint
    Accepts: name, phone, password, role, and role-specific profile data
    """
    
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        print("===== REGISTRATION DEBUG =====")
        print(f"Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    User login endpoint
    Accepts: phone, password
    Returns: JWT tokens and user data
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        password = request.data.get('password')
        
        if not phone or not password:
            return Response({
                'error': 'Phone and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user
        user = authenticate(request, phone=phone, password=password)
        
        if user is None:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user's profile
    """
    
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return UserUpdateSerializer
        return UserSerializer
    
    def get_object(self):
        return self.request.user


class UserDetailView(generics.RetrieveAPIView):
    """
    Get details of any user by ID
    """
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class SendOTPView(APIView):
    """
    Send OTP to phone number for authentication
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        purpose = request.data.get('purpose', 'login')  # login or register
        
        if not phone:
            return Response({
                'error': 'Phone number is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists (for login)
        if purpose == 'login':
            user = User.objects.filter(phone=phone).first()
            if not user:
                return Response({
                    'error': 'No account found with this phone number'
                }, status=status.HTTP_404_NOT_FOUND)
        
        # Send OTP
        success, otp, message = OTPManager.send_otp(phone, purpose)
        
        if not success:
            return Response({
                'error': message
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        response_data = {
            'message': message,
            'phone': phone
        }
        
        # Include OTP in response for development only
        if otp:
            response_data['otp'] = otp
        
        return Response(response_data, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    """
    Verify OTP and login user
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        otp = request.data.get('otp')
        purpose = request.data.get('purpose', 'login')
        
        if not phone or not otp:
            return Response({
                'error': 'Phone number and OTP are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify OTP
        success, message = OTPManager.verify_otp(phone, otp, purpose)
        
        if not success:
            return Response({
                'error': message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user
        user = User.objects.filter(phone=phone).first()
        
        if not user:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not user.is_active:
            return Response({
                'error': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    """
    Resend OTP to phone number
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone = request.data.get('phone')
        purpose = request.data.get('purpose', 'login')
        
        if not phone:
            return Response({
                'error': 'Phone number is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Resend OTP
        success, otp, message = OTPManager.resend_otp(phone, purpose)
        
        if not success:
            return Response({
                'error': message
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        response_data = {
            'message': message,
            'phone': phone
        }
        
        # Include OTP in response for development only
        if otp:
            response_data['otp'] = otp
        
        return Response(response_data, status=status.HTTP_200_OK)
