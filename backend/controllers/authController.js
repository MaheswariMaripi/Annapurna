const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Helper to normalize and validate Indian (+91) mobile numbers
const normalizeIndianPhone = (raw) => {
  if (!raw) return "";
  let digits = String(raw).replace(/\D/g, "");
  // If user passed 91 with 12 digits (e.g. 919876543210 or +919876543210)
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  // If user passed leading 0 with 11 digits (e.g. 09876543210)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
};

const isValidIndianMobile = (digits) => {
  // Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(digits);
};

// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, ngoRegistrationNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ message: "Indian mobile number (+91) is required" });
    }

    const cleanPhoneDigits = normalizeIndianPhone(phone);
    if (!isValidIndianMobile(cleanPhoneDigits)) {
      return res.status(400).json({
        message: "Invalid phone number. Please enter a valid 10-digit Indian mobile number (+91) starting with 6, 7, 8, or 9.",
      });
    }

    const formattedPhone = `+91 ${cleanPhoneDigits}`;

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email is already registered. Please log in or use another email." });
    }

    const userData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      phone: formattedPhone,
      address: address ? address.trim() : "",
    };

    // NGOs start unverified and need admin approval
    if (role === "ngo") {
      userData.ngoRegistrationNumber = ngoRegistrationNumber ? ngoRegistrationNumber.trim() : "";
      userData.verificationStatus = "pending";
      userData.isVerified = false;
    }

    const user = await User.create(userData);

    res.status(201).json({
      user: user.toSafeObject(),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });
    if (!user && cleanEmail.endsWith("@foodrescue.org")) {
      user = await User.findOne({ email: cleanEmail.replace("@foodrescue.org", "@annapurna.org") });
    } else if (!user && cleanEmail.endsWith("@annapurna.org")) {
      user = await User.findOne({ email: cleanEmail.replace("@annapurna.org", "@foodrescue.org") });
    }

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account suspended. Contact admin." });
    }

    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
