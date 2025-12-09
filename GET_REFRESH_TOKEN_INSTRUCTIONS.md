# How to Generate Google Refresh Token

## Quick Steps

1. **Get your Client Secret** from `.env.local` (line 7)
   - It should look like: `GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx...`

2. **Edit the script** `get-refresh-token.mjs`
   - Replace `YOUR_CLIENT_SECRET_HERE` on line 6 with your actual client secret

3. **Run the script** in Cursor terminal:
   ```bash
   node get-refresh-token.mjs
   ```

4. **Follow the prompts:**
   - The script will show you a URL
   - Copy and paste that URL into your browser
   - Sign in with your Google account
   - Click "Allow" to grant permissions
   - You'll be redirected to an error page (this is normal!)
   - Copy the ENTIRE URL from the address bar
   - Paste it back into the terminal

5. **Copy the refresh token** that the script outputs
   - Add it to your `.env.local` file as: `GOOGLE_REFRESH_TOKEN=...`

## Alternative: Manual Method

If the script doesn't work, you can do it manually:

1. **Build the authorization URL:**
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=535649405660-61nqvekkeup0gt402u8es3j74lkl8kq7.apps.googleusercontent.com&redirect_uri=http://localhost:3000/oauth2callback&response_type=code&scope=https://www.googleapis.com/auth/gmail.send&access_type=offline&prompt=consent
   ```

2. **Visit that URL** in your browser and authorize

3. **After authorization**, you'll be redirected to a URL like:
   ```
   http://localhost:3000/oauth2callback?code=4/0AeanRxxxxx...
   ```

4. **Extract the code** from the URL (the part after `code=`)

5. **Use this Node.js command** (replace YOUR_CLIENT_SECRET and CODE):
   ```javascript
   node -e "import('googleapis').then(({google}) => { const oauth2 = new google.auth.OAuth2('535649405660-61nqvekkeup0gt402u8es3j74lkl8kq7.apps.googleusercontent.com', 'YOUR_CLIENT_SECRET', 'http://localhost:3000/oauth2callback'); oauth2.getToken('CODE_FROM_STEP_4').then(({tokens}) => console.log('Refresh Token:', tokens.refresh_token)); });"
   ```

## Troubleshooting

- **"invalid_grant" error**: The code expired. Get a new one immediately after authorization.
- **"redirect_uri_mismatch"**: Make sure the redirect URI in Google Cloud Console matches `http://localhost:3000/oauth2callback`
- **No refresh token returned**: Make sure you include `prompt=consent` in the authorization URL

