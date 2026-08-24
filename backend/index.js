const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: true }));

const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('MONGODB_URI is not defined. Database-backed routes will return 503.');
}
if (!JWT_SECRET) {
  console.warn('JWT_SECRET is not defined. Authentication routes will return 503.');
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: 'Passionate writer and tech enthusiast.' },
    location: { type: String, default: 'San Francisco, CA' },
    skills: { type: [String], default: ['React', 'TypeScript', 'Node.js', 'UI/UX'] },
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    excerpt: { type: String, default: '', trim: true, maxlength: 400 },
    content: { type: String, required: true, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, required: true, trim: true },
    legacyKey: { type: String, unique: true, sparse: true },
    legacyLikeCount: { type: Number, default: 0 },
    legacyCommentCount: { type: Number, default: 0 },
    legacyPublishedAt: { type: String, default: '' },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    legacyKey: { type: String, unique: true, sparse: true },
    legacyLikeCount: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const LEGACY_POSTS = [
  {
    legacyKey: 'legacy-post-1',
    title: 'Designing with Purpose: A Guide to User-Centric Web Design',
    excerpt: "Learn the fundamental principles of creating websites that truly serve their users and provide excellent user experience. We'll explore modern design patterns, color theory, and interactive elements.",
    content: 'Full content would go here...',
    authorName: 'Sarah Chen',
    authorEmail: 'legacy.sarah@eblogging.invalid',
    legacyLikeCount: 42,
    legacyCommentCount: 9,
    legacyPublishedAt: '2 hours ago',
  },
  {
    legacyKey: 'legacy-post-2',
    title: 'The Future of Web Development: What to Expect in 2024',
    excerpt: 'Exploring emerging trends in web development including AI integration, new frameworks, and the evolution of user expectations in the digital age.',
    content: 'Full content would go here...',
    authorName: 'Alex Rodriguez',
    authorEmail: 'legacy.alex@eblogging.invalid',
    legacyLikeCount: 128,
    legacyCommentCount: 34,
    legacyPublishedAt: '6 hours ago',
  },
  {
    legacyKey: 'legacy-post-3',
    title: 'Mastering TypeScript: From Beginner to Advanced',
    excerpt: 'A comprehensive guide to TypeScript that covers everything from basic types to advanced generics and utility types. Perfect for developers looking to level up.',
    content: 'Full content would go here...',
    authorName: 'Emily Watson',
    authorEmail: 'legacy.emily@eblogging.invalid',
    legacyLikeCount: 89,
    legacyCommentCount: 21,
    legacyPublishedAt: '1 day ago',
  },
  {
    legacyKey: 'legacy-post-4',
    title: 'Building Modern Web Applications with React and Tailwind',
    excerpt: 'Learn how to create beautiful and responsive web applications using the latest tools and best practices in the React ecosystem.',
    content: 'Full content would go here...',
    authorName: 'eBlogging Community',
    authorEmail: 'legacy.community@eblogging.invalid',
    legacyLikeCount: 124,
    legacyCommentCount: 18,
    legacyPublishedAt: '2 days ago',
  },
  {
    legacyKey: 'legacy-post-5',
    title: 'The Power of TypeScript in Large Scale Projects',
    excerpt: 'Discover why TypeScript is becoming the industry standard for building robust and maintainable large-scale web applications.',
    content: 'Full content would go here...',
    authorName: 'eBlogging Community',
    authorEmail: 'legacy.community@eblogging.invalid',
    legacyLikeCount: 89,
    legacyCommentCount: 12,
    legacyPublishedAt: '1 week ago',
  },
];

const LEGACY_COMMENTS = [
  { legacyKey: 'legacy-comment-1', postKey: 'legacy-post-1', authorName: 'John Doe', authorEmail: 'legacy.john@eblogging.invalid', content: 'Great article! Really helped me understand the concepts better.', legacyLikeCount: 5 },
  { legacyKey: 'legacy-comment-2', postKey: 'legacy-post-1', authorName: 'Sarah Chen', authorEmail: 'legacy.sarah@eblogging.invalid', content: 'Thank you! Glad you found it helpful.', legacyLikeCount: 2, parentKey: 'legacy-comment-1' },
  { legacyKey: 'legacy-comment-3', postKey: 'legacy-post-1', authorName: 'Mike Johnson', authorEmail: 'legacy.mike@eblogging.invalid', content: "I've been struggling with this topic for weeks. This explanation finally made it click!", legacyLikeCount: 12 },
];

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

function databaseReady(res) {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ message: 'Database is not connected. Please try again shortly.' });
    return false;
  }
  return true;
}

function authReady(res) {
  if (!JWT_SECRET) {
    res.status(503).json({ message: 'Authentication is not configured on the server.' });
    return false;
  }
  return true;
}

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function postSelector(id) {
  return isValidId(id) ? { _id: id } : { legacyKey: id };
}

function signToken(user) {
  return jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    location: user.location,
    skills: user.skills,
  };
}

async function authenticate(req, res, next) {
  if (!authReady(res)) return;

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || typeof payload !== 'object' || !payload.userId || !isValidId(payload.userId)) {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: 'User account no longer exists.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

async function optionalAuthenticate(req, res, next) {
  if (!JWT_SECRET) return next();
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload && typeof payload === 'object' && payload.userId && isValidId(payload.userId)) {
      req.user = await User.findById(payload.userId);
    }
  } catch {
    // An invalid optional token should not make the public feed unavailable.
  }
  next();
}

function serializePost(post, commentCount = 0, userId = null) {
  const userKey = userId ? userId.toString() : null;
  const likedBy = post.likedBy || [];
  const savedBy = post.savedBy || [];
  const legacyLikeCount = Number(post.legacyLikeCount || 0);
  const legacyCommentCount = Number(post.legacyCommentCount || 0);
  return {
    id: post._id,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    author: { id: post.author, name: post.authorName },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.legacyPublishedAt || undefined,
    likes: legacyLikeCount + likedBy.length,
    comments: legacyCommentCount + commentCount,
    likedByMe: Boolean(userKey && likedBy.some((id) => id.toString() === userKey)),
    savedByMe: Boolean(userKey && savedBy.some((id) => id.toString() === userKey)),
  };
}

async function serializePosts(posts, userId = null) {
  const ids = posts.map((post) => post._id);
  const counts = ids.length
    ? await Comment.aggregate([{ $match: { post: { $in: ids } } }, { $group: { _id: '$post', count: { $sum: 1 } } }])
    : [];
  const countByPost = new Map(counts.map((item) => [item._id.toString(), item.count]));
  return posts.map((post) => serializePost(post, countByPost.get(post._id.toString()) || 0, userId));
}

async function ensureLegacyContent() {
  for (const legacyPost of LEGACY_POSTS) {
    const author = await User.findOneAndUpdate(
      { email: legacyPost.authorEmail },
      { $setOnInsert: { email: legacyPost.authorEmail, password: await bcrypt.hash(`legacy-${legacyPost.legacyKey}`, 10), name: legacyPost.authorName } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Blog.findOneAndUpdate(
      { legacyKey: legacyPost.legacyKey },
      { $setOnInsert: { ...legacyPost, author: author._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  for (const legacyComment of LEGACY_COMMENTS) {
    const author = await User.findOneAndUpdate(
      { email: legacyComment.authorEmail },
      { $setOnInsert: { email: legacyComment.authorEmail, password: await bcrypt.hash(`legacy-${legacyComment.legacyKey}`, 10), name: legacyComment.authorName } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const post = await Blog.findOne({ legacyKey: legacyComment.postKey });
    const parent = legacyComment.parentKey ? await Comment.findOne({ legacyKey: legacyComment.parentKey }) : null;
    if (post) {
      await Comment.findOneAndUpdate(
        { legacyKey: legacyComment.legacyKey },
        { $setOnInsert: { post: post._id, author: author._id, authorName: legacyComment.authorName, content: legacyComment.content, legacyLikeCount: legacyComment.legacyLikeCount, parentComment: parent?._id || null } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }
}

async function connectToDatabase() {
  if (!MONGODB_URI || mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
  await ensureLegacyContent();
  console.log('Connected to MongoDB Atlas and restored legacy blog content');
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/signup', async (req, res) => {
  try {
    if (!databaseReady(res) || !authReady(res)) return;
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || !email || password.length < 8) {
      return res.status(400).json({ message: 'Name, a valid email, and a password of at least 8 characters are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'An account with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    return res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Unable to create the account.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    if (!databaseReady(res) || !authReady(res)) return;
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Unable to log in.' });
  }
});

app.get('/api/me', authenticate, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

app.get('/api/posts', optionalAuthenticate, async (req, res) => {
  try {
    if (!databaseReady(res)) return;
    const posts = await Blog.find().sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ posts: await serializePosts(posts, req.user?._id) });
  } catch (error) {
    console.error('List posts error:', error);
    return res.status(500).json({ message: 'Unable to load posts.' });
  }
});

app.get('/api/posts/saved', authenticate, async (req, res) => {
  try {
    if (!databaseReady(res)) return;
    const posts = await Blog.find({ savedBy: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.json({ posts: await serializePosts(posts, req.user._id) });
  } catch (error) {
    console.error('Saved posts error:', error);
    return res.status(500).json({ message: 'Unable to load saved posts.' });
  }
});

app.get('/api/posts/liked', authenticate, async (req, res) => {
  try {
    if (!databaseReady(res)) return;
    const posts = await Blog.find({ likedBy: req.user._id }).sort({ createdAt: -1 }).lean();
    return res.json({ posts: await serializePosts(posts, req.user._id) });
  } catch (error) {
    console.error('Liked posts error:', error);
    return res.status(500).json({ message: 'Unable to load liked posts.' });
  }
});

app.post('/api/posts', authenticate, async (req, res) => {
  try {
    if (!databaseReady(res)) return;
    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();
    const excerpt = String(req.body.excerpt || content.slice(0, 180)).trim();
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required.' });

    const post = await Blog.create({
      title,
      excerpt,
      content,
      author: req.user._id,
      authorName: req.user.name,
    });
    return res.status(201).json({ post: serializePost(post, 0, req.user._id) });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ message: 'Unable to publish the blog.' });
  }
});

app.post('/api/posts/:postId/like', authenticate, async (req, res) => {
  try {
    if (!databaseReady(res)) return;
    const post = await Blog.findOne(postSelector(req.params.postId));
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const userId = req.user._id.toString();
    const likedBy = post.likedBy || [];
    const liked = likedBy.some((id) => id.toString() === userId);
    const update = liked ? { $pull: { likedBy: req.user._id } } : { $addToSet: { likedBy: req.user._id } };
    const updated = await Blog.findOneAndUpdate(postSelector(req.params.postId), update, { new: true });
    return res.json({ liked: !liked, likes: Number(updated.legacyLikeCount || 0) + (updated.likedBy || []).length });
  } catch (error) {
    console.error('Like post error:', error);
    return res.status(500).json({ message: 'Unable to update the like.' });
  }
});

app.post('/api/posts/:postId/save', authenticate, async (req, res) => {
  try {
    if (!databaseReady(res)) return;
    const post = await Blog.findOne(postSelector(req.params.postId));
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const userId = req.user._id.toString();
    const savedBy = post.savedBy || [];
    const saved = savedBy.some((id) => id.toString() === userId);
    const update = saved ? { $pull: { savedBy: req.user._id } } : { $addToSet: { savedBy: req.user._id } };
    const updated = await Blog.findOneAndUpdate(postSelector(req.params.postId), update, { new: true });
    return res.json({ saved: !saved });
  } catch (error) {
    console.error('Save post error:', error);
    return res.status(500).json({ message: 'Unable to update saved posts.' });
  }
});

app.get('/api/posts/:postId/comments', optionalAuthenticate, async (req, res) => {
  try {
    if (!databaseReady(res)) return;
    const post = await Blog.findOne(postSelector(req.params.postId));
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    const comments = await Comment.find({ post: post._id }).sort({ createdAt: 1 }).lean();
    const currentUserId = req.user?._id?.toString();
    return res.json({
      comments: comments.map((comment) => ({
        id: comment._id,
        author: { id: comment.author, name: comment.authorName },
        content: comment.content,
        parentId: comment.parentComment,
        createdAt: comment.createdAt,
        likes: Number(comment.legacyLikeCount || 0) + (comment.likedBy || []).length,
        likedByMe: Boolean(currentUserId && (comment.likedBy || []).some((id) => id.toString() === currentUserId)),
      })),
    });
  } catch (error) {
    console.error('List comments error:', error);
    return res.status(500).json({ message: 'Unable to load comments.' });
  }
});

app.post('/api/posts/:postId/comments', authenticate, async (req, res) => {
  try {
    if (!databaseReady(res)) return;
    const content = String(req.body.content || '').trim();
    const parentComment = req.body.parentComment || null;
    if (!content) return res.status(400).json({ message: 'Comment content is required.' });
    const post = await Blog.findOne(postSelector(req.params.postId));
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    if (parentComment && !isValidId(parentComment)) return res.status(400).json({ message: 'Invalid parent comment id.' });

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      authorName: req.user.name,
      content,
      parentComment,
    });
    return res.status(201).json({
      comment: {
        id: comment._id,
        author: { id: comment.author, name: comment.authorName },
        content: comment.content,
        parentId: comment.parentComment,
        createdAt: comment.createdAt,
        likes: 0,
      },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ message: 'Unable to add the comment.' });
  }
});

app.post('/api/comments/:commentId/like', authenticate, async (req, res) => {
  try {
    if (!databaseReady(res)) return;
    if (!isValidId(req.params.commentId)) return res.status(400).json({ message: 'Invalid comment id.' });
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const userId = req.user._id.toString();
    const likedBy = comment.likedBy || [];
    const liked = likedBy.some((id) => id.toString() === userId);
    const update = liked ? { $pull: { likedBy: req.user._id } } : { $addToSet: { likedBy: req.user._id } };
    const updated = await Comment.findByIdAndUpdate(req.params.commentId, update, { new: true });
    return res.json({ liked: !liked, likes: Number(updated.legacyLikeCount || 0) + (updated.likedBy || []).length });
  } catch (error) {
    console.error('Like comment error:', error);
    return res.status(500).json({ message: 'Unable to update the comment like.' });
  }
});

app.use((error, req, res, next) => {
  console.error('Unhandled server error:', error);
  res.status(500).json({ message: 'Internal server error.' });
});

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    if (MONGODB_URI) {
      try {
        await connectToDatabase();
      } catch (error) {
        console.error('MongoDB connection failed:', error.message);
      }
    }
  });
}

module.exports = { app, connectToDatabase, models: { User, Blog, Comment } };
