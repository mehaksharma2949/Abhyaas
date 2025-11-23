// backend/src/utils/mailer.js
const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

let transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

// optional verify at startup
transporter.verify().then(() => {
  console.log("✅ SMTP ready");
}).catch((err) => {
  console.warn("❌ SMTP verify error:", err && err.message ? err.message : err);
});

async function sendMail(opts) {
  // opts: { to, subject, text, html, from? }
  const from = opts.from || process.env.SMTP_FROM || process.env.SMTP_USER;
  try {
    const info = await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return info;
  } catch (err) {
    // rethrow so controller can fallback
    throw err;
  }
}

module.exports = { sendMail, transporter };
