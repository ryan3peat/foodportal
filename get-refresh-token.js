import { google } from 'googleapis';
import readline from 'readline';

// ============================================
// STEP 1: PASTE YOUR CREDENTIALS HERE
// ============================================
// Get these from your .env.local file or Google Cloud Console:
const CLIENT_ID = ''; // <-- PASTE YOUR CLIENT ID HERE
const CLIENT_SECRET = ''; // <-- PASTE YOUR CLIENT SECRET HERE

// ============================================
// No need to edit below this line
// ============================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getRefreshToken() {
  // Check if credentials are set
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Error: Please set CLIENT_ID and CLIENT_SECRET at the top of this file!');
    console.error('   Get CLIENT_SECRET from .env.local line 7');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'http://localhost:3000/oauth2callback'
  );

  const scopes = ['https://www.googleapis.com/auth/gmail.send'];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent screen to get refresh token
  });

  console.log('\n========================================');
  console.log('Step 1: Authorize this application');
  console.log('========================================');
  console.log('\nVisit this URL in your browser:');
  console.log('\n' + authUrl + '\n');
  console.log('After authorizing, you will be redirected to a page.');
  console.log('Copy the ENTIRE URL from the address bar (it will contain "code=...").\n');

  const code = await new Promise((resolve) => {
    rl.question('Paste the full redirect URL here (or just the code parameter): ', (input) => {
      // Extract code from URL if full URL was pasted
      const urlMatch = input.match(/[?&]code=([^&]+)/);
      if (urlMatch) {
        resolve(urlMatch[1]);
      } else {
        resolve(input);
      }
    });
  });

  rl.close();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n========================================');
    console.log('✅ Success! Your credentials:');
    console.log('========================================\n');
    console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('\nAdd this to your .env file as GOOGLE_REFRESH_TOKEN\n');
    
    if (tokens.access_token) {
      console.log('Access Token (for reference):', tokens.access_token.substring(0, 20) + '...');
    }
  } catch (error) {
    console.error('\n❌ Error retrieving refresh token:', error.message);
    if (error.message.includes('invalid_grant')) {
      console.error('\n💡 Tip: Make sure you copied the code immediately after authorization.');
      console.error('   The code expires quickly. Try the authorization URL again.');
    }
    process.exit(1);
  }
}

getRefreshToken();

