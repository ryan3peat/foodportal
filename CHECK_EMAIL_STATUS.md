# How to Check if Email Was Sent

## Step 1: Check Server Terminal Logs

Look at your terminal where `npm run dev` is running. You should see logs like:

### ✅ Success (Google Gmail):
```
📧 Email Service Configuration:
   Provider: google
📧 [google] Attempting to send email to mark@3peat.ai
📧 Sending email via Gmail API
To: mark@3peat.ai
From: your-email@gmail.com
Subject: Contact Form Submission from [Name]
✅ Email sent successfully to mark@3peat.ai
   Message ID: 18abc123...
✅ Contact form emails sent successfully to mark@3peat.ai, ryan@3peat.ai
```

### ❌ Error (Missing Credentials):
```
❌ Failed to initialize Google Gmail email provider: Error: Missing required Google credentials
```

### ⚠️ Using Mock (Not Actually Sending):
```
📧 Email Service Configuration:
   ⚠️  Demo Mode: Email service disabled (using mock)
📧 MOCK EMAIL
To: mark@3peat.ai
```

## Step 2: Verify Environment Variables

Make sure your `.env.local` file has:
```env
EMAIL_PROVIDER=google
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REFRESH_TOKEN=your-refresh-token-here
SENDER_EMAIL=your-email@gmail.com
```

**Important:** 
- `SENDER_EMAIL` must be the Gmail address you used to authorize OAuth
- `GOOGLE_REFRESH_TOKEN` must be the token you generated with the script

## Step 3: Check Email Inboxes

1. **Check `mark@3peat.ai` inbox** - look for subject: "Contact Form Submission from [Name]"
2. **Check `ryan@3peat.ai` inbox** - same subject
3. **Check spam/junk folders** - emails might be filtered
4. **Check the sender's Gmail Sent folder** - emails sent via Gmail API appear in the sender's sent folder

## Step 4: Common Issues

### Issue: "Missing required Google credentials"
- **Fix:** Make sure all 4 environment variables are set in `.env.local`
- **Restart the server** after adding environment variables

### Issue: "invalid_grant" or "Token expired"
- **Fix:** Generate a new refresh token using `get-refresh-token.js`

### Issue: Emails going to spam
- **Fix:** This is normal for new senders. Check spam folders.

### Issue: Server logs show "MOCK EMAIL"
- **Fix:** Set `EMAIL_PROVIDER=google` in `.env.local` and restart server

## Step 5: Test Again

1. Make sure server is running: `npm run dev`
2. Submit the contact form again
3. Watch the terminal logs immediately
4. Check for any error messages

