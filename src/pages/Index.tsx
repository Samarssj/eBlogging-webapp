import { useState, useEffect } from 'react';
import { BlogHeader } from '@/components/BlogHeader';
import { ArrowRight, BookOpen, Clock3, Sparkles, Users } from 'lucide-react';
import { BlogCard } from '@/components/BlogCard';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CommentSection } from '@/components/CommentSection';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

const mockPosts = [
  {
    id: '1',
    title: 'Designing with Purpose: A Guide to User-Centric Web Design',
    excerpt: 'Learn the fundamental principles of creating websites that truly serve their users and provide excellent user experience.',
    content: 'Full content would go here...',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=2000',
    category: 'Design',
    author: { id: 'admin1', name: 'Sarah Chen', avatar: undefined },
    publishedAt: '2 hours ago',
    likes: 42,
    comments: 12,
    readTime: '5 min'
  },
  {
    id: '2',
    title: 'The Future of Web Development: What to Expect in 2024',
    excerpt: 'Exploring emerging trends in web development including AI integration, new frameworks, and the evolution of user expectations.',
    content: 'Full content would go here...',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072',
    category: 'Technology',
    author: { id: 'admin2', name: 'Alex Rodriguez', avatar: undefined },
    publishedAt: '6 hours ago',
    likes: 128,
    comments: 34,
    readTime: '8 min'
  },
  {
    id: '3',
    title: 'Mastering TypeScript: From Beginner to Advanced',
    excerpt: 'A comprehensive guide to TypeScript that covers everything from basic types to advanced generics and utility types.',
    content: 'Full content would go here...',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=2128',
    category: 'Programming',
    author: { id: 'admin3', name: 'Emily Watson', avatar: undefined },
    publishedAt: '1 day ago',
    likes: 89,
    comments: 21,
    readTime: '12 min'
  },
  {
    id: '4',
    title: 'A Slow Morning in a Fast-Moving City',
    excerpt: 'Notes on attention, small rituals, and finding enough quiet to hear your own ideas arrive.',
    content: 'Full content would go here...',
    image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&q=80&w=2071',
    category: 'Lifestyle',
    author: { id: 'admin4', name: 'Maya Patel', avatar: undefined },
    publishedAt: '2 days ago',
    likes: 56,
    comments: 8,
    readTime: '6 min'
  },
  {
    id: '5',
    title: 'The Creative Habit: Small Systems for Big Ideas',
    excerpt: 'A gentle framework for capturing sparks, protecting focus, and turning unfinished notes into work you are proud to share.',
    content: 'Full content would go here...',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=2000',
    category: 'Creativity',
    author: { id: 'admin5', name: 'Noah Williams', avatar: undefined },
    publishedAt: '3 days ago',
    likes: 72,
    comments: 15,
    readTime: '7 min'
  },
  {
    id: '6',
    title: 'Building a Personal Knowledge Garden',
    excerpt: 'What happens when your notes become a living landscape instead of another folder full of links you never revisit.',
    content: 'Full content would go here...',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=2000',
    category: 'Productivity',
    author: { id: 'admin6', name: 'Owen Brooks', avatar: undefined },
    publishedAt: '4 days ago',
    likes: 94,
    comments: 19,
    readTime: '9 min'
  },
  {
    id: '7',
    title: 'Why Curiosity Is a Better Career Compass Than Certainty',
    excerpt: 'The questions we keep returning to can reveal more about our next chapter than any five-year plan.',
    content: 'Full content would go here...',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070',
    category: 'Perspective',
    author: { id: 'admin7', name: 'Priya Shah', avatar: undefined },
    publishedAt: '5 days ago',
    likes: 63,
    comments: 11,
    readTime: '8 min'
  },
  {
    id: '8',
    title: 'The Night Sky Is a Reminder to Think in Longer Timelines',
    excerpt: 'A field note on scale, patience, and the strange comfort of remembering that every breakthrough starts small.',
    content: 'Full content would go here...',
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=2013',
    category: 'Science',
    author: { id: 'admin8', name: 'Elias Green', avatar: undefined },
    publishedAt: '1 week ago',
    likes: 112,
    comments: 24,
    readTime: '5 min'
  },
  {
    id: '9',
    title: 'The Quiet Power of a Well-Timed Refactor',
    excerpt: 'How to recognize when technical debt is slowing the team down and make improvements without stopping momentum.',
    content: 'Full content would go here...',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=2070',
    category: 'Engineering',
    author: { id: 'admin9', name: 'Amara Okafor', avatar: undefined },
    publishedAt: '1 week ago',
    likes: 85,
    comments: 14,
    readTime: '8 min'
  }
];

const mockComments = [
  {
    id: '1',
    author: { name: 'John Doe' },
    content: 'Great article! Really helped me understand the concepts better.',
    timestamp: '2 hours ago',
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '2',
        author: { name: 'Sarah Chen' },
        content: 'Thank you! Glad you found it helpful.',
        timestamp: '1 hour ago',
        likes: 2,
        isLiked: false
      }
    ]
  }
];

const Index = () => {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState(mockComments);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const dbPosts = await api.get('/api/posts');
      const formattedDbPosts = dbPosts.map((p: any) => ({
        ...p,
        author: { id: p.author, name: p.authorName }
      }));
      setPosts([...formattedDbPosts, ...mockPosts]);
    } catch (err) {
      setPosts(mockPosts);
    }
  };

  const checkAuth = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to perform this action.',
        variant: 'destructive',
      });
      navigate('/auth');
      return false;
    }
    return true;
  };

  const handleLike = (postId: string) => {
    if (!checkAuth()) return;
    const isLiked = likedPosts.includes(postId);
    setLikedPosts(prev => isLiked ? prev.filter(id => id !== postId) : [...prev, postId]);
    setPosts(prev => prev.map(post => 
      post.id === postId || post._id === postId
        ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
    toast({ description: isLiked ? 'Removed from favorites' : 'Added to favorites ❤️' });
  };

  const handleComment = (postId: string) => {
    if (!checkAuth()) return;
    setSelectedPost(postId);
  };

  const handleDelete = async (postId: string) => {
    if (!checkAuth()) return;
    
    if (mockPosts.find(p => p.id === postId)) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: 'Post Deleted', description: 'Mock post removed from view.' });
      return;
    }

    try {
      await api.delete(`/api/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId && p._id !== postId));
      toast({ title: 'Success', description: 'Post deleted successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAddComment = (content: string, parentId?: string) => {
    if (!checkAuth()) return;
    const newComment = {
      id: Date.now().toString(),
      author: { name: user.name },
      content,
      timestamp: 'now',
      likes: 0,
      isLiked: false
    };
    if (parentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), newComment] }
          : comment
      ));
    } else {
      setComments(prev => [newComment, ...prev]);
    }
    toast({ description: 'Comment added successfully!' });
  };

  const handleLikeComment = (commentId: string) => {
    if (!checkAuth()) return;
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
        : comment
    ));
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <BlogHeader />
      <section className="relative overflow-hidden border-b border-border/60 bg-card/20">
        <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(hsl(var(--border)/0.42)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.42)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_42%,hsl(var(--primary)/0.12),transparent_25%),radial-gradient(circle_at_23%_62%,hsl(var(--primary)/0.08),transparent_30%)]" />
        <div className="container relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"><Sparkles className="h-3.5 w-3.5" /> Ideas worth keeping</div>
            <h1 className="max-w-xl font-serif text-5xl font-semibold leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl">Stories for the <span className="text-primary">curious</span> mind.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">A thoughtful corner of the internet for essays, experiments, and the people making sense of what comes next.</p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Button onClick={() => document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90">Explore the feed <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="ghost" onClick={() => navigate('/write')} className="rounded-full px-2 text-foreground hover:bg-transparent hover:text-primary">Share your perspective <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-border/60 pt-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-primary" />12k+ readers</span>
              <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />480+ stories</span>
              <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />Always worth a read</span>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/50 bg-background/40 p-3 shadow-2xl shadow-black/20">
            <div className="relative min-h-[390px] overflow-hidden rounded-[1.5rem] border border-white/40 bg-[radial-gradient(circle_at_80%_85%,rgba(42,117,119,0.8),transparent_35%),radial-gradient(circle_at_16%_18%,rgba(246,132,81,0.98),transparent_42%),linear-gradient(135deg,#f18b55_0%,#e5b654_52%,#87a77b_100%)] p-7 text-white sm:p-9">
              <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full border border-white/30" />
              <div className="absolute -bottom-20 left-10 h-52 w-52 rounded-full border border-white/25" />
              <div className="relative flex h-full min-h-[318px] flex-col">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-white/85"><span>Issue 04</span><span>2026 / 08</span></div>
                <div className="mt-9 text-xs font-bold uppercase tracking-[0.18em] text-white/85">The cover story</div>
                <h2 className="mt-4 max-w-sm font-serif text-4xl font-semibold leading-[0.98] sm:text-5xl">Make room for better questions.</h2>
                <p className="mt-6 max-w-sm text-sm leading-6 text-white/90">A weekly collection of fresh perspectives from the eBlogging community.</p>
                <div className="mt-auto flex items-center justify-between border-t border-white/35 pt-5 text-sm font-medium text-white/90"><span>Read, reflect, respond.</span><span className="grid h-10 w-10 place-items-center rounded-full border border-white/50"><ArrowRight className="h-4 w-4" /></span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <main id="feed" className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">Fresh from the community</p>
          <h2 className="font-serif text-4xl font-semibold text-foreground">Latest Posts</h2>
          <p className="mt-2 text-muted-foreground">Discover amazing content from our community</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <BlogCard
              key={post.id || post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
              onOpen={(id) => navigate(`/story/${id}`)}
              isLiked={likedPosts.includes(post.id || post._id)}
              currentUserId={user?.id}
            />
          ))}
        </div>
      </main>
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <CommentSection
            postId={selectedPost || ''}
            comments={comments}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
