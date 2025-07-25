import { PenTool, Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';

export const BlogHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <PenTool className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                VibeWrite
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className={isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
              >
                Feed
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/trending')}
                className={isActive('/trending') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
              >
                Trending
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/about')}
                className={isActive('/about') ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
              >
                About
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search posts..." 
                className="pl-10 w-64 bg-muted/50 border-0 focus:bg-background transition-colors"
              />
            </div>
            
            <Button variant="ghost" size="sm" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Button 
              onClick={() => navigate('/write')}
              className="rounded-full px-6 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Write
            </Button>
            
            <Avatar 
              className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all"
              onClick={() => navigate('/profile')}
            >
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};