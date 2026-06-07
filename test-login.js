const http = require('http');
const data = JSON.stringify({ email: 'admin@example.com', password: '123456' });
const opts = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};
const req = http.request(opts, (res) => {
  console.log('status', res.statusCode);
  res.on('data', (chunk) => process.stdout.write(chunk));
  res.on('end', () => console.log());
});
req.on('error', (err) => console.error('error', err.message));
req.write(data);
req.end();
