import { useState, useEffect } from 'react';
import { BlogHeader } from '@/components/BlogHeader';
import { BlogCard } from '@/components/BlogCard';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CommentSection } from '@/components/CommentSection';
import { useNavigate } from 'react-router-dom';

const mockPosts = [
  {
    id: '1',
    title: 'Designing with Purpose: A Guide to User-Centric Web Design',
    excerpt: 'Learn the fundamental principles of creating websites that truly serve their users and provide excellent user experience. We\'ll explore modern design patterns, color theory, and interactive elements.',
    content: 'Full content would go here...',
    author: {
      name: 'Sarah Chen',
      avatar: undefined
    },
    publishedAt: '2 hours ago',
    likes: 42,
    comments: 12,
    readTime: '5 min'
  },
  {
    id: '2',
    title: 'The Future of Web Development: What to Expect in 2024',
    excerpt: 'Exploring emerging trends in web development including AI integration, new frameworks, and the evolution of user expectations in the digital age.',
    content: 'Full content would go here...',
    author: {
      name: 'Alex Rodriguez',
      avatar: undefined
    },
    publishedAt: '6 hours ago',
    likes: 128,
    comments: 34,
    readTime: '8 min'
  },
  {
    id: '3',
    title: 'Mastering TypeScript: From Beginner to Advanced',
    excerpt: 'A comprehensive guide to TypeScript that covers everything from basic types to advanced generics and utility types. Perfect for developers looking to level up.',
    content: 'Full content would go here...',
    author: {
      name: 'Emily Watson',
      avatar: undefined
    },
    publishedAt: '1 day ago',
    likes: 89,
    comments: 21,
    readTime: '12 min'
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
  },
  {
    id: '3',
    author: { name: 'Mike Johnson' },
    content: 'I\'ve been struggling with this topic for weeks. This explanation finally made it click!',
    timestamp: '4 hours ago',
    likes: 12,
    isLiked: true
  }
];

const Index = () => {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [posts, setPosts] = useState(mockPosts);
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
  }, []);

  const checkAuth = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to like or comment on posts.',
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
    setLikedPosts(prev => {
      if (isLiked) {
        return prev.filter(id => id !== postId);
      } else {
        return [...prev, postId];
      }
    });

    // Update the post's like count
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));

    toast({ 
      description: isLiked ? 'Removed from favorites' : 'Added to favorites ❤️' 
    });
  };

  const handleComment = (postId: string) => {
    if (!checkAuth()) return;
    setSelectedPost(postId);
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
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Latest Posts</h2>
          <p className="text-muted-foreground">Discover amazing content from our community</p>
        </div>
        <div className="space-y-6">
          {posts.map(post => (
            <BlogCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              isLiked={likedPosts.includes(post.id)}
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
