import { BlogHeader } from '@/components/BlogHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool, Users, Heart, MessageCircle } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <PenTool className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">About eBlogging</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A modern blogging platform where creativity meets community. Share your stories, connect with readers, and discover amazing content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                Our Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Join thousands of writers and readers from around the world. Share your unique perspective, learn from others, and build meaningful connections through the power of storytelling.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-blog-like" />
                Interactive Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Engage with content through likes, comments, and thoughtful discussions. Our platform encourages meaningful interactions that help ideas flourish and communities grow.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              Why VibeWrite?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <PenTool className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Easy Writing</h3>
                <p className="text-sm text-muted-foreground">Clean, distraction-free writing environment</p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Active Community</h3>
                <p className="text-sm text-muted-foreground">Connect with like-minded creators</p>
              </div>
              
              <div className="text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Meaningful Engagement</h3>
                <p className="text-sm text-muted-foreground">Quality interactions over quantity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
