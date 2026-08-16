import { User, MapPin, Calendar, Heart, MessageCircle, Eye, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlogHeader } from '@/components/BlogHeader';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditedUser({
        name: parsedUser.name,
        bio: parsedUser.bio || 'Passionate writer and tech enthusiast. Sharing my thoughts on the latest in technology and web development.',
        location: parsedUser.location || 'San Francisco, CA',
        skills: parsedUser.skills || ['React', 'TypeScript', 'Node.js', 'UI/UX']
      });
    }
  }, []);

  const handleSave = () => {
    const updatedUser = { ...user, ...editedUser };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    toast({ title: 'Profile Updated', description: 'Your profile has been successfully updated.' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container mx-auto px-4 py-8 max-w-4xl text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </main>
      </div>
    );
  }

  const userStats = {
    posts: 12,
    followers: 1234,
    following: 567,
    likes: 8900
  };

  const userPosts = [
    {
      id: '1',
      title: 'Building Modern Web Applications with React and Tailwind',
      excerpt: 'Learn how to create beautiful and responsive web applications using the latest tools and best practices in the React ecosystem.',
      publishedAt: '2 days ago',
      likes: 124,
      comments: 18,
      views: 1200
    },
    {
      id: '2',
      title: 'The Power of TypeScript in Large Scale Projects',
      excerpt: 'Discover why TypeScript is becoming the industry standard for building robust and maintainable large-scale web applications.',
      publishedAt: '1 week ago',
      likes: 89,
      comments: 12,
      views: 850
    }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <BlogHeader />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 border-0 shadow-lg bg-card overflow-hidden">
          <div className="h-32 bg-primary/10 w-full" />
          <CardContent className="relative pt-0 pb-8 px-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 mb-8">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    {isEditing ? (
                      <Input 
                        value={editedUser.name} 
                        onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                        className="text-2xl font-bold mb-2 h-auto py-1"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-foreground mb-1">{user.name}</h2>
                    )}
                    <p className="text-muted-foreground">@{user.name.toLowerCase().replace(/\s/g, '')}</p>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} className="rounded-full px-6">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-full px-6">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-full px-6">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    {isEditing ? (
                      <Textarea 
                        value={editedUser.bio} 
                        onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                        className="text-sm text-muted-foreground leading-relaxed min-h-[100px]"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">{editedUser.bio}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {isEditing ? (
                          <Input 
                            value={editedUser.location} 
                            onChange={(e) => setEditedUser({...editedUser, location: e.target.value})}
                            className="h-7 py-0 px-2"
                          />
                        ) : editedUser.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined March 2024
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editedUser.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border pt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{userStats.posts}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{userStats.followers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{userStats.following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{userStats.likes.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="posts">My Posts</TabsTrigger>
            <TabsTrigger value="liked">Liked Posts</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="space-y-6">
            {userPosts.map(post => (
              <Card key={post.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{post.publishedAt}</span>
                      <div className="flex items-center gap-1.5">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" />
                        {post.views}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="liked">
            <Card className="border-0 shadow-md py-12 text-center">
              <CardContent>
                <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Posts you've liked will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="drafts">
            <Card className="border-0 shadow-md py-12 text-center">
              <CardContent>
                <Edit className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Your draft posts will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
