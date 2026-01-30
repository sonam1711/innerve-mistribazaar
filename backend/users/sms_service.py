"""
SMS Service for sending OTP messages
Supports MSG91 and Twilio providers
"""
import requests
from django.conf import settings


class SMSService:
    """SMS sending service with multiple provider support"""
    
    @staticmethod
    def send_otp_sms(phone, otp):
        """
        Send OTP SMS to phone number
        Returns: (success: bool, message: str)
        """
        provider = getattr(settings, 'SMS_PROVIDER', 'console')
        
        if provider == 'msg91':
            return SMSService._send_via_msg91(phone, otp)
        elif provider == 'twilio':
            return SMSService._send_via_twilio(phone, otp)
        else:
            # Console mode for development
            return SMSService._send_via_console(phone, otp)
    
    @staticmethod
    def _send_via_msg91(phone, otp):
        """Send SMS via MSG91"""
        try:
            auth_key = getattr(settings, 'MSG91_AUTH_KEY', '')
            template_id = getattr(settings, 'MSG91_TEMPLATE_ID', '')
            sender_id = getattr(settings, 'MSG91_SENDER_ID', 'MSGTST')
            
            if not auth_key or not template_id:
                return False, 'MSG91 credentials not configured'
            
            # Clean phone number (remove + and spaces)
            phone_clean = phone.replace('+', '').replace(' ', '').replace('-', '')
            
            # MSG91 API endpoint
            url = 'https://control.msg91.com/api/v5/otp'
            
            # Request parameters
            params = {
                'template_id': template_id,
                'mobile': phone_clean,
                'authkey': auth_key,
                'otp': otp,
                'otp_length': 6,
                'sender': sender_id
            }
            
            headers = {
                'Content-Type': 'application/json',
                'authkey': auth_key
            }
            
            # Alternative API - Direct SMS send (if OTP API not working)
            # url = 'https://control.msg91.com/api/v5/flow/'
            # payload = {
            #     'flow_id': template_id,
            #     'sender': sender_id,
            #     'mobiles': phone_clean,
            #     'VAR1': otp,  # Variable in template
            #     'VAR2': '10'   # Expiry time
            # }
            
            response = requests.post(url, json=params, headers=headers, timeout=10)
            
            if response.status_code == 200:
                return True, 'OTP sent successfully via MSG91'
            else:
                error_msg = response.json().get('message', 'Unknown error')
                print(f'[MSG91 Error] {response.status_code}: {error_msg}')
                return False, f'Failed to send SMS: {error_msg}'
                
        except Exception as e:
            print(f'[MSG91 Exception] {str(e)}')
            return False, f'SMS service error: {str(e)}'
    
    @staticmethod
    def _send_via_twilio(phone, otp):
        """Send SMS via Twilio"""
        try:
            # Import Twilio only when needed
            try:
                from twilio.rest import Client
            except ImportError:
                return False, 'Twilio package not installed. Install with: pip install twilio'
            
            account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
            auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
            from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', '')
            
            if not account_sid or not auth_token or not from_number:
                return False, 'Twilio credentials not configured'
            
            # Create Twilio client
            client = Client(account_sid, auth_token)
            
            # Compose message
            message_body = f'Your Mistribazar OTP is {otp}. Valid for 10 minutes. Do not share with anyone.'
            
            # Send SMS
            message = client.messages.create(
                body=message_body,
                from_=from_number,
                to=phone
            )
            
            if message.sid:
                return True, f'OTP sent successfully via Twilio (SID: {message.sid})'
            else:
                return False, 'Failed to send SMS via Twilio'
                
        except Exception as e:
            print(f'[Twilio Exception] {str(e)}')
            return False, f'SMS service error: {str(e)}'
    
    @staticmethod
    def _send_via_console(phone, otp):
        """
        Console mode for development
        Just prints OTP to console instead of sending SMS
        """
        print('=' * 60)
        print('📱 OTP SMS (Console Mode - Development Only)')
        print('=' * 60)
        print(f'Phone: {phone}')
        print(f'OTP: {otp}')
        print(f'Message: Your Mistribazar OTP is {otp}. Valid for 10 minutes.')
        print('=' * 60)
        return True, f'OTP sent via console (Development mode)'


# Utility functions

def validate_phone_number(phone):
    """
    Validate Indian phone number format
    Accepts: +919876543210, 919876543210, 9876543210
    Returns: (valid: bool, formatted_phone: str, message: str)
    """
    import re
    
    # Remove spaces and dashes
    phone = phone.replace(' ', '').replace('-', '')
    
    # Pattern for Indian phone numbers
    patterns = [
        r'^\+91[6-9]\d{9}$',      # +919876543210
        r'^91[6-9]\d{9}$',         # 919876543210
        r'^[6-9]\d{9}$',           # 9876543210
    ]
    
    for pattern in patterns:
        if re.match(pattern, phone):
            # Ensure it starts with +91
            if not phone.startswith('+'):
                if phone.startswith('91'):
                    phone = '+' + phone
                else:
                    phone = '+91' + phone
            return True, phone, 'Valid phone number'
    
    return False, phone, 'Invalid Indian phone number format'


def format_phone_for_display(phone):
    """
    Format phone number for display
    +919876543210 -> +91 98765-43210
    """
    phone = phone.replace(' ', '').replace('-', '')
    if phone.startswith('+91'):
        digits = phone[3:]
        return f'+91 {digits[:5]}-{digits[5:]}'
    return phone
