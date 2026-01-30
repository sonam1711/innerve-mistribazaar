"""
Notification Service for Mistri
Handles SMS and Voice notifications for nearby jobs
"""
import logging
from typing import Dict, List
from django.conf import settings
from .sms_service import SMSService


logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service to send notifications to Mistri users
    Supports SMS and Voice calls for job alerts
    """
    
    def __init__(self):
        self.sms_service = SMSService()
    
    def send_job_notification_sms(self, phone: str, job_data: Dict) -> bool:
        """
        Send SMS notification to mistri about a nearby job
        
        Args:
            phone: Mistri's phone number
            job_data: Dictionary with job details (title, location, budget, etc.)
        
        Returns:
            bool: True if notification sent successfully
        """
        try:
            message = self._format_job_sms(job_data)
            success = self.sms_service.send_sms(phone, message)
            
            if success:
                logger.info(f"Job notification SMS sent to {phone}")
            else:
                logger.error(f"Failed to send job notification SMS to {phone}")
            
            return success
        except Exception as e:
            logger.error(f"Error sending job notification SMS: {str(e)}")
            return False
    
    def send_job_notification_voice(self, phone: str, job_data: Dict, language: str = 'en') -> bool:
        """
        Send voice call notification to mistri about a nearby job
        Uses text-to-speech for job details
        
        Args:
            phone: Mistri's phone number
            job_data: Dictionary with job details
            language: Language code for voice (en, hi, ta, etc.)
        
        Returns:
            bool: True if notification sent successfully
        """
        try:
            # Format message in specified language
            message = self._format_job_voice_message(job_data, language)
            
            # Send voice call using MSG91 or Twilio
            success = self._send_voice_call(phone, message, language)
            
            if success:
                logger.info(f"Job notification voice call sent to {phone}")
            else:
                logger.error(f"Failed to send job notification voice call to {phone}")
            
            return success
        except Exception as e:
            logger.error(f"Error sending job notification voice call: {str(e)}")
            return False
    
    def notify_nearby_mistris(self, job, mistri_list: List) -> Dict:
        """
        Send notifications to all mistri users near a job location
        
        Args:
            job: Job instance
            mistri_list: List of User instances with role MISTRI
        
        Returns:
            Dict with notification stats (sent, failed counts)
        """
        stats = {
            'sms_sent': 0,
            'sms_failed': 0,
            'voice_sent': 0,
            'voice_failed': 0
        }
        
        job_data = {
            'title': job.title,
            'job_type': job.get_job_type_display(),
            'location': job.address,
            'budget_min': job.budget_min,
            'budget_max': job.budget_max,
            'job_id': job.id
        }
        
        for mistri in mistri_list:
            try:
                # Get mistri preferences from profile
                mistri_profile = mistri.mistri_profile
                
                # Send SMS if enabled
                if mistri_profile.sms_notifications:
                    if self.send_job_notification_sms(mistri.phone, job_data):
                        stats['sms_sent'] += 1
                    else:
                        stats['sms_failed'] += 1
                
                # Send voice call if enabled
                if mistri_profile.call_notifications:
                    if self.send_job_notification_voice(mistri.phone, job_data, mistri.language):
                        stats['voice_sent'] += 1
                    else:
                        stats['voice_failed'] += 1
            
            except Exception as e:
                logger.error(f"Error notifying mistri {mistri.id}: {str(e)}")
                continue
        
        logger.info(f"Notification stats for job {job.id}: {stats}")
        return stats
    
    def _format_job_sms(self, job_data: Dict) -> str:
        """Format job details for SMS"""
        return (
            f"New job nearby!\n"
            f"Type: {job_data['job_type']}\n"
            f"Location: {job_data['location']}\n"
            f"Budget: ₹{job_data['budget_min']}-{job_data['budget_max']}\n"
            f"Job ID: {job_data['job_id']}"
        )
    
    def _format_job_voice_message(self, job_data: Dict, language: str) -> str:
        """
        Format job details for voice message in specified language
        """
        # Message templates for different languages
        templates = {
            'en': (
                f"Hello, a new job is available near you. "
                f"Job type is {job_data['job_type']}. "
                f"Location is {job_data['location']}. "
                f"Budget is from {job_data['budget_min']} to {job_data['budget_max']} rupees. "
                f"Job ID is {job_data['job_id']}. "
                f"Please check the app for more details."
            ),
            'hi': (
                f"नमस्ते, आपके पास एक नया काम उपलब्ध है। "
                f"काम का प्रकार {job_data['job_type']} है। "
                f"स्थान {job_data['location']} है। "
                f"बजट {job_data['budget_min']} से {job_data['budget_max']} रुपये है। "
                f"कृपया अधिक जानकारी के लिए ऐप देखें।"
            ),
            'ta': (
                f"வணக்கம், உங்களுக்கு அருகில் ஒரு புதிய வேலை உள்ளது। "
                f"வேலை வகை {job_data['job_type']}. "
                f"இடம் {job_data['location']}. "
                f"பட்ஜெட் {job_data['budget_min']} முதல் {job_data['budget_max']} ரூபாய். "
                f"மேலும் விவரங்களுக்கு பயன்பாட்டைப் பார்க்கவும்."
            )
        }
        
        return templates.get(language, templates['en'])
    
    def _send_voice_call(self, phone: str, message: str, language: str) -> bool:
        """
        Send voice call using MSG91 or Twilio
        
        For production, integrate with:
        - MSG91 Voice API
        - Twilio Programmable Voice
        - Or Gemini TTS API for voice generation
        """
        # Get SMS provider from settings
        provider = getattr(settings, 'SMS_PROVIDER', 'console')
        
        if provider == 'console':
            # Development mode - log to console
            logger.info(f"[VOICE CALL] To: {phone}, Language: {language}")
            logger.info(f"[VOICE CALL] Message: {message}")
            return True
        
        elif provider == 'msg91':
            # MSG91 Voice API integration
            return self._send_msg91_voice(phone, message, language)
        
        elif provider == 'twilio':
            # Twilio Voice API integration
            return self._send_twilio_voice(phone, message, language)
        
        else:
            logger.error(f"Unknown voice provider: {provider}")
            return False
    
    def _send_msg91_voice(self, phone: str, message: str, language: str) -> bool:
        """
        Send voice call using MSG91 Voice API
        https://docs.msg91.com/p/tf9GTextN/e/YogOz6R3f/MSG91
        """
        import requests
        
        try:
            auth_key = getattr(settings, 'MSG91_AUTH_KEY', None)
            if not auth_key:
                logger.error("MSG91_AUTH_KEY not configured")
                return False
            
            url = "https://api.msg91.com/api/v5/voice/call"
            
            payload = {
                "authkey": auth_key,
                "mobiles": phone,
                "message": message,
                "language": self._get_msg91_language_code(language)
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                return True
            else:
                logger.error(f"MSG91 voice API error: {response.text}")
                return False
        
        except Exception as e:
            logger.error(f"MSG91 voice error: {str(e)}")
            return False
    
    def _send_twilio_voice(self, phone: str, message: str, language: str) -> bool:
        """
        Send voice call using Twilio Programmable Voice
        https://www.twilio.com/docs/voice
        """
        try:
            from twilio.rest import Client
            
            account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
            auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
            from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
            
            if not all([account_sid, auth_token, from_number]):
                logger.error("Twilio credentials not configured")
                return False
            
            client = Client(account_sid, auth_token)
            
            # Create TwiML for text-to-speech
            twiml = f'<Response><Say language="{self._get_twilio_language_code(language)}">{message}</Say></Response>'
            
            call = client.calls.create(
                twiml=twiml,
                to=phone,
                from_=from_number
            )
            
            return call.sid is not None
        
        except Exception as e:
            logger.error(f"Twilio voice error: {str(e)}")
            return False
    
    def _get_msg91_language_code(self, language: str) -> str:
        """Map internal language codes to MSG91 language codes"""
        mapping = {
            'en': 'en',
            'hi': 'hi',
            'ta': 'ta',
            'te': 'te',
            'kn': 'kn',
            'ml': 'ml',
            'mr': 'mr',
            'bn': 'bn',
            'gu': 'gu',
            'pa': 'pa'
        }
        return mapping.get(language, 'en')
    
    def _get_twilio_language_code(self, language: str) -> str:
        """Map internal language codes to Twilio language codes"""
        mapping = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'kn': 'kn-IN',
            'ml': 'ml-IN',
            'mr': 'mr-IN',
            'bn': 'bn-IN',
            'gu': 'gu-IN',
            'pa': 'pa-IN'
        }
        return mapping.get(language, 'en-IN')


# Singleton instance
notification_service = NotificationService()
