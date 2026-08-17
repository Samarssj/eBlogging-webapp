import { useState } from 'react';
import { Heart, MessageCircle, Share2, User, ArrowUpRight, Bookmark, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  author: { id: string; name: string; avatar?: string };
  publishedAt: string;
  likes: number;
  comments: number;
  readTime: string;
  image?: string;
  category?: string;
}

interface BlogCardProps {
  post: BlogPost;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onDelete?: (id: string) => void;
  onSave?: (id: string) => void;
  onOpen?: (id: string) => void;
  isLiked?: boolean;
  isSaved?: boolean;
  featured?: boolean;
  currentUserId?: string;
}

export const BlogCard = ({ 
  post, 
  onLike, 
  onComment, 
  onDelete,
  onSave, 
  onOpen,
  isLiked, 
  isSaved,
  featured,
  currentUserId
}: BlogCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [saved, setLocalSaved] = useState(isSaved);
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ description: 'Link copied to clipboard!' });
  };

  const accent = featured ? 'bg-primary/5' : '';
  const postId = post.id || post._id || '';
  const isAuthor = currentUserId && post.author.id === currentUserId;

  return (
    <Card 
      className={`group relative flex cursor-pointer flex-col overflow-hidden border-border/60 bg-gradient-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover ${featured ? 'md:grid md:grid-cols-[0.9fr_1.1fr]' : ''}`}
      onClick={() => onOpen?.(postId)}
    >
      <div className={`relative min-h-[190px] overflow-hidden bg-gradient-to-br ${accent} ${featured ? 'md:min-h-full' : ''}`}>
        {post.image && <img src={post.image} alt="" className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${isHovered ? 'scale-105' : 'scale-100'}`} />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,white/25,transparent_28%),linear-gradient(135deg,transparent,black/35)]" />
        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white/90">
          <span className="rounded-full bg-black/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">{post.category || 'Perspective'}</span>
          <ArrowUpRight className={`h-5 w-5 transition-transform duration-300 ${isHovered ? 'translate-x-1 -translate-y-1' : ''}`} />
        </div>
      </div>
      <div className="flex min-w-0 flex-col">
        <CardHeader className="pb-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-background">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="bg-secondary text-secondary-foreground"><User className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{post.author.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{post.publishedAt}</span><span>·</span><span>{post.readTime} read</span></div>
              </div>
            </div>
            {isAuthor && onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(postId);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <h2 className={`font-serif font-semibold leading-[1.08] text-foreground transition-colors duration-300 group-hover:text-primary ${featured ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>{post.title}</h2>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-0">
          <p className="mb-6 line-clamp-3 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
          <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); onLike(postId); }} className={`h-9 rounded-full px-3 ${isLiked ? '!bg-blog-like-bg !text-blog-like hover:!bg-blog-like-bg hover:!text-blog-like' : 'text-muted-foreground hover:bg-blog-like-bg hover:text-blog-like'}`}>
                <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} /> <span className="font-semibold">{post.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); onComment(postId); }} className="h-9 rounded-full px-3 text-muted-foreground hover:bg-blog-comment-bg hover:text-blog-comment">
                <MessageCircle className="mr-2 h-4 w-4" /> <span className="font-semibold">{post.comments}</span>
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={(event) => {
                  event.stopPropagation();
                  if (onSave) onSave(postId);
                  else setLocalSaved((value) => !value);
                }} className={`h-9 w-9 rounded-full ${saved ? 'bg-secondary text-primary' : 'text-muted-foreground'}`}>
                <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); handleShare(); }} className="h-9 w-9 rounded-full text-muted-foreground"><Share2 className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
