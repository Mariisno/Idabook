import { useState, useEffect, useRef } from 'react';
import { DesignIdeasList } from './components/DesignIdeasList';
import { DesignIdeaForm } from './components/DesignIdeaForm';
import { DesignIdeaDetail } from './components/DesignIdeaDetail';
import { AuthForm } from './components/AuthForm';
import { UserSearch } from './components/UserSearch';
import { Button } from './components/ui/button';
import { Plus, LogOut, Users, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { createClient, setSessionPersistence } from './utils/supabase/client';
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
  ownerId: string;
  ownerName: string;
  collaborators: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userIdeas, setUserIdeas] = useState<DesignIdea[]>([]);
  const [sharedIdeas, setSharedIdeas] = useState<DesignIdea[]>([]);
  const [followingFeed, setFollowingFeed] = useState<DesignIdea[]>([]);
  const [publicFeed, setPublicFeed] = useState<DesignIdea[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<DesignIdea | null>(null);
  const [viewingIdea, setViewingIdea] = useState<DesignIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());
  const isInitialLoad = useRef(true);

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
      // Mark as initial load to prevent saving
      isInitialLoad.current = true;
      
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
      
      // Load following list and feeds
      await loadFollowing(token);
      await loadFeeds(token);
      
      // After initial load is complete, allow saving
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 100);
    } catch (error) {
      console.error('Load ideas error:', error);
    }
  };

  const loadFollowing = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/following`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFollowingIds(data.following || []);
      }
    } catch (error) {
      console.error('Failed to load following:', error);
    }
  };

  const loadFeeds = async (token: string) => {
    try {
      // Load following feed
      const followingResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/feed/following`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (followingResponse.ok) {
        const followingData = await followingResponse.json();
        setFollowingFeed(followingData.ideas || []);
      }

      // Load public feed
      const publicResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/feed/public`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        setPublicFeed(publicData.ideas || []);
      }
    } catch (error) {
      console.error('Failed to load feeds:', error);
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
      } else {
        // Check if any ideas are shared and reload feeds
        const hasSharedIdeas = ideas.some(idea => idea.isShared);
        if (hasSharedIdeas) {
          // Small delay to ensure backend has processed the save
          setTimeout(() => {
            loadFeeds(accessToken);
          }, 300);
        }
      }
    } catch (error) {
      console.error('Save ideas error:', error);
    }
  };

  // Save user ideas whenever they change
  useEffect(() => {
    // Don't save during initial load
    if (isInitialLoad.current) return;
    
    if (user && accessToken && userIdeas.length >= 0) {
      saveIdeas(userIdeas);
    }
  }, [userIdeas, user, accessToken]);

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    // Set session persistence before login
    setSessionPersistence(rememberMe);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      // Set accessToken FIRST before loading ideas
      setAccessToken(data.session.access_token);
      setUser(data.user);
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
    await handleLogin(email, password, true);
  };

  const handleResetPassword = async (email: string) => {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/reset-password`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send reset email');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear both localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`sb-${projectId}-auth-token`);
      sessionStorage.removeItem(`sb-${projectId}-auth-token`);
      sessionStorage.removeItem('use-session-storage');
    }
    setUser(null);
    setAccessToken(null);
    setUserIdeas([]);
    setSharedIdeas([]);
    setFollowingFeed([]);
    setPublicFeed([]);
    setFollowingIds([]);
  };

  const handleAddIdea = (idea: Omit<DesignIdea, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIdea: DesignIdea = {
      ...idea,
      id: crypto.randomUUID(),
      ownerId: user?.id || '',
      ownerName: user?.user_metadata?.name || user?.email || '',
      collaborators: idea.collaborators || [],
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

  const handleSearchUsers = async (query: string) => {
    if (!accessToken) return [];
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      }
    } catch (error) {
      console.error('Search users error:', error);
    }
    
    return [];
  };

  const handleFollowUser = async (userId: string) => {
    if (!accessToken) return;
    
    try {
      const isFollowing = followingIds.includes(userId);
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ targetUserId: userId }),
        }
      );

      if (response.ok) {
        // Update local state
        if (isFollowing) {
          setFollowingIds(followingIds.filter(id => id !== userId));
        } else {
          setFollowingIds([...followingIds, userId]);
        }
        
        // Reload feeds
        await loadFeeds(accessToken);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    }
  };

  const handleAddCollaborator = async (ideaId: string, userId: string, userName: string) => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/ideas/${ideaId}/collaborators`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ collaboratorId: userId, collaboratorName: userName }),
        }
      );

      if (response.ok) {
        // Update local state
        setUserIdeas(userIdeas.map(idea => {
          if (idea.id === ideaId) {
            const collaborators = idea.collaborators || [];
            if (!collaborators.find(c => c.id === userId)) {
              return {
                ...idea,
                collaborators: [...collaborators, { id: userId, name: userName }],
              };
            }
          }
          return idea;
        }));
      }
    } catch (error) {
      console.error('Add collaborator error:', error);
    }
  };

  const handleRemoveCollaborator = async (ideaId: string, userId: string) => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/ideas/${ideaId}/collaborators/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        // Update local state
        setUserIdeas(userIdeas.map(idea => {
          if (idea.id === ideaId) {
            return {
              ...idea,
              collaborators: (idea.collaborators || []).filter(c => c.id !== userId),
            };
          }
          return idea;
        }));
      }
    } catch (error) {
      console.error('Remove collaborator error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm 
        onLogin={handleLogin} 
        onSignup={handleSignup}
        onResetPassword={handleResetPassword}
      />
    );
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
              <Button onClick={() => setIsSearchDialogOpen(true)} variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                Find Users
              </Button>
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
            <TabsTrigger value="discover" className="gap-2">
              <Users className="w-4 h-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-2">
              Following ({followingIds.length})
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

          <TabsContent value="discover">
            <div className="mb-4">
              <p className="text-slate-600">
                Explore shared design ideas from the community
              </p>
            </div>
            <DesignIdeasList 
              ideas={publicFeed}
              onEdit={() => {}}
              onDelete={() => {}}
              onView={handleViewClick}
              readOnly
            />
          </TabsContent>

          <TabsContent value="following">
            <div className="mb-4">
              <p className="text-slate-600">
                Ideas from people you follow
              </p>
            </div>
            <DesignIdeasList 
              ideas={followingFeed}
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
              onSearchUsers={handleSearchUsers}
              onAddCollaborator={handleAddCollaborator}
              onRemoveCollaborator={handleRemoveCollaborator}
              followingIds={followingIds}
            />
          </DialogContent>
        </Dialog>

        {/* User Search Dialog */}
        <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
          <DialogContent className="max-w-2xl" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Find and Follow Users</DialogTitle>
            </DialogHeader>
            <UserSearch
              onSearch={handleSearchUsers}
              onFollow={handleFollowUser}
              followingIds={followingIds}
            />
          </DialogContent>
        </Dialog>

        {/* View Detail Dialog */}
        <Dialog open={!!viewingIdea} onOpenChange={handleViewDialogClose}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{viewingIdea?.title || 'Design Idea Details'}</DialogTitle>
            </DialogHeader>
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
