import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MessageCircle, Star, TrendingUp, Users } from 'lucide-react';
import { BlogCard } from '@/components/BlogCard';
import { BlogHeader } from '@/components/BlogHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CommentSection } from '@/components/CommentSection';
import { getStoredUser, isAuthenticated } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type SeedComment = {
  id: string;
  author: { name: string };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: SeedComment[];
};

type TrendingPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: { id: string; name: string };
  publishedAt: string;
  likes: number;
  comments: number;
  readTime: string;
  category: string;
  accent: string;
  image?: string;
};

const trendingPosts: TrendingPost[] = [
  { 
    id: 't1', 
    title: 'The Rise of AI in Software Development: A Complete Guide', 
    excerpt: 'Exploring how artificial intelligence is transforming the way we write code, debug applications, and architect software systems.', 
    content: 'Full content...', 
    author: { id: 'admin1', name: 'Dr. Sarah Martinez' }, 
    publishedAt: '12 hours ago', 
    likes: 892, 
    comments: 156, 
    readTime: '15 min', 
    category: 'AI / ML', 
    accent: 'from-indigo-500 via-violet-500 to-fuchsia-500', 
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 't2', 
    title: 'Building Scalable React Applications: Lessons from Production', 
    excerpt: 'Real-world insights from scaling React apps to millions of users, from state management to architecture decisions.', 
    content: 'Full content...', 
    author: { id: 'admin2', name: 'Alex Chen' }, 
    publishedAt: '1 day ago', 
    likes: 567, 
    comments: 89, 
    readTime: '12 min', 
    category: 'React', 
    accent: 'from-sky-400 via-blue-500 to-indigo-600', 
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 't3', 
    title: 'The Future of Web Development: What to Expect Next', 
    excerpt: 'A comprehensive look at emerging technologies, frameworks, and development practices that will shape the web.', 
    content: 'Full content...', 
    author: { id: 'admin3', name: 'Maria Rodriguez' }, 
    publishedAt: '2 days ago', 
    likes: 445, 
    comments: 67, 
    readTime: '10 min', 
    category: 'Web Development', 
    accent: 'from-cyan-400 via-teal-500 to-emerald-600', 
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 't4', 
    title: 'Designing for Trust in an Age of Infinite Interfaces', 
    excerpt: 'Small details that make digital products feel more transparent, dependable, and worthy of someone’s attention.', 
    content: 'Full content...', 
    author: { id: 'admin4', name: 'Jules Park' }, 
    publishedAt: '3 days ago', 
    likes: 392, 
    comments: 54, 
    readTime: '9 min', 
    category: 'UI / UX', 
    accent: 'from-rose-400 via-orange-400 to-amber-500', 
    image: 'https://images.unsplash.com/photo-1586717791821-3f44a563dc4c?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 't5', 
    title: 'TypeScript Patterns That Make Teams Move Faster', 
    excerpt: 'A practical collection of type patterns that reduce bugs, improve code review, and make complex systems easier to navigate.', 
    content: 'Full content...', 
    author: { id: 'admin5', name: 'Theo Brooks' }, 
    publishedAt: '4 days ago', 
    likes: 348, 
    comments: 48, 
    readTime: '11 min', 
    category: 'TypeScript', 
    accent: 'from-blue-400 via-cyan-500 to-sky-700', 
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 't6', 
    title: 'The Quiet Power of a Well-Timed Refactor', 
    excerpt: 'How to recognize when technical debt is slowing the team down and make improvements without stopping momentum.', 
    content: 'Full content...', 
    author: { id: 'admin6', name: 'Amara Okafor' }, 
    publishedAt: '5 days ago', 
    likes: 306, 
    comments: 42, 
    readTime: '8 min', 
    category: 'Engineering', 
    accent: 'from-emerald-400 via-green-500 to-lime-600', 
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 't7', 
    title: 'What We Get Wrong About Productivity Tools', 
    excerpt: 'More dashboards do not always mean more clarity. A closer look at the tools and rituals that genuinely help.', 
    content: 'Full content...', 
    author: { id: 'admin7', name: 'Rina Das' }, 
    publishedAt: '6 days ago', 
    likes: 284, 
    comments: 39, 
    readTime: '7 min', 
    category: 'Productivity', 
    accent: 'from-fuchsia-400 via-pink-500 to-rose-600', 
    image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 't8', 
    title: 'A Field Guide to Better Technical Writing', 
    excerpt: 'Clear documentation is a product feature. These simple practices help ideas travel further across a team.', 
    content: 'Full content...', 
    author: { id: 'admin8', name: 'Jon Bell' }, 
    publishedAt: '1 week ago', 
    likes: 251, 
    comments: 33, 
    readTime: '6 min', 
    category: 'Writing', 
    accent: 'from-amber-300 via-yellow-500 to-orange-600', 
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=2000' 
  },
  { 
    id: 't9', 
    title: 'Why Open Source Communities Keep Reinventing Belonging', 
    excerpt: 'The social patterns behind healthy contributor communities, and what product teams can learn from them.', 
    content: 'Full content...', 
    author: { id: 'admin9', name: 'Nadia Flores' }, 
    publishedAt: '1 week ago', 
    likes: 219, 
    comments: 28, 
    readTime: '8 min', 
    category: 'Community', 
    accent: 'from-violet-400 via-purple-500 to-indigo-700', 
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000' 
  }
];

const defaultCommentsByPost: Record<string, SeedComment[]> = {
  t1: [{ id: 't1-1', author: { name: 'Elena Moore' }, content: 'This is one of the most balanced introductions to the topic I have read.', timestamp: '2 hours ago', likes: 24, isLiked: false }],
};

const trendingTopics = [
  { name: 'React', posts: 1234 }, { name: 'TypeScript', posts: 892 }, { name: 'AI/ML', posts: 756 }, { name: 'Web Performance', posts: 645 },
];

const Trending = () => {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [posts, setPosts] = useState(trendingPosts);
  const [comments, setComments] = useState(defaultCommentsByPost);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = getStoredUser() as any;

  const checkAuth = () => {
    if (!isAuthenticated()) {
      toast({ title: 'Authentication required', description: 'Log in to perform this action.', variant: 'destructive' });
      navigate('/auth');
      return false;
    }
    return true;
  };

  const handleSave = async (postId: string) => {
    if (!checkAuth()) return;
    setSavedPosts((prev) => savedPosts.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]);
    toast({ description: savedPosts.includes(postId) ? 'Removed from reading list.' : 'Blog saved to your reading list.' });
  };

  const handleLike = (postId: string) => {
    if (!checkAuth()) return;
    const isLiked = likedPosts.includes(postId);
    setLikedPosts((prev) => isLiked ? prev.filter((id) => id !== postId) : [...prev, postId]);
    setPosts((prev) => prev.map((post) => post.id === postId ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 } : post));
    toast({ description: isLiked ? 'Removed from favorites.' : 'Added to favorites.' });
  };

  const handleAddComment = (content: string, parentId?: string) => {
    if (!checkAuth() || !selectedPost) return;
    toast({ description: 'Comment added successfully.' });
  };

  const handleLikeComment = (commentId: string) => {
    if (!checkAuth() || !selectedPost) return;
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <BlogHeader />
      <main className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary"><TrendingUp className="h-3.5 w-3.5" /> Community pulse</div><h1 className="text-5xl font-semibold leading-none sm:text-6xl">Trending now</h1><p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">The stories readers are saving, sharing, and discussing this week.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm"><Clock className="h-4 w-4 text-primary" /> Updated every few hours</div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-6">
            <div className="flex items-center gap-3"><div className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><TrendingUp className="h-4 w-4" /> Hot right now</div><div className="rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">{posts.length} stories in the spotlight</div></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post, index) => (
                <div key={post.id} className="relative pl-4 sm:pl-8">
                  <div className="absolute left-0 top-5 z-10 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/20">#{index + 1}</div>
                  <BlogCard 
                    post={post as any} 
                    onLike={handleLike} 
                    onComment={(postId) => { if (checkAuth()) setSelectedPost(postId); }} 
                    onSave={handleSave} 
                    onOpen={(postId) => navigate(`/story/${postId}`)} 
                    isLiked={likedPosts.includes(post.id)} 
                    isSaved={savedPosts.includes(post.id)}
                    currentUserId={user?.id}
                  />
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="sticky top-24 border-border/60 bg-gradient-card shadow-card"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Star className="h-5 w-5 text-primary" /> Trending topics</CardTitle></CardHeader><CardContent className="space-y-1">{trendingTopics.map((topic, index) => <div key={topic.name} className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/60"><div className="flex items-center gap-3"><span className="w-5 text-sm font-bold text-muted-foreground">#{index + 1}</span><div><Badge variant="secondary" className="mb-1">{topic.name}</Badge><p className="text-xs text-muted-foreground">{topic.posts.toLocaleString()} posts</p></div></div><TrendingUp className="h-4 w-4 text-primary" /></div>)}</CardContent></Card>
          </aside>
        </div>
      </main>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <CommentSection
            postId={selectedPost || ''}
            comments={comments[selectedPost || ''] || []}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trending;
