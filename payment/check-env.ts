import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // مسیر رو تنظیم کن نسبت به جای فایل

console.log("API Key:", process.env.CHANGELLY_API_KEY);
console.log("API Secret Length:", process.env.CHANGELLY_API_SECRET?.length);
console.log("Has newline?", process.env.CHANGELLY_API_SECRET?.includes("\n"));
