const { google } = require('googleapis');

function getAuth() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: creds.client_email,
      private_key: creds.private_key.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

// 🔧 вспомогательная функция для чтения тела
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Only POST allowed');
  }

  try {
    const rawBody = await readBody(req);

    console.log('[RAW BODY]', rawBody);
    
    const { ip, device } = JSON.parse(rawBody);

    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '1m5bjgTRZHJORX_6lkp5BfJdkRB2r32LwNUPgLgzBb6c';
    const now = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Main!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[now, ip, device, '', '', '']],
      },
    });

    res.statusCode = 200;
    res.end('Saved to Google Sheets');
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Error saving to Sheets');
  }
};
