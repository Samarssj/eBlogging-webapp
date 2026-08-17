import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlogHeader } from '@/components/BlogHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PenTool, Eye, Save, Send, ArrowLeft, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, ApiPost } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

const Write = () => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const isEditing = Boolean(postId);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth', { replace: true });
      return;
    }
    if (!postId) return;

    let active = true;
    setLoadingPost(true);
    api.get<{ post: ApiPost }>(`/api/posts/${postId}`, true).then(({ post }) => {
      if (!active) return;
      setTitle(post.title);
      setExcerpt(post.excerpt);
      setContent(post.content);
      setImage(post.image || '');
    }).catch((error) => {
      if (active) {
        toast({ title: 'Could not load blog', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
        navigate('/profile', { replace: true });
      }
    }).finally(() => {
      if (active) setLoadingPost(false);
    });
    return () => { active = false; };
  }, [navigate, postId, toast]);

  const persistPost = async (status: 'draft' | 'published') => {
    if (!isAuthenticated()) {
      toast({ title: 'Authentication required', description: 'Sign in before saving or publishing a blog.', variant: 'destructive' });
      navigate('/auth');
      return;
    }
    if (!title.trim() || (status === 'published' && !content.trim())) {
      toast({ description: status === 'draft' ? 'Add a title before saving your draft.' : 'Add both a title and content before publishing.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = { 
        title: title.trim(), 
        excerpt: excerpt.trim(), 
        content: content.trim(), 
        image: image.trim(),
        status 
      };
      const result = isEditing
        ? await api.put<{ post: ApiPost }>(`/api/posts/${postId}`, payload, true)
        : await api.post<{ post: ApiPost }>('/api/posts', payload, true);
      
      toast({ title: isEditing ? 'Blog updated' : status === 'draft' ? 'Draft saved' : 'Blog published' });
      navigate('/');
    } catch (error) {
      toast({ title: 'Could not save blog', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <BlogHeader />
      <main className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 rounded-full pl-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
        <div className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">{isEditing ? 'Refine your published story' : 'Create something lasting'}</p>
          <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight sm:text-5xl"><PenTool className="h-8 w-8 text-primary" /> {isEditing ? 'Edit your blog' : 'Write your blog'}</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Card className="border-border/60 bg-gradient-card shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="font-serif text-2xl">{isPreview ? 'Preview' : isEditing ? 'Edit' : 'Write'}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsPreview((value) => !value)} className="flex items-center gap-2 rounded-full"><Eye className="h-4 w-4" />{isPreview ? 'Edit' : 'Preview'}</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isPreview ? (
                <>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A clear, memorable title" className="mt-2 text-lg font-semibold" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="image">Cover Image URL (optional)</Label>
                      <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                        Find images on Unsplash <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="image" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://images.unsplash.com/photo-..." className="pl-10" />
                    </div>
                    {image && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-border/60 h-40 bg-muted flex items-center justify-center">
                        <img 
                          src={image} 
                          alt="Live Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Summarize your idea in a few sentences" className="mt-2 min-h-[90px] resize-none" />
                  </div>
                  <div>
                    <Label htmlFor="content">Article content</Label>
                    <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing your story..." className="mt-2 min-h-[420px] resize-y leading-7" />
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {image && <img src={image} alt="Preview" className="w-full h-64 object-cover rounded-lg shadow-md" />}
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">{excerpt || 'Your excerpt will appear here.'}</p>
                    <h2 className="font-serif text-4xl font-semibold leading-tight">{title || 'Your post title'}</h2>
                  </div>
                  <div className="prose prose-stone max-w-none whitespace-pre-wrap leading-8 dark:prose-invert">{content || 'Your post content will appear here...'}</div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit border-border/60 bg-gradient-card shadow-card lg:sticky lg:top-24">
            <CardHeader><CardTitle className="text-lg">Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => persistPost('published')} disabled={saving || loadingPost} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Publish blog'}
              </Button>
              {!isEditing && (
                <Button onClick={() => persistPost('draft')} variant="outline" disabled={saving || loadingPost} className="w-full rounded-full">
                  <Save className="mr-2 h-4 w-4" /> Save draft
                </Button>
              )}
              <div className="border-t border-border/60 pt-4">
                <h4 className="mb-3 text-sm font-semibold italic text-muted-foreground text-center">Tip: Right-click an image on Unsplash and select "Copy image address" to get a direct link.</h4>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Write;
