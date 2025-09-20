import axios from 'axios';
import * as crypto from 'crypto';

const apiUrl = 'https://api.changelly.com';
const apiKey = process.env.CHANGELLY_API_KEY as string;
const apiSecret = process.env.CHANGELLY_API_SECRET as string;

console.log('API KEY:', apiKey);
console.log('API SECRET exists:', !!apiSecret);
function signMessage(message: object) {
  const msg = JSON.stringify(message);

  try {
    return crypto
      .createHmac('sha512', apiSecret)
      .update(msg)
      .digest('hex');
  } catch (e) {
    console.error('Direct HMAC failed, trying base64 decode...');
  }

  try {
    const secretBuffer = Buffer.from(apiSecret, 'base64');
    return crypto
      .createHmac('sha512', secretBuffer)
      .update(msg)
      .digest('hex');
  } catch (e) {
    console.error('Base64 HMAC also failed:', e.message);
    throw e;
  }
}

export async function getCurrencies() {
  const message = {
    jsonrpc: '2.0',
    id: 'test',
    method: 'getCurrencies',
    params: {}
  };

  const sign = signMessage(message);

  const headers = {
    'api-key': apiKey,
    sign,
    'Content-type': 'application/json'
  };

  try {
    console.log('Message:', JSON.stringify(message));
    console.log('Headers:', headers);
    const { data } = await axios.post(apiUrl, message, { headers });
    return data;
  } catch (error: any) {
    console.error('Changelly API error:', error.response?.data || error.message);
    throw new Error('Changelly API request failed');
  }
}