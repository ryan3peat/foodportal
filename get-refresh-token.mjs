import { google } from 'googleapis';
import readline from 'readline';

// Replace these with your credentials from .env.local
const CLIENT_ID = '535649405660-61nqvekkeup0gt402u8es3j74lkl8kq7.apps.googleusercontent.com';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE'; // Get this from .env.local line 7

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
console.log('\n1. Copy and paste this URL into your browser:');
console.log('\n' + authUrl + '\n');
console.log('2. Sign in with your Google account');
console.log('3. Click "Allow" to grant permissions');
console.log('4. You will be redirected to a page that says "This site can\'t be reached"');
console.log('5. Look at the address bar - it will have a URL like:');
console.log('   http://localhost:3000/oauth2callback?code=XXXXX...');
console.log('6. Copy the ENTIRE URL from the address bar\n');

rl.question('Paste the full redirect URL here: ', async (input) => {
  // Extract code from URL
  const urlMatch = input.match(/[?&]code=([^&]+)/);
  const code = urlMatch ? urlMatch[1] : input;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n========================================');
    console.log('✅ SUCCESS! Your Refresh Token:');
    console.log('========================================\n');
    console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('\n========================================');
    console.log('\nAdd this line to your .env.local file:');
    console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
    console.log('\n');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('invalid_grant')) {
      console.error('\n💡 The authorization code may have expired.');
      console.error('   Try running the script again and paste the code immediately.');
    }
    rl.close();
    process.exit(1);
  }
});

