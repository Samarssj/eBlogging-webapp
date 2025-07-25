import { BlogHeader } from '@/components/BlogHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, MapPin, Calendar, Heart, MessageCircle, Eye, Edit } from 'lucide-react';

const Profile = () => {
  const userStats = {
    posts: 12,
    followers: 1234,
    following: 89,
    likes: 5678
  };

  const userPosts = [
    {
      id: '1',
      title: 'My Journey into Web Development',
      excerpt: 'How I transitioned from marketing to becoming a full-stack developer...',
      publishedAt: '2 days ago',
      likes: 89,
      comments: 12,
      views: 1234
    },
    {
      id: '2',
      title: 'Building My First React App',
      excerpt: 'Lessons learned while creating my first React application...',
      publishedAt: '1 week ago',
      likes: 156,
      comments: 23,
      views: 2345
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="bg-gradient-card border-0 shadow-card mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">John Doe</h1>
                    <p className="text-muted-foreground mb-3">
                      Full-stack developer passionate about creating beautiful user experiences. 
                      Love sharing knowledge and learning from the community.
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        San Francisco, CA
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined March 2024
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">React</Badge>
                      <Badge variant="secondary">TypeScript</Badge>
                      <Badge variant="secondary">Node.js</Badge>
                      <Badge variant="secondary">UI/UX</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">My Posts</TabsTrigger>
            <TabsTrigger value="liked">Liked Posts</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {userPosts.map(post => (
              <Card key={post.id} className="bg-gradient-card border-0 shadow-card hover:shadow-hover transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg hover:text-primary transition-colors cursor-pointer">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{post.publishedAt}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="liked">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="py-8 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Posts you've liked will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="drafts">
            <Card className="bg-gradient-card border-0 shadow-card">
              <CardContent className="py-8 text-center">
                <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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