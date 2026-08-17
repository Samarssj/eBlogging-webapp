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

// --- Models ---

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  bio: { type: String, default: 'Passionate writer and tech enthusiast.' },
  location: { type: String, default: 'San Francisco, CA' },
  skills: { type: [String], default: ['React', 'TypeScript', 'Node.js', 'UI/UX'] }
});

const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  category: { type: String, default: 'Perspective' },
  readTime: { type: String, default: '5 min' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  publishedAt: { type: String, default: () => new Date().toLocaleDateString() }
}, { timestamps: true });

postSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Post = mongoose.model('Post', postSchema);

// --- Middleware ---

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// --- Database Connection ---

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ SUCCESS: Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ ERROR: MongoDB Connection Failed');
    console.error('Error Details:', err.message);
  });

// --- Routes ---

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Error signing up', error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, bio: user.bio, location: user.location, skills: user.skills } });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching post', error: err.message });
  }
});

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea',
  'https://images.unsplash.com/photo-1449247709967-d4461a6a6103',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8'
];

app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const { title, excerpt, content, image, category, readTime, status } = req.body;
    const user = await User.findById(req.userId);
    
    // Use provided image or pick a random reliable fallback
    const finalImage = image && image.trim() !== '' 
      ? image 
      : `${FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]}?auto=format&fit=crop&q=80&w=2000`;

    const newPost = new Post({
      title,
      excerpt,
      content,
      image: finalImage,
      category: category || 'Perspective',
      readTime: readTime || '5 min',
      status: status || 'published',
      author: req.userId,
      authorName: user.name
    });

    await newPost.save();
    res.status(201).json({ post: newPost });
  } catch (err) {
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
});

app.put('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' });

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json({ post: updatedPost });
  } catch (err) {
    res.status(500).json({ message: 'Error updating post', error: err.message });
  }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' });
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
