// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/otp"); // ensure models/Otp.js exists 
const crypto = require("crypto");

// try to import sendMail from your mail utils - otherwise fallback to console logger
// at top of file (replace existing mail import lines)
const { sendMail } = require("../utils/mailer"); // use the wrapper

// ====== Helper: generateToken ======
// Uses JWT secret from env; FALLBACK secret only for local/dev testing.
// IMPORTANT: set process.env.JWT_SECRET in production for security.
function generateToken(user) {
  const secret = process.env.JWT_SECRET || "change_this_dev_secret_immediately";
  // token payload: minimal (id + role)
  const payload = { id: user._id ? String(user._id) : user.id, role: user.role || "user" };
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

// helper
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

// SEND OTP
exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success:false, message: "Email required" });

    const code = genOtp();
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000));

    // upsert OTP
    const record = await Otp.findOneAndUpdate(
      { email },
      { codeHash: await bcrypt.hash(code, 10), expiresAt, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // try send mail using sendMail wrapper
    try {
      await sendMail({
        to: email,
        subject: "Your EduLearn OTP",
        text: `Your OTP is ${code}. It expires in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.`,
        html: `<p>Your OTP is <strong>${code}</strong>. It expires in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.</p>`
      });
      console.log("OTP sent to", email);
    } catch (mailErr) {
      console.warn("Mail send failed (OTP):", (mailErr && mailErr.message) || mailErr);
      // fallback: log OTP to server console (dev)
      console.log(`DEV OTP for ${email}: ${code}`);
      // do not return error — still store OTP so verify works (dev)
    }

    return res.json({ success: true, message: "OTP sent (if mail configured).", email });
  } catch (err) {
    next(err);
  }
};

// VERIFY OTP
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ success:false, message: "Email & OTP required" });

    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ success:false, message: "OTP not found" });

    if (record.expiresAt < new Date()) {
      // cleanup expired OTP
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ success:false, message: "OTP expired" });
    }

    const ok = await bcrypt.compare(code, record.codeHash);
    if (!ok) {
      return res.status(400).json({ success:false, message: "Invalid OTP" });
    }

    // OTP ok -> delete using deleteOne or record.deleteOne()
    await Otp.deleteOne({ _id: record._id });

    return res.json({ success:true, message: "OTP verified" });
  } catch (err) {
    next(err);
  }
};

/* -----------------------
   registerTeacher
   POST /api/auth/teacher/register
----------------------- */
exports.registerTeacher = async (req, res, next) => {
  try {
    const { name, email, password, phone, schoolName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email already used" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      role: "teacher",
      schoolName,
      phone
    });

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

/* -----------------------
   registerStudent
   POST /api/auth/student/register
   (expected after OTP verify on frontend)
----------------------- */
exports.registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, grade } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email already used" });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash: hash,
      role: "student",
      grade
    });

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, grade: user.grade }
    });
  } catch (err) {
    next(err);
  }
};

/* -----------------------
   login
   POST /api/auth/login
----------------------- */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        grade: user.grade, schoolName: user.schoolName
      }
    });
  } catch (err) {
    next(err);
  }
};

/* -----------------------
   ME route
----------------------- */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
