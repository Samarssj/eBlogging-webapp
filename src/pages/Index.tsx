import { FormEvent, useEffect, useState } from 'react';
import { BlogHeader } from '@/components/BlogHeader';
import { api, ApiComment, ApiPost, ApiUser } from '@/lib/api';

function readUser(): ApiUser | null {
  const value = localStorage.getItem('user');
  if (!value) return null;
  try { return JSON.parse(value) as ApiUser; } catch { return null; }
}

const LEGACY_FEED: ApiPost[] = [
  { id: 'legacy-post-1', title: 'Designing with Purpose: A Guide to User-Centric Web Design', excerpt: "Learn the fundamental principles of creating websites that truly serve their users and provide excellent user experience. We'll explore modern design patterns, color theory, and interactive elements.", content: 'Full content would go here...', author: { id: 'legacy-sarah', name: 'Sarah Chen' }, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), publishedAt: '2 hours ago', likes: 42, comments: 12, likedByMe: false, savedByMe: false },
  { id: 'legacy-post-2', title: 'The Future of Web Development: What to Expect in 2024', excerpt: 'Exploring emerging trends in web development including AI integration, new frameworks, and the evolution of user expectations in the digital age.', content: 'Full content would go here...', author: { id: 'legacy-alex', name: 'Alex Rodriguez' }, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), publishedAt: '6 hours ago', likes: 128, comments: 34, likedByMe: false, savedByMe: false },
  { id: 'legacy-post-3', title: 'Mastering TypeScript: From Beginner to Advanced', excerpt: 'A comprehensive guide to TypeScript that covers everything from basic types to advanced generics and utility types. Perfect for developers looking to level up.', content: 'Full content would go here...', author: { id: 'legacy-emily', name: 'Emily Watson' }, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), publishedAt: '1 day ago', likes: 89, comments: 21, likedByMe: false, savedByMe: false },
  { id: 'legacy-post-4', title: 'Building Modern Web Applications with React and Tailwind', excerpt: 'Learn how to create beautiful and responsive web applications using the latest tools and best practices in the React ecosystem.', content: 'Full content would go here...', author: { id: 'legacy-community', name: 'eBlogging Community' }, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), publishedAt: '2 days ago', likes: 124, comments: 18, likedByMe: false, savedByMe: false },
  { id: 'legacy-post-5', title: 'The Power of TypeScript in Large Scale Projects', excerpt: 'Discover why TypeScript is becoming the industry standard for building robust and maintainable large-scale web applications.', content: 'Full content would go here...', author: { id: 'legacy-community', name: 'eBlogging Community' }, createdAt: new Date(0).toISOString(), updatedAt: new Date(0).toISOString(), publishedAt: '1 week ago', likes: 89, comments: 12, likedByMe: false, savedByMe: false },
];

function formatDate(post: ApiPost) {
  if (post.publishedAt) return post.publishedAt;
  return new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Index() {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [user, setUser] = useState<ApiUser | null>(() => readUser());
  const [selectedPost, setSelectedPost] = useState<ApiPost | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    api.get<{ posts: ApiPost[] }>('/api/posts', true)
      .then((result) => setPosts(result.posts))
      .catch((requestError) => { setPosts(LEGACY_FEED); setError(requestError instanceof Error ? requestError.message : 'Unable to load posts from MongoDB.'); })
      .finally(() => setLoading(false));
  }, []);

  function requireAuth() {
    const token = localStorage.getItem('token');
    const currentUser = readUser();
    setUser(currentUser);
    if (!token || !currentUser) {
      window.location.href = '/auth';
      return false;
    }
    return true;
  }

  async function togglePostAction(post: ApiPost, action: 'like' | 'save') {
    if (!requireAuth()) return;
    setActionError('');
    try {
      const result = await api.post<{ liked?: boolean; saved?: boolean; likes?: number }>(`/api/posts/${post.id}/${action}`, {}, true);
      setPosts((current) => current.map((item) => item.id === post.id ? {
        ...item,
        likedByMe: result.liked ?? item.likedByMe,
        savedByMe: result.saved ?? item.savedByMe,
        likes: result.likes ?? item.likes,
      } : item));
      setSelectedPost((current) => current && current.id === post.id ? {
        ...current,
        likedByMe: result.liked ?? current.likedByMe,
        savedByMe: result.saved ?? current.savedByMe,
        likes: result.likes ?? current.likes,
      } : current);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : 'The action could not be completed.');
    }
  }

  async function openComments(post: ApiPost) {
    if (!requireAuth()) return;
    setSelectedPost(post);
    setCommentsLoading(true);
    setActionError('');
    try {
      const result = await api.get<{ comments: ApiComment[] }>(`/api/posts/${post.id}/comments`);
      setComments(result.comments);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : 'Unable to load comments.');
    } finally {
      setCommentsLoading(false);
    }
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPost || !commentText.trim() || !requireAuth()) return;
    setActionError('');
    try {
      const result = await api.post<{ comment: ApiComment }>(`/api/posts/${selectedPost.id}/comments`, { content: commentText.trim() }, true);
      setComments((current) => [...current, result.comment]);
      setCommentText('');
      setPosts((current) => current.map((post) => post.id === selectedPost.id ? { ...post, comments: post.comments + 1 } : post));
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : 'Unable to add comment.');
    }
  }

  async function likeComment(comment: ApiComment) {
    if (!requireAuth()) return;
    try {
      const result = await api.post<{ likes: number; liked: boolean }>(`/api/comments/${comment.id}/like`, {}, true);
      setComments((current) => current.map((item) => item.id === comment.id ? { ...item, likes: result.likes, likedByMe: result.liked } : item));
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : 'Unable to like comment.');
    }
  }

  return (
    <>
      <BlogHeader />
      <main className="page-shell">
        <section className="hero-row">
          <div>
            <p className="eyebrow">The independent publishing community</p>
            <h1>Ideas worth sharing.</h1>
            <p className="muted hero-copy">Read thoughtful writing, save what matters, and publish your own perspective.</p>
          </div>
          {user && <a href="/write" className="button button-primary">Write a blog</a>}
        </section>

        {error && <div className="notice error-text">{error}</div>}
        {actionError && <div className="notice error-text">{actionError}</div>}
        {loading && <p className="muted">Loading posts from MongoDB…</p>}
        {!loading && !error && posts.length === 0 && <div className="empty-state"><h2>No published blogs yet</h2><p className="muted">Sign in and be the first writer to publish an idea.</p></div>}

        <section className="post-list" aria-label="Published blogs">
          {posts.map((post) => (
            <article className="post-card" key={post.id}>
              <div className="post-meta"><span>{post.author.name}</span><span>·</span><time dateTime={post.createdAt}>{formatDate(post)}</time></div>
              <h2>{post.title}</h2>
              <p className="post-excerpt">{post.excerpt}</p>
              <div className="post-actions">
                <button className={post.likedByMe ? 'action-button active' : 'action-button'} onClick={() => togglePostAction(post, 'like')} aria-pressed={post.likedByMe}>♥ {post.likes}</button>
                <button className="action-button" onClick={() => openComments(post)}>▢ {post.comments} comments</button>
                <button className={post.savedByMe ? 'action-button active' : 'action-button'} onClick={() => togglePostAction(post, 'save')} aria-pressed={post.savedByMe}>{post.savedByMe ? '★ Saved' : '☆ Save'}</button>
              </div>
              {selectedPost?.id === post.id && (
                <section className="comments-panel" aria-label={`Comments for ${post.title}`}>
                  <div className="comments-heading"><h3>Comments</h3><button className="text-button" onClick={() => setSelectedPost(null)}>Close</button></div>
                  {commentsLoading ? <p className="muted">Loading comments…</p> : comments.length === 0 ? <p className="muted">Be the first to comment.</p> : comments.map((comment) => (
                    <div className="comment-row" key={comment.id}><div><strong>{comment.author.name}</strong><p>{comment.content}</p></div><button className={comment.likedByMe ? 'action-button active' : 'action-button'} onClick={() => likeComment(comment)} aria-pressed={comment.likedByMe}>♥ {comment.likes}</button></div>
                  ))}
                  <form className="comment-form" onSubmit={addComment}><input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Add a thoughtful comment…" maxLength={2000} /><button className="button button-primary" type="submit">Comment</button></form>
                </section>
              )}
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
