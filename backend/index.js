const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB User Model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  bio: { type: String, default: 'Passionate writer and tech enthusiast.' },
  location: { type: String, default: 'San Francisco, CA' },
  skills: { type: [String], default: ['React', 'TypeScript', 'Node.js', 'UI/UX'] }
});

const User = mongoose.model('User', userSchema);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined.');
} else {
  console.log('Attempting to connect to MongoDB...');
  // Log a masked version of the URI for debugging (hiding password)
  const maskedUri = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
  console.log('Connection String (masked):', maskedUri);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB Atlas');
  })
  .catch(err => {
    console.error('❌ ERROR: MongoDB Connection Failed');
    console.error('Error Details:', err.message);
    if (err.message.includes('Authentication failed')) {
      console.error('HINT: Check your username and password in the connection string.');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('HINT: Check your MongoDB Atlas Network Access settings (allow 0.0.0.0/0).');
    }
  });

// Health check route
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({ 
    status: 'OK', 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.post('/api/signup', async (req, res) => {
  console.log('--- Signup Attempt ---');
  console.log('Email:', req.body.email);
  
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      console.log('Validation Failed: Missing fields');
      return res.status(400).json({ message: 'All fields (name, email, password) are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      console.error('Database Error: Not connected to MongoDB');
      return res.status(503).json({ message: 'Service temporarily unavailable: Database connection error' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Signup Failed: User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    console.log('✅ User Created Successfully');

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        bio: user.bio,
        location: user.location,
        skills: user.skills
      } 
    });
  } catch (err) {
    console.error('❌ Signup Exception:', err);
    res.status(500).json({ message: 'Internal server error during signup', error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  console.log('--- Login Attempt ---');
  console.log('Email:', req.body.email);

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Service unavailable: Database connection error' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login Failed: User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login Failed: Incorrect password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Login Successful');

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        bio: user.bio,
        location: user.location,
        skills: user.skills
      } 
    });
  } catch (err) {
    console.error('❌ Login Exception:', err);
    res.status(500).json({ message: 'Internal server error during login', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
