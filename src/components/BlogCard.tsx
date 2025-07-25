import { useState } from 'react';
import { Heart, MessageCircle, Share2, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  likes: number;
  comments: number;
  readTime: string;
}

interface BlogCardProps {
  post: BlogPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  isLiked?: boolean;
}

export const BlogCard = ({ post, onLike, onComment, isLiked = false }: BlogCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = () => {
    onLike(post.id);
  };

  const handleComment = () => {
    onComment(post.id);
  };

  return (
    <Card 
      className="group bg-gradient-card hover:bg-gradient-hover border-0 shadow-card hover:shadow-hover transition-all duration-300 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-foreground">{post.author.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{post.publishedAt}</span>
              <span>•</span>
              <span>{post.readTime} read</span>
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {post.title}
        </h2>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`group/like h-9 px-3 rounded-full transition-all duration-300 ${
                isLiked 
                  ? 'bg-blog-like-bg text-blog-like hover:bg-blog-like-bg hover:shadow-like' 
                  : 'hover:bg-blog-like-bg hover:text-blog-like'
              }`}
            >
              <Heart 
                className={`h-4 w-4 mr-2 transition-all duration-300 ${
                  isLiked 
                    ? 'fill-current animate-like-bounce' 
                    : 'group-hover/like:scale-110'
                }`} 
              />
              <span className="font-medium">{post.likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="h-9 px-3 rounded-full hover:bg-blog-comment-bg hover:text-blog-comment transition-all duration-300"
            >
              <MessageCircle className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium">{post.comments}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 rounded-full hover:bg-secondary transition-all duration-300"
          >
            <Share2 className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};