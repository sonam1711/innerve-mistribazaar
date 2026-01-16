# Quick Start Guide: SMS Integration

## Step-by-Step Setup

### For MSG91 (Recommended for India)

#### 1. Create MSG91 Account
```bash
# Visit https://msg91.com/ and sign up
# Verify your email and phone number
```

#### 2. Get API Credentials
1. Login to MSG91 Dashboard
2. Go to **Settings** → **API Keys**
3. Copy your **Auth Key**
4. Note it down - you'll need it

#### 3. Create OTP Template
1. Go to **Templates** in dashboard
2. Click **Create Template**
3. Select **OTP** category
4. Template content:
   ```
   Your Mistribazar OTP is ##OTP##. Valid for 10 minutes. Do not share.
   ```
5. Submit for approval (usually approved in 1-2 hours)
6. Copy the **Template ID** once approved

#### 4. Configure Environment Variables
Edit your `.env` file:
```bash
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your_actual_auth_key_from_step_2
MSG91_TEMPLATE_ID=your_actual_template_id_from_step_3
MSG91_SENDER_ID=MSGTST
```

#### 5. Test It
```bash
# Restart Django server
cd backend
python manage.py runserver

# In another terminal, test the API
curl -X POST http://localhost:8000/api/users/send-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# You should receive SMS on your phone!
```

---

### For Twilio (Global Service)

#### 1. Create Twilio Account
```bash
# Visit https://www.twilio.com/ and sign up
# Verify your email
```

#### 2. Get Free Trial Credits
- You get $15 free credit (enough for ~2500 SMS to India)
- Verify your phone number

#### 3. Get a Phone Number
1. Go to **Phone Numbers** → **Buy a Number**
2. Choose a number with SMS capability
3. Complete purchase (uses trial credits)

#### 4. Get API Credentials
1. Go to **Console Dashboard**
2. Find these values:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (from step 3)

#### 5. Install Twilio SDK
```bash
cd backend
pip install twilio
```

#### 6. Configure Environment Variables
Edit your `.env` file:
```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

#### 7. Test It
```bash
# Restart Django server
python manage.py runserver

# Test the API
curl -X POST http://localhost:8000/api/users/send-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# SMS should arrive within seconds!
```

---

## Testing in Development

### Option 1: Console Mode (No SMS Provider Needed)
Keep `SMS_PROVIDER=console` in your `.env` file.

The OTP will be printed in your terminal:
```
===========================================
📱 OTP SMS (Console Mode - Development Only)
===========================================
Phone: +919876543210
OTP: 123456
Message: Your Mistribazar OTP is 123456...
===========================================
```

### Option 2: With Real Provider (MSG91/Twilio)
1. Set provider in `.env`
2. Configure credentials
3. Restart server
4. Test with your own phone number first

---

## Common Issues & Solutions

### MSG91 Issues

**"Template not found"**
- Solution: Make sure template is approved. Check Template ID is correct.

**"Invalid Auth Key"**
- Solution: Regenerate Auth Key from dashboard and update `.env`

**No SMS received**
- Check phone number format: Should be +919876543210
- Check SMS credits in your account
- Check spam folder on phone
- Verify template is approved

### Twilio Issues

**"Unverified Callee"**
- Solution: In trial mode, you can only send to verified numbers
- Verify your phone number in Twilio console

**"Permission Denied"**
- Solution: Enable SMS for your country in Geographic Permissions

**No SMS received**
- Check phone number is in E.164 format: +919876543210
- Check trial balance
- Verify phone number is verified (trial mode)

---

## Production Deployment

### Before Going Live:

1. **Get Production Credentials**
   - MSG91: Upgrade to paid plan
   - Twilio: Add payment method

2. **Update Environment Variables**
   ```bash
   # On your server (e.g., Railway, Heroku, AWS)
   export SMS_PROVIDER=msg91
   export MSG91_AUTH_KEY=your_production_key
   export MSG91_TEMPLATE_ID=your_production_template
   ```

3. **Security**
   - Never commit `.env` file to git
   - Use environment variables on server
   - Enable rate limiting (already done)
   - Monitor SMS usage

4. **Testing**
   - Test with multiple phone numbers
   - Test in different regions
   - Monitor delivery rates
   - Set up alerts for failures

---

## Cost Estimation

### MSG91 Pricing (India)
- OTP SMS: ₹0.15 - ₹0.20 per SMS
- 1000 SMS ≈ ₹150 - ₹200
- No monthly fee, pay-as-you-go

### Twilio Pricing (India)
- SMS to India: $0.0058 per SMS (~₹0.50)
- 1000 SMS ≈ ₹500
- No monthly fee, pay-as-you-go

### Monthly Cost Examples:
- 100 users, 2 OTPs each = 200 SMS
  - MSG91: ₹30-40
  - Twilio: ₹100

- 1000 users, 2 OTPs each = 2000 SMS
  - MSG91: ₹300-400
  - Twilio: ₹1000

---

## Quick Commands

```bash
# Install required packages
pip install requests twilio

# Check if SMS service is working
python manage.py shell
>>> from users.sms_service import SMSService
>>> SMSService.send_otp_sms('+919876543210', '123456')

# Test OTP flow
curl -X POST http://localhost:8000/api/users/send-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "purpose": "login"}'

# Verify OTP
curl -X POST http://localhost:8000/api/users/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456", "purpose": "login"}'
```

---

## Support

- MSG91: https://msg91.com/help
- Twilio: https://support.twilio.com/
- Project: Check `backend/SMS_INTEGRATION_GUIDE.md`
