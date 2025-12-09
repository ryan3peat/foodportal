# Email Configuration Guide

To enable automatic email sending for the Contact Us form, you can use either **Google Gmail API** or **Microsoft Graph API**.

## Required Environment Variables

Add the following environment variables to your `.env` file or deployment platform:

### 1. Email Provider
```
EMAIL_PROVIDER=google
```
- Set to `google` to use Google Gmail API (recommended)
- Set to `graph` to use Microsoft Graph API
- Set to `mock` to use mock email service (testing - emails will only be logged to console)

### 2. Google Gmail Credentials (Recommended)

You'll need to create a Google Cloud Project and OAuth2 credentials:

```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REFRESH_TOKEN=your-refresh-token-here
SENDER_EMAIL=your-email@gmail.com
```

### 3. Microsoft Azure Credentials (Alternative)

If using Microsoft Graph API instead:

```
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here
SENDER_EMAIL=your-email@yourdomain.com
```

### 4. Optional: Mock Fallback
```
ALLOW_MOCK_FALLBACK=true
```
- If set to `true`, the system will fall back to mock email service if the primary provider fails
- Useful for development/testing environments

## How to Get Google Gmail Credentials (Recommended)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** > **New Project**
3. Enter a project name (e.g., "Food Portal Email Service")
4. Click **Create**

### Step 2: Enable Gmail API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click on **Gmail API**
4. Click **Enable**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add your email to test users
   - Click **Save and Continue** through the scopes and test users screens
4. For Application type, select **Web application**
5. Add an authorized redirect URI: `http://localhost:3000/oauth2callback` (or your callback URL)
6. Click **Create**
7. **Copy the Client ID and Client Secret** - these are your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Step 4: Generate Refresh Token

You need to generate a refresh token using OAuth2. Here's a quick way using Node.js:

1. Install the Google Auth library (if not already installed):
   ```bash
   npm install googleapis
   ```

2. Create a script to get the refresh token (save as `get-refresh-token.js`):
   ```javascript
   const { google } = require('googleapis');
   const readline = require('readline');

   const oauth2Client = new google.auth.OAuth2(
     'YOUR_CLIENT_ID',
     'YOUR_CLIENT_SECRET',
     'http://localhost:3000/oauth2callback'
   );

   const scopes = ['https://www.googleapis.com/auth/gmail.send'];

   const authUrl = oauth2Client.generateAuthUrl({
     access_type: 'offline',
     scope: scopes,
   });

   console.log('Authorize this app by visiting this url:', authUrl);
   const rl = readline.createInterface({
     input: process.stdin,
     output: process.stdout,
   });

   rl.question('Enter the code from that page here: ', (code) => {
     rl.close();
     oauth2Client.getToken(code, (err, token) => {
       if (err) return console.error('Error retrieving access token', err);
       console.log('Refresh Token:', token.refresh_token);
     });
   });
   ```

3. Run the script:
   ```bash
   node get-refresh-token.js
   ```

4. Follow the URL, authorize the app, and copy the code
5. Paste the code into the script
6. **Copy the Refresh Token** - this is your `GOOGLE_REFRESH_TOKEN`

### Step 5: Set Sender Email

The `SENDER_EMAIL` must be:
- A valid Gmail address (or Google Workspace email)
- The same email address you used to authorize the OAuth2 flow
- An account that has permission to send emails

## How to Get Microsoft Azure Credentials (Alternative)

### Step 1: Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Enter a name (e.g., "Food Portal Email Service")
5. Select **Accounts in this organizational directory only**
6. Click **Register**

### Step 2: Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description and set expiration
4. Click **Add**
5. **Copy the secret value immediately** (you won't be able to see it again)
6. This is your `AZURE_CLIENT_SECRET`

### Step 3: Get Tenant ID and Client ID

1. In your app registration, go to **Overview**
2. Copy the **Application (client) ID** - this is your `AZURE_CLIENT_ID`
3. Copy the **Directory (tenant) ID** - this is your `AZURE_TENANT_ID`

### Step 4: Configure API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Add the following permissions:
   - `Mail.Send` (to send emails)
6. Click **Add permissions**
7. **Important**: Click **Grant admin consent** for your organization

### Step 5: Set Sender Email

The `SENDER_EMAIL` must be:
- A valid email address in your Azure AD tenant
- The same email address used when granting permissions
- An account that has permission to send emails via Microsoft Graph

## Testing Email Configuration

1. Set `EMAIL_PROVIDER=mock` to test without credentials (emails will be logged to console)
2. Once credentials are configured:
   - For Google: set `EMAIL_PROVIDER=google`
   - For Microsoft: set `EMAIL_PROVIDER=graph`
3. Submit a test message through the Contact Us form
4. Check the server logs for email sending status
5. Verify emails are received at `mark@3peat.ai` and `ryan@3peat.ai`

## Troubleshooting

### Google Gmail API Errors

#### Error: "Missing required Google credentials"
- Ensure all four environment variables are set: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, and `SENDER_EMAIL`

#### Error: "invalid_grant" or "Token has been expired or revoked"
- Your refresh token may have expired or been revoked
- Generate a new refresh token using the script in Step 4 above
- Make sure you're using the correct OAuth2 scopes: `https://www.googleapis.com/auth/gmail.send`

#### Error: "Insufficient Permission"
- Verify that Gmail API is enabled in your Google Cloud project
- Ensure the OAuth2 consent screen is properly configured
- Check that the refresh token was generated with the `gmail.send` scope

### Microsoft Graph API Errors

#### Error: "Missing required Azure credentials"
- Ensure all four environment variables are set: `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, and `SENDER_EMAIL`

#### Error: "Insufficient privileges to complete the operation"
- Verify that `Mail.Send` permission is granted
- Ensure admin consent has been granted for the permissions
- Check that the `SENDER_EMAIL` account has permission to send emails

### General Email Issues

#### Emails not being received
- Check server logs for email sending errors
- Verify recipient email addresses are correct: `mark@3peat.ai` and `ryan@3peat.ai`
- Check spam/junk folders
- Ensure `EMAIL_PROVIDER` is set correctly (`google`, `graph`, or `mock`)
- Verify that `SENDER_EMAIL` matches the account used to generate credentials

## Contact Form Recipients

The Contact Us form automatically sends emails to:
- `mark@3peat.ai`
- `ryan@3peat.ai`

Both recipients will receive the same email with the contact form details.

