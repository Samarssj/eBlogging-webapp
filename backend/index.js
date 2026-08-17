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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  excerpt: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  category: { type: String, default: 'Perspective' },
  readTime: { type: String, default: '5 min' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  publishedAt: { type: String, default: () => new Date().toLocaleDateString() }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

const commentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true, trim: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

// --- Authentication Helpers ---

const getUserIdFromRequest = (req) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret').userId;
  } catch {
    return null;
  }
};

const authMiddleware = (req, res, next) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ message: 'Please log in to continue' });
  req.userId = userId;
  next();
};

const isIncluded = (ids = [], userId) => Boolean(userId && ids.some((id) => id.toString() === userId.toString()));

const serializePost = (post, viewerId = null) => {
  const object = post.toObject ? post.toObject() : post;
  return {
    id: object._id ? object._id.toString() : object.id,
    title: object.title,
    excerpt: object.excerpt,
    content: object.content,
    image: object.image,
    category: object.category,
    readTime: object.readTime,
    author: object.author?.toString(),
    authorName: object.authorName,
    likes: object.likes || 0,
    comments: object.comments || 0,
    status: object.status,
    publishedAt: object.publishedAt,
    createdAt: object.createdAt,
    updatedAt: object.updatedAt,
    likedByMe: isIncluded(object.likedBy, viewerId),
    savedByMe: isIncluded(object.savedBy, viewerId)
  };
};

const serializeComment = (comment, viewerId = null) => ({
  id: comment._id.toString(),
  author: { id: comment.author.toString(), name: comment.authorName },
  content: comment.content,
  parentComment: comment.parentComment ? comment.parentComment.toString() : null,
  createdAt: comment.createdAt,
  likes: comment.likes || 0,
  likedByMe: isIncluded(comment.likedBy, viewerId)
});

// --- Database Connection ---

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ SUCCESS: Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ ERROR: MongoDB Connection Failed');
    console.error('Error Details:', err.message);
  });

// --- Routes ---

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// Authentication
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 10)
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, bio: user.bio, location: user.location, skills: user.skills } });
  } catch (err) {
    res.status(500).json({ message: 'Error signing up', error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, bio: user.bio, location: user.location, skills: user.skills } });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Feed and profile post retrieval
app.get('/api/posts', async (req, res) => {
  try {
    const viewerId = getUserIdFromRequest(req);
    const posts = await Post.find({ status: 'published' }).sort({ createdAt: -1 });
    res.json(posts.map((post) => serializePost(post, viewerId)));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
});

app.get('/api/profile/posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.userId }).sort({ updatedAt: -1 });
    res.json({ posts: posts.map((post) => serializePost(post, req.userId)) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching your posts', error: err.message });
  }
});

app.get('/api/profile/saved', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ savedBy: req.userId, status: 'published' }).sort({ updatedAt: -1 });
    res.json({ posts: posts.map((post) => serializePost(post, req.userId)) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching saved posts', error: err.message });
  }
});

app.get('/api/profile/liked', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ likedBy: req.userId, status: 'published' }).sort({ updatedAt: -1 });
    res.json({ posts: posts.map((post) => serializePost(post, req.userId)) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching liked posts', error: err.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post: serializePost(post, getUserIdFromRequest(req)) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching post', error: err.message });
  }
});

// Posts
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
    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) return res.status(400).json({ message: 'Title, excerpt, and content are required' });
    const user = await User.findById(req.userId);
    const finalImage = image?.trim() || `${FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]}?auto=format&fit=crop&q=80&w=2000`;

    const post = await Post.create({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      image: finalImage,
      category: category || 'Perspective',
      readTime: readTime || '5 min',
      status: status || 'published',
      author: req.userId,
      authorName: user.name
    });
    res.status(201).json({ post: serializePost(post, req.userId) });
  } catch (err) {
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
});

app.put('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) return res.status(403).json({ message: 'You can edit only your own posts' });

    const allowedUpdates = ['title', 'excerpt', 'content', 'image', 'category', 'readTime', 'status'];
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) post[key] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
    });
    await post.save();
    res.json({ post: serializePost(post, req.userId) });
  } catch (err) {
    res.status(500).json({ message: 'Error updating post', error: err.message });
  }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.userId) return res.status(403).json({ message: 'You can delete only your own posts' });

    await Comment.deleteMany({ post: post._id });
    await Post.findByIdAndDelete(post._id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post', error: err.message });
  }
});

app.post('/api/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likedBy.findIndex((id) => id.toString() === req.userId);
    let liked;
    if (index >= 0) {
      post.likedBy.splice(index, 1);
      liked = false;
    } else {
      post.likedBy.push(req.userId);
      liked = true;
    }
    post.likes = post.likedBy.length;
    await post.save();
    res.json({ liked, likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: 'Error updating like', error: err.message });
  }
});

app.post('/api/posts/:id/save', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.savedBy.findIndex((id) => id.toString() === req.userId);
    let saved;
    if (index >= 0) {
      post.savedBy.splice(index, 1);
      saved = false;
    } else {
      post.savedBy.push(req.userId);
      saved = true;
    }
    await post.save();
    res.json({ saved });
  } catch (err) {
    res.status(500).json({ message: 'Error updating saved post', error: err.message });
  }
});

// Comments
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: -1 });
    res.json({ comments: comments.map((comment) => serializeComment(comment, getUserIdFromRequest(req))) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err.message });
  }
});

app.post('/api/posts/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content, parentComment = null } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Comment cannot be empty' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const user = await User.findById(req.userId);
    const comment = await Comment.create({ post: post._id, author: user._id, authorName: user.name, content: content.trim(), parentComment });
    post.comments += 1;
    await post.save();
    res.status(201).json({ comment: serializeComment(comment, req.userId) });
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
});

app.post('/api/comments/:id/like', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    const index = comment.likedBy.findIndex((id) => id.toString() === req.userId);
    let liked;
    if (index >= 0) {
      comment.likedBy.splice(index, 1);
      liked = false;
    } else {
      comment.likedBy.push(req.userId);
      liked = true;
    }
    comment.likes = comment.likedBy.length;
    await comment.save();
    res.json({ liked, likes: comment.likes });
  } catch (err) {
    res.status(500).json({ message: 'Error updating comment like', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
