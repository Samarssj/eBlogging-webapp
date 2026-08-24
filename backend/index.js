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
  legacyId: { type: String, unique: true, sparse: true },
  legacyLikes: { type: Number, default: null },
  legacyComments: { type: Number, default: null },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  publishedAt: { type: String, default: () => new Date().toLocaleDateString() }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

const LEGACY_POSTS = [
  { legacyId: '1', title: 'Designing with Purpose: A Guide to User-Centric Web Design', excerpt: 'Learn the fundamental principles of creating websites that truly serve their users and provide excellent user experience.', content: 'Full content would go here...', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=2000', category: 'Design', authorName: 'Sarah Chen', legacyAuthorId: 'legacy-admin1', likes: 42, comments: 12, publishedAt: '2 hours ago', readTime: '5 min' },
  { legacyId: '2', title: 'The Future of Web Development: What to Expect in 2024', excerpt: 'Exploring emerging trends in web development including AI integration, new frameworks, and the evolution of user expectations.', content: 'Full content would go here...', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072', category: 'Technology', authorName: 'Alex Rodriguez', legacyAuthorId: 'legacy-admin2', likes: 128, comments: 34, publishedAt: '6 hours ago', readTime: '8 min' },
  { legacyId: '3', title: 'Mastering TypeScript: From Beginner to Advanced', excerpt: 'A comprehensive guide to TypeScript that covers everything from basic types to advanced generics and utility types.', content: 'Full content would go here...', image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=2128', category: 'Programming', authorName: 'Emily Watson', legacyAuthorId: 'legacy-admin3', likes: 89, comments: 21, publishedAt: '1 day ago', readTime: '12 min' },
  { legacyId: '4', title: 'A Slow Morning in a Fast-Moving City', excerpt: 'Notes on attention, small rituals, and finding enough quiet to hear your own ideas arrive.', content: 'Full content would go here...', image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&q=80&w=2071', category: 'Lifestyle', authorName: 'Maya Patel', legacyAuthorId: 'legacy-admin4', likes: 56, comments: 8, publishedAt: '2 days ago', readTime: '6 min' },
  { legacyId: '5', title: 'The Creative Habit: Small Systems for Big Ideas', excerpt: 'A gentle framework for capturing sparks, protecting focus, and turning unfinished notes into work you are proud to share.', content: 'Full content would go here...', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=2000', category: 'Creativity', authorName: 'Noah Williams', legacyAuthorId: 'legacy-admin5', likes: 72, comments: 15, publishedAt: '3 days ago', readTime: '7 min' },
  { legacyId: '6', title: 'Building a Personal Knowledge Garden', excerpt: 'What happens when your notes become a living landscape instead of another folder full of links you never revisit.', content: 'Full content would go here...', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000', category: 'Productivity', authorName: 'Owen Brooks', legacyAuthorId: 'legacy-admin6', likes: 94, comments: 19, publishedAt: '4 days ago', readTime: '9 min' },
  { legacyId: '7', title: 'Why Curiosity Is a Better Career Compass Than Certainty', excerpt: 'The questions we keep returning to can reveal more about our next chapter than any five-year plan.', content: 'Full content would go here...', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070', category: 'Perspective', authorName: 'Priya Shah', legacyAuthorId: 'legacy-admin7', likes: 63, comments: 11, publishedAt: '5 days ago', readTime: '8 min' },
  { legacyId: '8', title: 'The Night Sky Is a Reminder to Think in Longer Timelines', excerpt: 'A field note on scale, patience, and the strange comfort of remembering that every breakthrough starts small.', content: 'Full content would go here...', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=2013', category: 'Science', authorName: 'Elias Green', legacyAuthorId: 'legacy-admin8', likes: 112, comments: 24, publishedAt: '1 week ago', readTime: '5 min' },
  { legacyId: '9', title: 'The Quiet Power of a Well-Timed Refactor', excerpt: 'How to recognize when technical debt is slowing the team down and make improvements without stopping momentum.', content: 'Full content would go here...', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=2070', category: 'Engineering', authorName: 'Amara Okafor', legacyAuthorId: 'legacy-admin9', likes: 85, comments: 14, publishedAt: '1 week ago', readTime: '8 min' },
];

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

const LOCAL_BLOG_IDEAS = [
  {
    title: 'The small habits that make creative work sustainable',
    angle: 'Share a practical weekly routine, including what you stopped doing and what finally made your process easier.',
    why: 'A relatable, experience-led topic that gives readers actionable advice without needing a huge audience.'
  },
  {
    title: 'What I learned from building in public',
    angle: 'Tell the honest story behind one project decision, including the uncertainty, feedback, and result.',
    why: 'Readers connect with specific lessons and behind-the-scenes decisions more than polished success stories.'
  },
  {
    title: 'A beginner-friendly guide to one tool I use every week',
    angle: 'Walk through one useful tool with a simple example, common mistakes, and a quick checklist.',
    why: 'A focused tutorial can be helpful, searchable, and easy to turn into a clear, well-structured post.'
  },
  {
    title: 'The idea I changed my mind about',
    angle: 'Compare your earlier opinion with what changed it, using evidence or a personal experience.',
    why: 'Thoughtful perspective pieces invite conversation and help readers understand how your thinking evolved.'
  },
  {
    title: 'Five questions I ask before starting something new',
    angle: 'Turn your decision-making process into a short framework readers can reuse for their own work or life.',
    why: 'A simple framework makes an authentic personal post useful, memorable, and easy to scan.'
  }
];

const getGeminiText = (payload) => payload?.candidates?.[0]?.content?.parts
  ?.map((part) => part.text || '')
  .join('')
  .trim() || '';

const parseGeminiIdeas = (text) => {
  const cleaned = text.replace(/^```(?:json)?\\s*/i, '').replace(/\\s*```$/i, '').trim();
  const parsed = JSON.parse(cleaned);
  const ideas = Array.isArray(parsed) ? parsed : parsed.ideas;
  if (!Array.isArray(ideas)) throw new Error('Gemini returned an unexpected format');
  return ideas.slice(0, 5).map((idea) => ({
    title: String(idea.title || '').trim(),
    angle: String(idea.angle || idea.description || '').trim(),
    why: String(idea.why || idea.reason || '').trim()
  })).filter((idea) => idea.title && idea.angle && idea.why);
};

const MODEL_CACHE_TTL_MS = 15 * 60 * 1000;
const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';
let cachedGeminiModel = null;
let cachedGeminiModelExpiresAt = 0;

const getLatestGeminiModel = async () => {
  if (cachedGeminiModel && Date.now() < cachedGeminiModelExpiresAt) return cachedGeminiModel;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', {
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY }
  });
  if (!response.ok) throw new Error(`Gemini model discovery failed with status ${response.status}`);

  const { models = [] } = await response.json();
  const candidates = models
    .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
    .map((model) => model.baseModelId || model.name?.split('/').pop())
    .filter((model) => model && /^gemini-\d+(?:\.\d+)?-(?:flash|pro)(?:-lite)?$/i.test(model));

  const versionScore = (model) => {
    const match = model.match(/^gemini-(\d+)(?:\.(\d+))?-(flash|pro)/i);
    if (!match) return [-1, -1, -1, model];
    const familyScore = match[3].toLowerCase() === 'pro' ? 2 : 1;
    return [Number(match[1]), Number(match[2] || 0), familyScore, model];
  };

  candidates.sort((a, b) => {
    const left = versionScore(a);
    const right = versionScore(b);
    return right[0] - left[0] || right[1] - left[1] || right[2] - left[2] || right[3].localeCompare(left[3]);
  });

  cachedGeminiModel = candidates[0] || process.env.GEMINI_FALLBACK_MODEL || process.env.GEMINI_MODEL_FALLBACK || DEFAULT_GEMINI_MODEL;
  cachedGeminiModelExpiresAt = Date.now() + MODEL_CACHE_TTL_MS;
  console.log(`Using dynamically selected Gemini model: ${cachedGeminiModel}`);
  return cachedGeminiModel;
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
    legacyId: object.legacyId,
    likes: object.legacyLikes == null ? (object.likes || 0) : object.legacyLikes + (object.likedBy || []).length,
    comments: object.legacyComments == null ? (object.comments || 0) : object.legacyComments + (object.comments || 0),
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

const seedLegacyPosts = async () => {
  for (const legacyPost of LEGACY_POSTS) {
    const email = `${legacyPost.legacyAuthorId}@eblogging.invalid`;
    const author = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: { name: legacyPost.authorName, email, password: await bcrypt.hash(`legacy-${legacyPost.legacyId}`, 10) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    let post = await Post.findOne({ legacyId: legacyPost.legacyId });
    if (!post) {
      const { legacyAuthorId, likes, comments, ...postData } = legacyPost;
      post = await Post.create({ ...postData, author: author._id, legacyLikes: likes, legacyComments: comments, likes: 0, comments: 0 });
    } else if (post.legacyLikes == null) {
      post.legacyLikes = legacyPost.likes;
      post.legacyComments = legacyPost.comments;
      await post.save();
    }
  }
};

mongoose.connect(MONGODB_URI)
  .then(async () => {
    await seedLegacyPosts();
    console.log('✅ SUCCESS: Connected to MongoDB Atlas and restored feed posts');
  })
  .catch((err) => {
    console.error('❌ ERROR: MongoDB Connection Failed');
    console.error('Error Details:', err.message);
  });

// --- Routes ---

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

app.post('/api/ai/blog-ideas', authMiddleware, async (req, res) => {
  const focus = String(req.body?.focus || '').trim().slice(0, 240);
  const title = String(req.body?.title || '').trim().slice(0, 180);
  const excerpt = String(req.body?.excerpt || '').trim().slice(0, 500);
  const content = String(req.body?.content || '').trim().slice(0, 1200);

  if (!process.env.GEMINI_API_KEY) {
    return res.json({ ideas: LOCAL_BLOG_IDEAS, source: 'local' });
  }

  const prompt = [
    'You are an encouraging editorial coach for a blogging platform.',
    'Suggest exactly five original blog post ideas for this writer.',
    'Each idea must be practical, specific, and distinct from the others.',
    'Return only valid JSON in this shape: {"ideas":[{"title":"...","angle":"...","why":"..."}]}.',
    'Keep each field to one or two concise sentences. Do not include markdown fences.',
    `Writer focus: ${focus || 'Open to a useful and authentic topic'}`,
    `Current title: ${title || 'None yet'}`,
    `Current excerpt: ${excerpt || 'None yet'}`,
    `Current draft context: ${content || 'None yet'}`
  ].join('\\n');

  try {
    const model = await getLatestGeminiModel();
    const requestBody = {
      systemInstruction: { parts: [{ text: 'Return concise, high-quality editorial suggestions as JSON only.' }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, responseMimeType: 'application/json' }
    };
    const requestGemini = (selectedModel) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    let response = await requestGemini(model);
    if (!response.ok && model !== (process.env.GEMINI_FALLBACK_MODEL || process.env.GEMINI_MODEL_FALLBACK || DEFAULT_GEMINI_MODEL)) {
      cachedGeminiModel = null;
      cachedGeminiModelExpiresAt = 0;
      response = await requestGemini(process.env.GEMINI_FALLBACK_MODEL || process.env.GEMINI_MODEL_FALLBACK || DEFAULT_GEMINI_MODEL);
    }

    if (!response.ok) {
      console.error('Gemini request failed:', response.status, await response.text());
      return res.json({ ideas: LOCAL_BLOG_IDEAS, source: 'local' });
    }

    const ideas = parseGeminiIdeas(getGeminiText(await response.json()));
    return res.json({ ideas: ideas.length ? ideas : LOCAL_BLOG_IDEAS, source: ideas.length ? 'gemini' : 'local' });
  } catch (err) {
    console.error('Gemini blog idea generation failed:', err.message);
    return res.json({ ideas: LOCAL_BLOG_IDEAS, source: 'local' });
  }
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
    const likes = post.legacyLikes == null ? post.likes : post.legacyLikes + post.likedBy.length;
    res.json({ liked, likes });
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
