import { useState } from 'react';
import { MessageCircle, Heart, Reply, Send, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
  isLiked?: boolean;
}

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  onLikeComment: (commentId: string) => void;
}

export const CommentSection = ({ comments, onAddComment, onLikeComment }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const handleSubmitReply = (parentId: string) => {
    if (replyContent.trim()) {
      onAddComment(replyContent, parentId);
      setReplyContent('');
      setReplyTo(null);
    }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`animate-comment-slide ${isReply ? 'ml-12 mt-4' : 'mb-6'}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback className="bg-muted">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="bg-muted rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm text-foreground">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-2 mt-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLikeComment(comment.id)}
              className={`h-7 px-2 rounded-full text-xs transition-all duration-300 ${
                comment.isLiked 
                  ? 'bg-blog-like-bg text-blog-like' 
                  : 'hover:bg-blog-like-bg hover:text-blog-like'
              }`}
            >
              <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
              {comment.likes}
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="h-7 px-2 rounded-full text-xs hover:bg-secondary transition-all duration-300"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>

          {replyTo === comment.id && (
            <div className="mt-3 ml-2">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] resize-none border-muted"
                />
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {comment.replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-primary" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="rounded-full px-6"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-0">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};