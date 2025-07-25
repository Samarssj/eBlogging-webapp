import { useState } from 'react';
import { BlogHeader } from '@/components/BlogHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PenTool, Eye, Save, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Write = () => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    if (!title.trim()) {
      toast({ description: 'Please add a title', variant: 'destructive' });
      return;
    }
    toast({ description: 'Draft saved successfully!' });
  };

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      toast({ description: 'Please add title and content', variant: 'destructive' });
      return;
    }
    toast({ description: 'Post published successfully! 🎉' });
  };

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <PenTool className="h-8 w-8 text-primary" />
            Write New Post
          </h1>
          <p className="text-muted-foreground">Share your thoughts with the community</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {isPreview ? 'Preview' : 'Write'}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreview(!isPreview)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {isPreview ? 'Edit' : 'Preview'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {!isPreview ? (
                  <>
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your post title..."
                        className="mt-2 text-lg font-semibold"
                      />
                    </div>

                    <div>
                      <Label htmlFor="excerpt" className="text-sm font-medium">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief description of your post..."
                        className="mt-2 min-h-[80px] resize-none"
                      />
                    </div>

                    <div>
                      <Label htmlFor="content" className="text-sm font-medium">Content</Label>
                      <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing your story..."
                        className="mt-2 min-h-[400px] resize-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-4">
                        {title || 'Your Post Title'}
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        {excerpt || 'Your post excerpt will appear here...'}
                      </p>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {content || 'Your post content will appear here...'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-gradient-card border-0 shadow-card sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                
                <Button
                  onClick={handlePublish}
                  className="w-full flex items-center gap-2 bg-gradient-primary hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                  Publish Post
                </Button>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-sm text-foreground mb-3">Writing Tips</h4>
                  <ul className="text-xs text-muted-foreground space-y-2">
                    <li>• Start with a compelling title</li>
                    <li>• Write a clear excerpt</li>
                    <li>• Use short paragraphs</li>
                    <li>• Add personal examples</li>
                    <li>• End with a call to action</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Write;