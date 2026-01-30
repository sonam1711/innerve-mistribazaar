# SMS Integration Guide for OTP

This guide covers integrating MSG91 and Twilio for sending OTP SMS messages.

## Option 1: MSG91 (Recommended for India)

MSG91 is popular in India with competitive pricing and good delivery rates.

### Step 1: Sign Up and Get Credentials

1. Go to https://msg91.com/
2. Sign up for an account
3. Verify your account and get credits
4. Get your credentials:
   - **Auth Key**: Found in Settings → API Keys
   - **Template ID**: Create an OTP template in Templates section
   - **Sender ID**: Default is "MSGTST" for testing, register your brand for production

### Step 2: Install Required Package

```bash
pip install requests
```

### Step 3: Add Environment Variables

Add to `.env` file or set in your environment:

```env
# MSG91 Configuration
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your_auth_key_here
MSG91_TEMPLATE_ID=your_template_id_here
MSG91_SENDER_ID=MSGTST
```

### Step 4: MSG91 Implementation

The code is already updated in `backend/users/sms_service.py`

### MSG91 Pricing (Approximate)
- Transactional SMS: ₹0.15 - ₹0.25 per SMS
- OTP SMS: ₹0.15 - ₹0.20 per SMS
- Free credits on signup for testing

---

## Option 2: Twilio (Global Service)

Twilio is widely used globally with excellent documentation.

### Step 1: Sign Up and Get Credentials

1. Go to https://www.twilio.com/
2. Sign up for an account
3. Verify your account
4. Get your credentials from Console Dashboard:
   - **Account SID**
   - **Auth Token**
   - **Phone Number**: Get a Twilio phone number

### Step 2: Install Twilio SDK

```bash
pip install twilio
```

### Step 3: Add Environment Variables

Add to `.env` file or set in your environment:

```env
# Twilio Configuration
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Twilio Implementation

The code is already updated in `backend/users/sms_service.py`

### Twilio Pricing (Approximate)
- SMS to India: $0.0058 per SMS (~₹0.50)
- Free trial: $15 credits (can send ~2500 SMS to India)

---

## Configuration

### 1. Update Django Settings

Add to `backend/config/settings.py`:

```python
# SMS Configuration
SMS_PROVIDER = os.environ.get('SMS_PROVIDER', 'console')  # 'msg91', 'twilio', or 'console'

# MSG91
MSG91_AUTH_KEY = os.environ.get('MSG91_AUTH_KEY', '')
MSG91_TEMPLATE_ID = os.environ.get('MSG91_TEMPLATE_ID', '')
MSG91_SENDER_ID = os.environ.get('MSG91_SENDER_ID', 'MSGTST')

# Twilio
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '')
```

### 2. Install python-decouple (Optional but Recommended)

For better environment variable management:

```bash
pip install python-decouple
```

Then update settings.py:

```python
from decouple import config

SMS_PROVIDER = config('SMS_PROVIDER', default='console')
MSG91_AUTH_KEY = config('MSG91_AUTH_KEY', default='')
# ... etc
```

---

## Testing

### Test in Development (Console Mode)

Keep `SMS_PROVIDER=console` in development to see OTPs in console/logs.

### Test with Real SMS

1. Set environment variables for your chosen provider
2. Set `SMS_PROVIDER=msg91` or `SMS_PROVIDER=twilio`
3. Restart Django server
4. Test OTP flow with your phone number

### Example Testing Flow:

```bash
# Set environment variables
export SMS_PROVIDER=msg91
export MSG91_AUTH_KEY=your_key
export MSG91_TEMPLATE_ID=your_template

# Restart server
python manage.py runserver

# Test API
curl -X POST http://localhost:8000/api/users/send-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "purpose": "login"}'
```

---

## MSG91 Template Setup

For MSG91, you need to create an OTP template:

1. Login to MSG91 dashboard
2. Go to **Templates** section
3. Click **Create Template**
4. Choose **OTP** category
5. Create template like:

```
Your Mistribazar OTP is ##OTP##. Valid for 10 minutes. Do not share with anyone.
```

6. Submit for approval (usually approved within hours)
7. Note the Template ID

---

## Production Checklist

- [ ] Choose SMS provider based on your region
- [ ] Sign up and verify account
- [ ] Get production credits/subscription
- [ ] Set up proper sender ID/phone number
- [ ] Create and approve message templates
- [ ] Set environment variables in production
- [ ] Test with multiple phone numbers
- [ ] Monitor delivery rates and costs
- [ ] Set up alerts for failed deliveries
- [ ] Implement SMS delivery webhooks (optional)

---

## Troubleshooting

### MSG91 Issues:

**Template not found**: Make sure template is approved and you're using correct Template ID

**Authentication failed**: Verify your Auth Key is correct

**DND (Do Not Disturb)**: Some numbers are on DND list, use transactional route

**International SMS not working**: MSG91 requires separate setup for international SMS

### Twilio Issues:

**Unverified number**: In trial mode, you can only send to verified numbers

**Geographic permissions**: Enable SMS for your target countries in settings

**Rate limits**: Check your account limits

**Invalid phone format**: Ensure phone numbers are in E.164 format (+919876543210)

---

## Cost Optimization Tips

1. **Rate Limiting**: Already implemented in `otp_manager.py`
2. **OTP Expiry**: 10 minutes expiry reduces unnecessary resends
3. **Attempt Limits**: Max 3 verification attempts per OTP
4. **Cooldown**: 30 seconds between resend requests
5. **Batch Processing**: If sending bulk SMS, use batch APIs
6. **Monitor**: Set up alerts for unusual SMS volumes

---

## Security Best Practices

1. ✅ Never expose OTP in production API responses
2. ✅ Use HTTPS for all API calls
3. ✅ Implement rate limiting (already done)
4. ✅ Set short OTP expiry times
5. ✅ Limit verification attempts
6. ✅ Log all OTP activities for audit
7. ✅ Use templates to prevent SMS injection
8. ✅ Validate phone numbers before sending
9. 🔒 Consider adding CAPTCHA before OTP send
10. 🔒 Implement device fingerprinting

---

## Alternative Providers (India)

- **Kaleyra** - Enterprise-grade, used by many Indian startups
- **Gupshup** - Good for conversational messaging
- **Airtel IQ** - Telecom-backed service
- **Fast2SMS** - Budget-friendly option
- **TextLocal** - Good for small businesses

---

## Support

- MSG91 Support: https://msg91.com/help
- Twilio Support: https://support.twilio.com/
- Project Issues: Check `backend/users/sms_service.py` logs
