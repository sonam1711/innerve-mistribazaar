"""
OTP Management for phone number authentication
Provides functionality for generating, sending, and verifying OTPs
"""
import random
import string
from datetime import datetime, timedelta
from django.core.cache import cache
from django.conf import settings
from .sms_service import SMSService


class OTPManager:
    """Manage OTP generation and verification"""
    
    OTP_EXPIRY_MINUTES = 10
    OTP_LENGTH = 6
    MAX_ATTEMPTS = 3
    
    @staticmethod
    def generate_otp():
        """Generate a random 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=OTPManager.OTP_LENGTH))
    
    @staticmethod
    def get_cache_key(phone, purpose='login'):
        """Get cache key for storing OTP"""
        return f'otp_{purpose}_{phone}'
    
    @staticmethod
    def get_attempts_key(phone, purpose='login'):
        """Get cache key for tracking attempts"""
        return f'otp_attempts_{purpose}_{phone}'
    
    @staticmethod
    def send_otp(phone, purpose='login'):
        """
        Generate and send OTP to phone number
        Returns: (success: bool, otp: str, message: str)
        """
        # Check if user has exceeded rate limits
        attempts_key = OTPManager.get_attempts_key(phone, purpose)
        attempts = cache.get(attempts_key, 0)
        
        if attempts >= 5:  # Max 5 OTP requests per hour
            return False, None, 'Too many OTP requests. Please try again later.'
        
        # Generate OTP
        otp = OTPManager.generate_otp()
        
        # Store OTP in cache with expiry
        cache_key = OTPManager.get_cache_key(phone, purpose)
        cache.set(
            cache_key,
            {
                'otp': otp,
                'attempts': 0,
                'created_at': datetime.now().isoformat()
            },
            timeout=OTPManager.OTP_EXPIRY_MINUTES * 60
        )
        
        # Increment request attempts
        cache.set(attempts_key, attempts + 1, timeout=3600)  # 1 hour
        
        # Send SMS via configured provider
        sms_success, sms_message = SMSService.send_otp_sms(phone, otp)
        
        if not sms_success:
            # If SMS sending fails, delete the OTP from cache
            cache.delete(cache_key)
            return False, None, f'Failed to send OTP: {sms_message}'
        
        # In development, return OTP in response (remove in production)
        if settings.DEBUG:
            return True, otp, f'{sms_message}. OTP: {otp}'
        
        return True, None, sms_message
    
    @staticmethod
    def verify_otp(phone, otp, purpose='login'):
        """
        Verify OTP for phone number
        Returns: (success: bool, message: str)
        """
        cache_key = OTPManager.get_cache_key(phone, purpose)
        otp_data = cache.get(cache_key)
        
        if not otp_data:
            return False, 'OTP expired or not found. Please request a new one.'
        
        # Check attempts
        if otp_data.get('attempts', 0) >= OTPManager.MAX_ATTEMPTS:
            cache.delete(cache_key)
            return False, 'Maximum verification attempts exceeded. Please request a new OTP.'
        
        # Verify OTP
        if otp_data.get('otp') != otp:
            # Increment failed attempts
            otp_data['attempts'] = otp_data.get('attempts', 0) + 1
            cache.set(
                cache_key,
                otp_data,
                timeout=OTPManager.OTP_EXPIRY_MINUTES * 60
            )
            return False, 'Invalid OTP. Please try again.'
        
        # OTP is valid, delete from cache
        cache.delete(cache_key)
        return True, 'OTP verified successfully'
    
    @staticmethod
    def resend_otp(phone, purpose='login'):
        """
        Resend OTP (same as send_otp but may have different rate limits)
        """
        return OTPManager.send_otp(phone, purpose)
