import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import CreditService from "../services/creditService.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: "user",
    });

    try {
      await CreditService.awardSignupBonus(user._id);
    } catch (bonusError) {
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: "Registration failed", error: bonusError.message });
    }

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// GET /api/auth/google/callback
export const googleAuthCallback = (req, res) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
  }
  try {
    const token = generateToken(user);
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${token}`;
    res.redirect(redirectUrl);
  } catch (tokenErr) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`);
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
