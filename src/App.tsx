import { useState, useEffect } from 'react';
import { DesignIdeasList } from './components/DesignIdeasList';
import { DesignIdeaForm } from './components/DesignIdeaForm';
import { DesignIdeaDetail } from './components/DesignIdeaDetail';
import { AuthForm } from './components/AuthForm';
import { Button } from './components/ui/button';
import { Plus, LogOut, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { createClient } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

export interface DesignIdea {
  id: string;
  title: string;
  description: string;
  details: string;
  tags: string[];
  images: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'idea' | 'in-progress' | 'completed' | 'archived';
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userIdeas, setUserIdeas] = useState<DesignIdea[]>([]);
  const [sharedIdeas, setSharedIdeas] = useState<DesignIdea[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<DesignIdea | null>(null);
  const [viewingIdea, setViewingIdea] = useState<DesignIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setAccessToken(session.access_token);
        await loadIdeas(session.access_token);
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadIdeas = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/ideas`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserIdeas(data.userIdeas || []);
        setSharedIdeas(data.sharedIdeas || []);
      } else {
        console.error('Failed to load ideas:', await response.text());
      }
    } catch (error) {
      console.error('Load ideas error:', error);
    }
  };

  const saveIdeas = async (ideas: DesignIdea[]) => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/ideas`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ideas }),
        }
      );

      if (!response.ok) {
        console.error('Failed to save ideas:', await response.text());
      }
    } catch (error) {
      console.error('Save ideas error:', error);
    }
  };

  // Save user ideas whenever they change
  useEffect(() => {
    if (user && userIdeas.length >= 0) {
      saveIdeas(userIdeas);
    }
  }, [userIdeas]);

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      setUser(data.user);
      setAccessToken(data.session.access_token);
      await loadIdeas(data.session.access_token);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/signup`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sign up');
    }

    // After signup, log in
    await handleLogin(email, password);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    setUserIdeas([]);
    setSharedIdeas([]);
  };

  const handleAddIdea = (idea: Omit<DesignIdea, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIdea: DesignIdea = {
      ...idea,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUserIdeas([newIdea, ...userIdeas]);
    setIsDialogOpen(false);
  };

  const handleUpdateIdea = (id: string, updates: Omit<DesignIdea, 'id' | 'createdAt' | 'updatedAt'>) => {
    setUserIdeas(userIdeas.map(idea => 
      idea.id === id 
        ? { ...idea, ...updates, updatedAt: new Date().toISOString() }
        : idea
    ));
    setEditingIdea(null);
    setIsDialogOpen(false);
  };

  const handleDeleteIdea = (id: string) => {
    setUserIdeas(userIdeas.filter(idea => idea.id !== id));
  };

  const handleEditClick = (idea: DesignIdea) => {
    setViewingIdea(null);
    setEditingIdea(idea);
    setIsDialogOpen(true);
  };

  const handleViewClick = (idea: DesignIdea) => {
    setViewingIdea(idea);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingIdea(null);
  };

  const handleViewDialogClose = () => {
    setViewingIdea(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900">Design Ideas</h1>
              <p className="text-slate-600 mt-2">
                Capture and organize your creative concepts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                New Idea
              </Button>
              <Button onClick={handleLogout} variant="outline" className="gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Ideas Tabs */}
        <Tabs defaultValue="my-ideas" className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-ideas">My Ideas</TabsTrigger>
            <TabsTrigger value="shared" className="gap-2">
              <Users className="w-4 h-4" />
              Shared Ideas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-ideas">
            <DesignIdeasList 
              ideas={userIdeas}
              onEdit={handleEditClick}
              onDelete={handleDeleteIdea}
              onView={handleViewClick}
            />
          </TabsContent>

          <TabsContent value="shared">
            <DesignIdeasList 
              ideas={sharedIdeas}
              onEdit={() => {}}
              onDelete={() => {}}
              onView={handleViewClick}
              readOnly
            />
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>
                {editingIdea ? 'Edit Design Idea' : 'New Design Idea'}
              </DialogTitle>
            </DialogHeader>
            <DesignIdeaForm
              idea={editingIdea}
              onSubmit={(data) => {
                if (editingIdea) {
                  handleUpdateIdea(editingIdea.id, data);
                } else {
                  handleAddIdea(data);
                }
              }}
              onCancel={handleDialogClose}
            />
          </DialogContent>
        </Dialog>

        {/* View Detail Dialog */}
        <Dialog open={!!viewingIdea} onOpenChange={handleViewDialogClose}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            {viewingIdea && (
              <DesignIdeaDetail 
                idea={viewingIdea} 
                onEdit={() => handleEditClick(viewingIdea)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
