// test-changelly.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // مسیر را اگر لازم است تغییر بده

import axios from 'axios';
import * as crypto from 'crypto';

const apiKey = process.env.CHANGELLY_API_KEY!;
const secretBase64 = process.env.CHANGELLY_API_SECRET!;

if (!apiKey || !secretBase64) {
  console.error('ERROR: CHANGELLY_API_KEY or CHANGELLY_API_SECRET missing in .env');
  process.exit(1);
}

// بازسازی PEM از base64 (شکستن به خطوط 64 تایی)
function base64ToPem(base64Str: string) {
  const lines = base64Str.match(/.{1,64}/g) || [];
  return `-----BEGIN PRIVATE KEY-----\n${lines.join('\n')}\n-----END PRIVATE KEY-----`;
}

const privatePem = base64ToPem(secretBase64);

// نمونه‌ی پیغام برای getCurrencies (مطابق docs)
const message = {
  jsonrpc: '2.0',
  id: 'test',
  method: 'getCurrencies',
  params: {}
};

// تابع امضای RSA (با SHA256)
function signPayloadRSA(payload: object, pemKey: string) {
  const payloadStr = JSON.stringify(payload);
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(payloadStr);
  signer.end();
  // خروجی به صورت base64
  return signer.sign(pemKey, 'base64');
}

async function test() {
  console.log('Using API KEY:', apiKey);
  console.log('Private PEM length:', privatePem.length);

  const signature = signPayloadRSA(message, privatePem);
  console.log('Signature (first 60 chars):', signature.slice(0, 60));

  const headers = {
    'api-key': apiKey,
    sign: signature,
    'Content-type': 'application/json'
  };

  try {
    const res = await axios.post('https://api.changelly.com', message, { headers });
    console.log('API Response:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('API Error:', err.response?.status, err.response?.data || err.message);
  }
}

test();