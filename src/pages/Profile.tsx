import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BlogHeader } from '@/components/BlogHeader';
import { api, ApiPost, ApiUser } from '@/lib/api';

function PostList({ posts, emptyMessage, kind }: { posts: ApiPost[]; emptyMessage: string; kind: 'saved' | 'liked' }) {
  if (posts.length === 0) return <div className="empty-state"><h3>{emptyMessage}</h3><Link className="text-button" to="/">Explore the feed</Link></div>;
  return <div className="post-list">{posts.map((post) => <article className="post-card" key={post.id}>
    <div className="post-meta"><span>{post.author.name}</span><span>·</span><time>{post.publishedAt || new Date(post.createdAt).toLocaleDateString()}</time></div>
    <h2>{post.title}</h2>
    <p className="post-excerpt">{post.excerpt}</p>
    <div className="post-actions"><span className="action-button active">♥ {post.likes}</span><span className="action-button active">{kind === 'saved' ? '★ Saved' : '♥ Liked'}</span></div>
  </article>)}</div>;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [savedPosts, setSavedPosts] = useState<ApiPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored || !token) { navigate('/auth', { replace: true }); return; }
    try { setUser(JSON.parse(stored) as ApiUser); } catch { navigate('/auth', { replace: true }); return; }

    Promise.all([
      api.get<{ posts: ApiPost[] }>('/api/posts/saved', true),
      api.get<{ posts: ApiPost[] }>('/api/posts/liked', true),
    ])
      .then(([saved, liked]) => { setSavedPosts(saved.posts); setLikedPosts(liked.posts); })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Unable to load your activity.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  return <>
    <BlogHeader />
    <main className="page-shell">
      <section className="profile-card"><div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div><div><p className="eyebrow">Your profile</p><h1>{user?.name}</h1><p className="muted">{user?.email}</p></div><Link className="button button-primary" to="/write">Write a blog</Link></section>
      {error && <p className="error-text" role="alert">{error}</p>}
      {loading ? <p className="muted">Loading your activity…</p> : <div className="profile-sections">
        <section><div className="section-heading"><div><p className="eyebrow">Personal library</p><h2>Saved blogs <span className="count-badge">{savedPosts.length}</span></h2></div></div><PostList posts={savedPosts} kind="saved" emptyMessage="You have not saved any blogs yet." /></section>
        <section><div className="section-heading"><div><p className="eyebrow">Your engagement</p><h2>Liked blogs <span className="count-badge">{likedPosts.length}</span></h2></div></div><PostList posts={likedPosts} kind="liked" emptyMessage="You have not liked any blogs yet." /></section>
      </div>}
    </main>
  </>;
}
