# Testing Email Setup

## Required Environment Variables

Make sure your `.env.local` file has these variables set:

```env
EMAIL_PROVIDER=google
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REFRESH_TOKEN=your-refresh-token-here
SENDER_EMAIL=your-email@gmail.com
```

**Important Notes:**
- `SENDER_EMAIL` must be the Gmail address you used to authorize the OAuth flow
- If you're in demo mode (no DATABASE_URL), the email service will default to 'mock' mode
- To test with real emails, you may need to set a DATABASE_URL (even a dummy one) or the code needs to be modified

## Testing Steps

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Check the server logs** - you should see:
   ```
   📧 Email Service Configuration:
      Provider: google
   ```

3. **Open the app** in your browser and click "Contact Us" button

4. **Fill out the form** and submit

5. **Check server logs** for email sending status

6. **Check email inboxes** at `mark@3peat.ai` and `ryan@3peat.ai`

