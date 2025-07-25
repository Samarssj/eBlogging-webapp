import { BlogHeader } from '@/components/BlogHeader';
import { BlogCard } from '@/components/BlogCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Trending = () => {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const { toast } = useToast();

  const trendingPosts = [
    {
      id: 't1',
      title: 'The Rise of AI in Software Development: A Complete Guide',
      excerpt: 'Exploring how artificial intelligence is transforming the way we write code, debug applications, and architect software systems in 2024.',
      content: 'Full content...',
      author: { name: 'Dr. Sarah Martinez' },
      publishedAt: '12 hours ago',
      likes: 892,
      comments: 156,
      readTime: '15 min'
    },
    {
      id: 't2',
      title: 'Building Scalable React Applications: Lessons from Production',
      excerpt: 'Real-world insights from scaling React apps to millions of users. Performance optimization, state management, and architecture decisions.',
      content: 'Full content...',
      author: { name: 'Alex Chen' },
      publishedAt: '1 day ago',
      likes: 567,
      comments: 89,
      readTime: '12 min'
    },
    {
      id: 't3',
      title: 'The Future of Web Development: What to Expect in 2025',
      excerpt: 'A comprehensive look at emerging technologies, frameworks, and development practices that will shape the web development landscape.',
      content: 'Full content...',
      author: { name: 'Maria Rodriguez' },
      publishedAt: '2 days ago',
      likes: 445,
      comments: 67,
      readTime: '10 min'
    }
  ];

  const trendingTopics = [
    { name: 'React', posts: 1234 },
    { name: 'TypeScript', posts: 892 },
    { name: 'AI/ML', posts: 756 },
    { name: 'Web Performance', posts: 645 },
    { name: 'UI/UX Design', posts: 523 },
    { name: 'Node.js', posts: 445 },
    { name: 'CSS', posts: 389 },
    { name: 'JavaScript', posts: 1567 }
  ];

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const isLiked = prev.includes(postId);
      if (isLiked) {
        toast({ description: 'Removed from favorites' });
        return prev.filter(id => id !== postId);
      } else {
        toast({ description: 'Added to favorites ❤️' });
        return [...prev, postId];
      }
    });
  };

  const handleComment = (postId: string) => {
    toast({ description: 'Comment feature coming soon!' });
  };

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Trending
          </h1>
          <p className="text-muted-foreground">Discover the most popular content in our community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Hot Right Now</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Last 24 hours</span>
              </div>
            </div>

            {trendingPosts.map(post => (
              <div key={post.id} className="relative">
                <div className="absolute -left-4 top-4 flex items-center justify-center w-8 h-8 bg-primary rounded-full text-white text-sm font-bold z-10">
                  #{trendingPosts.indexOf(post) + 1}
                </div>
                <BlogCard
                  post={post}
                  onLike={handleLike}
                  onComment={handleComment}
                  isLiked={likedPosts.includes(post.id)}
                />
              </div>
            ))}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gradient-card border-0 shadow-card sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-primary" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={topic.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <Badge variant="secondary" className="mb-1">
                          {topic.name}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {topic.posts.toLocaleString()} posts
                        </p>
                      </div>
                    </div>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">2.3k</div>
                  <div className="text-sm text-muted-foreground">Active Writers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">15.7k</div>
                  <div className="text-sm text-muted-foreground">Posts This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">89.2k</div>
                  <div className="text-sm text-muted-foreground">Total Interactions</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Trending;