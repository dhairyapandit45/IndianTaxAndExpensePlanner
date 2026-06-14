
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key';

// Generate Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    res.status(400).json({ message: 'All fields are required.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ message: 'Passwords do not match.' });
    return;
  }

  try {
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      res.status(400).json({ message: 'User already exists with this email.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      token: generateToken(newUser._id || '')
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error during registration.' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      res.status(404).json({ message: 'Account does not exist. Please register first.' });
      return;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password || '');
    if (isPasswordMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id || '')
      });
      return;
    }

    res.status(401).json({ message: 'Invalid password.' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error during login.' });
  }
};