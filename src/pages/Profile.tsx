import { User, MapPin, Calendar, Heart, MessageCircle, Edit, Save, X, Bookmark, Trash2, Loader2, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogHeader } from '@/components/BlogHeader';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { api, ApiPost } from '@/lib/api';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [myPosts, setMyPosts] = useState<ApiPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<ApiPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const refreshProfilePosts = async () => {
    try {
      const [authored, liked, saved] = await Promise.all([
        api.get<{ posts: ApiPost[] }>('/api/profile/posts', true),
        api.get<{ posts: ApiPost[] }>('/api/profile/liked', true),
        api.get<{ posts: ApiPost[] }>('/api/profile/saved', true),
      ]);
      setMyPosts(authored.posts);
      setLikedPosts(liked.posts);
      setSavedPosts(saved.posts);
    } catch (error) {
      toast({ title: 'Could not load your posts', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || !localStorage.getItem('token')) {
      setLoading(false);
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setEditedUser({
      name: parsedUser.name,
      bio: parsedUser.bio || 'Passionate writer and tech enthusiast. Sharing my thoughts on the latest in technology and web development.',
      location: parsedUser.location || 'San Francisco, CA',
      skills: parsedUser.skills || ['React', 'TypeScript', 'Node.js', 'UI/UX']
    });
    refreshProfilePosts();
  }, []);

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...editedUser };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditingProfile(false);
    toast({ title: 'Profile updated', description: 'Your display information has been saved locally.' });
  };

  const handleLike = async (postId: string) => {
    try {
      const result = await api.post<{ liked: boolean; likes: number }>(`/api/posts/${postId}/like`, {}, true);
      const update = (post: ApiPost) => post.id === postId ? { ...post, likes: result.likes, likedByMe: result.liked } : post;
      setMyPosts((posts) => posts.map(update));
      setLikedPosts((posts) => result.liked ? posts.map(update) : posts.filter((post) => post.id !== postId));
      setSavedPosts((posts) => posts.map(update));
      if (result.liked && !likedPosts.some((post) => post.id === postId)) await refreshProfilePosts();
    } catch (error) {
      toast({ title: 'Could not update like', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    }
  };

  const handleToggleSaved = async (postId: string) => {
    try {
      const result = await api.post<{ saved: boolean }>(`/api/posts/${postId}/save`, {}, true);
      if (!result.saved) setSavedPosts((posts) => posts.filter((post) => post.id !== postId));
      else await refreshProfilePosts();
      toast({ description: result.saved ? 'Post saved.' : 'Post removed from saved posts.' });
    } catch (error) {
      toast({ title: 'Could not update saved posts', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Delete this blog permanently? This cannot be undone.')) return;
    try {
      await api.delete(`/api/posts/${postId}`);
      setMyPosts((posts) => posts.filter((post) => post.id !== postId));
      setLikedPosts((posts) => posts.filter((post) => post.id !== postId));
      setSavedPosts((posts) => posts.filter((post) => post.id !== postId));
      toast({ title: 'Post deleted', description: 'Your blog has been deleted.' });
    } catch (error) {
      toast({ title: 'Could not delete post', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    }
  };

  const publishedPosts = useMemo(() => myPosts.filter((post) => post.status === 'published'), [myPosts]);
  const draftPosts = useMemo(() => myPosts.filter((post) => post.status === 'draft'), [myPosts]);
  const totalLikes = useMemo(() => myPosts.reduce((total, post) => total + post.likes, 0), [myPosts]);

  if (!user || !editedUser) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
          <h1 className="font-serif text-3xl font-semibold">Please log in to view your profile</h1>
          <Button onClick={() => navigate('/auth')} className="mt-6 rounded-full">Log in</Button>
        </main>
      </div>
    );
  }

  const renderPostCard = (post: ApiPost, authorControls = false) => (
    <Card key={post.id} className="border-border/60 bg-gradient-card shadow-card transition-shadow hover:shadow-hover">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{post.category || 'Perspective'}</Badge>
              {post.status === 'draft' && <Badge variant="outline">Draft</Badge>}
            </div>
            <CardTitle onClick={() => navigate(`/story/${post.id}`)} className="cursor-pointer font-serif text-xl leading-tight transition-colors hover:text-primary">{post.title}</CardTitle>
          </div>
          {authorControls && (
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" size="icon" title="Edit post" onClick={() => navigate(`/write/${post.id}`)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" title="Delete post" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-5 line-clamp-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <span className="text-xs text-muted-foreground">{post.publishedAt || new Date(post.createdAt).toLocaleDateString()} · {post.readTime || '5 min'} read</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)} className={post.likedByMe ? 'text-blog-like' : 'text-muted-foreground'}><Heart className={`mr-1.5 h-4 w-4 ${post.likedByMe ? 'fill-current' : ''}`} />{post.likes}</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/story/${post.id}#comments`)} className="text-muted-foreground"><MessageCircle className="mr-1.5 h-4 w-4" />{post.comments}</Button>
            <Button variant="ghost" size="sm" onClick={() => handleToggleSaved(post.id)} className={post.savedByMe ? 'text-primary' : 'text-muted-foreground'}><Bookmark className={`mr-1.5 h-4 w-4 ${post.savedByMe ? 'fill-current' : ''}`} />{post.savedByMe ? 'Saved' : 'Save'}</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <BlogHeader />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="mb-8 overflow-hidden border-border/60 bg-gradient-card shadow-card">
          <div className="h-32 w-full bg-primary/10" />
          <CardContent className="relative px-8 pb-8 pt-0">
            <div className="-mt-12 mb-8 flex flex-col items-start gap-6 md:flex-row md:items-end">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    {isEditingProfile ? <Input value={editedUser.name} onChange={(event) => setEditedUser({ ...editedUser, name: event.target.value })} className="mb-2 h-auto py-1 text-2xl font-bold" /> : <h1 className="mb-1 text-2xl font-bold text-foreground">{user.name}</h1>}
                    <p className="text-muted-foreground">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
                  </div>
                  <div className="flex gap-2">
                    {isEditingProfile ? <><Button onClick={handleSaveProfile} className="rounded-full"><Save className="mr-2 h-4 w-4" />Save</Button><Button variant="outline" onClick={() => setIsEditingProfile(false)} className="rounded-full"><X className="mr-2 h-4 w-4" />Cancel</Button></> : <Button variant="outline" onClick={() => setIsEditingProfile(true)} className="rounded-full"><Edit className="mr-2 h-4 w-4" />Edit Profile</Button>}
                  </div>
                </div>
                <div className="space-y-4">
                  {isEditingProfile ? <Textarea value={editedUser.bio} onChange={(event) => setEditedUser({ ...editedUser, bio: event.target.value })} className="min-h-[90px]" /> : <p className="text-sm leading-relaxed text-muted-foreground">{editedUser.bio}</p>}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{isEditingProfile ? <Input value={editedUser.location} onChange={(event) => setEditedUser({ ...editedUser, location: event.target.value })} className="h-7 w-44" /> : editedUser.location}</span><span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Joined {new Date().getFullYear()}</span></div>
                  <div className="flex flex-wrap gap-2">{editedUser.skills.map((skill: string) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border/60 pt-6 md:grid-cols-4">
                  <div className="text-center"><div className="text-2xl font-bold">{publishedPosts.length}</div><div className="text-sm text-muted-foreground">Published</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">{draftPosts.length}</div><div className="text-sm text-muted-foreground">Drafts</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">{savedPosts.length}</div><div className="text-sm text-muted-foreground">Saved</div></div>
                  <div className="text-center"><div className="text-2xl font-bold">{totalLikes}</div><div className="text-sm text-muted-foreground">Likes</div></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-4"><TabsTrigger value="posts">My Posts</TabsTrigger><TabsTrigger value="liked">Liked Posts</TabsTrigger><TabsTrigger value="saved">Saved Posts</TabsTrigger><TabsTrigger value="drafts">Drafts</TabsTrigger></TabsList>
          <TabsContent value="posts" className="space-y-5">
            {loading ? <div className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />Loading your posts…</div> : publishedPosts.length ? publishedPosts.map((post) => renderPostCard(post, true)) : <Card className="py-12 text-center"><CardContent><PenLine className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" /><p className="text-muted-foreground">You have not published any blogs yet.</p><Button onClick={() => navigate('/write')} className="mt-5 rounded-full">Write your first blog</Button></CardContent></Card>}
          </TabsContent>
          <TabsContent value="liked" className="space-y-5">
            {loading ? <div className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />Loading liked posts…</div> : likedPosts.length ? likedPosts.map((post) => renderPostCard(post, post.author === user.id)) : <Card className="py-12 text-center"><CardContent><Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" /><p className="text-muted-foreground">Posts you like will appear here.</p></CardContent></Card>}
          </TabsContent>
          <TabsContent value="saved" className="space-y-5">
            {loading ? <div className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />Loading saved posts…</div> : savedPosts.length ? savedPosts.map((post) => renderPostCard(post, post.author === user.id)) : <Card className="py-12 text-center"><CardContent><Bookmark className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" /><p className="text-muted-foreground">Posts you save will appear here.</p></CardContent></Card>}
          </TabsContent>
          <TabsContent value="drafts" className="space-y-5">
            {loading ? <div className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />Loading drafts…</div> : draftPosts.length ? draftPosts.map((post) => renderPostCard(post, true)) : <Card className="py-12 text-center"><CardContent><Edit className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" /><p className="text-muted-foreground">Your saved drafts will appear here.</p></CardContent></Card>}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
