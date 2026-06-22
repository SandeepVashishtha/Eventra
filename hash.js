const https = require('https');
const crypto = require('crypto');

https.get('https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const hash = crypto.createHash('sha384').update(data, 'utf8').digest('base64');
    console.log('sha384-' + hash);
  });
});
