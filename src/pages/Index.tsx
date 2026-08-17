import { useState, useEffect } from 'react';
import { BlogHeader } from '@/components/BlogHeader';
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
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Latest Posts</h2>
          <p className="text-muted-foreground">Discover amazing content from our community</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <BlogCard
              key={post.id || post._id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onDelete={handleDelete}
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
