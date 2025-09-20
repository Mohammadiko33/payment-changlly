// check-secret.js
const fs = require('fs');

const env = fs.readFileSync('./.env', 'utf8'); // مسیر را اگر لازم است اصلاح کن
const match = env.match(/CHANGELLY_API_SECRET\s*=\s*(.*)/s);

if (!match) {
  console.log('CHANGELLY_API_SECRET در .env پیدا نشد');
  process.exit(1);
}

let val = match[1].trim();

// اگر با " یا ' محصور شده است آنها را پاک کن
if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
  val = val.slice(1, -1);
}

// نمایش طول و آیا شامل کاراکتر غیر base64 هست یا نه
console.log('طول مقدار:', val.length);
console.log('آیا شامل newline هست؟', val.includes('\n'));
console.log('آیا شامل فاصله هست؟', /\s/.test(val));
console.log('اولین 120 کاراکتر:', val.slice(0,120));
console.log('آیا شامل کاراکترهای غیر base64 (غیر a-zA-Z0-9+/=) هست؟', /[^A-Za-z0-9+/=]/.test(val));
