import { useState, useEffect, useRef } from 'react';
import { DesignIdeasList } from './components/DesignIdeasList';
import { DesignIdeaForm } from './components/DesignIdeaForm';
import { DesignIdeaDetail } from './components/DesignIdeaDetail';
import { AuthForm } from './components/AuthForm';
import { UserSearch } from './components/UserSearch';
import { UserProfile } from './components/UserProfile';
import { FollowingList, FollowingUser } from './components/FollowingList';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BugTracker } from './components/BugTracker';
import { LanguageSelector } from './components/LanguageSelector';
import { Button } from './components/ui/button';
import { Plus, LogOut, Users, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { createClient, setSessionPersistence } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { LanguageProvider, useLanguage } from './utils/language-context';

export interface DesignIdea {
  id: string;
  title: string;
  description: string;
  details: string;
  tags: string[];
  images: string[];
  websiteUrl?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'idea' | 'in-progress' | 'completed' | 'archived';
  isShared: boolean;
  ownerId: string;
  ownerName: string;
  collaborators: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
}

function AppContent() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userIdeas, setUserIdeas] = useState<DesignIdea[]>([]);
  const [sharedIdeas, setSharedIdeas] = useState<DesignIdea[]>([]);
  const [followingFeed, setFollowingFeed] = useState<DesignIdea[]>([]);
  const [publicFeed, setPublicFeed] = useState<DesignIdea[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followingUsers, setFollowingUsers] = useState<FollowingUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<{ userId: string; userName: string } | null>(null);
  const [editingIdea, setEditingIdea] = useState<DesignIdea | null>(null);
  const [viewingIdea, setViewingIdea] = useState<DesignIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
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
        
        // Check if this is a new user (first login)
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
          setShowWelcome(true);
          localStorage.setItem('hasSeenWelcome', 'true');
        }
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

      // Also load detailed following users
      const detailsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/following/details`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (detailsResponse.ok) {
        const detailsData = await detailsResponse.json();
        setFollowingUsers(detailsData.users || []);
      }
    } catch (error) {
      console.error('Failed to load following:', error);
    }
  };

  const loadFeeds = async (token: string) => {
    try {
      console.log('Loading feeds...');
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
        console.log('Following feed loaded:', followingData.ideas?.length || 0, 'ideas');
        setFollowingFeed(followingData.ideas || []);
      }

      // Load public feed
      console.log('Fetching public feed from backend...');
      const publicResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/feed/public`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('Public feed response status:', publicResponse.status);
      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        console.log('Public feed response:', publicData);
        console.log('Public feed loaded:', publicData.ideas?.length || 0, 'ideas', publicData.ideas);
        setPublicFeed(publicData.ideas || []);
      } else {
        console.error('Public feed error:', await publicResponse.text());
      }
    } catch (error) {
      console.error('Failed to load feeds:', error);
    }
  };

  const saveIdeas = async (ideas: DesignIdea[]) => {
    if (!accessToken) return;

    try {
      console.log('Saving ideas to backend:', ideas.map(i => ({ id: i.id, title: i.title, isShared: i.isShared })));
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
        console.log('Ideas saved successfully');
        // Check if any ideas are shared and reload feeds
        const hasSharedIdeas = ideas.some(idea => idea.isShared);
        console.log('Has shared ideas:', hasSharedIdeas);
        if (hasSharedIdeas) {
          console.log('Reloading feeds in 300ms...');
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

  // Load public feed for guest users
  useEffect(() => {
    if (!user && !isLoading && isGuestMode) {
      const loadPublicFeedForGuests = async () => {
        try {
          console.log('Loading public feed for guest user...');
          const publicResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/feed/public`,
            {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
              },
            }
          );

          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            console.log('Guest public feed loaded:', publicData.ideas?.length || 0, 'ideas');
            setPublicFeed(publicData.ideas || []);
          } else {
            console.error('Guest public feed error:', await publicResponse.text());
          }
        } catch (error) {
          console.error('Failed to load guest public feed:', error);
        }
      };
      
      loadPublicFeedForGuests();
    }
  }, [user, isLoading, isGuestMode]);

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

    // After signup, log in and show welcome screen
    await handleLogin(email, password, true);
    setShowWelcome(true);
    localStorage.setItem('hasSeenWelcome', 'true');
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
    console.log('Adding new idea with isShared:', newIdea.isShared, newIdea);
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
    // Use publicAnonKey for guests, accessToken for logged in users
    const authToken = accessToken || publicAnonKey;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/users/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
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
    if (!accessToken) {
      const shouldLogin = window.confirm(t('loginPrompt'));
      if (shouldLogin) {
        setIsGuestMode(false);
      }
      return;
    }
    
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
        // Reload following list and feeds
        await loadFollowing(accessToken);
        await loadFeeds(accessToken);
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
    }
  };

  const handleViewProfile = (userId: string, userName: string) => {
    setViewingProfile({ userId, userName });
    setIsProfileDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileDialogOpen(false);
    setViewingProfile(null);
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
        <p className="text-slate-600">{t('loading')}</p>
      </div>
    );
  }

  // Show auth form if not logged in and not in guest mode
  if (!user && !isGuestMode) {
    return (
      <div className="relative">
        <AuthForm onLogin={handleLogin} onSignup={handleSignup} onResetPassword={handleResetPassword} />
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            onClick={() => setIsGuestMode(true)}
            className="gap-2"
          >
            {t('continueAsGuest')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900">🎨 {t('appTitle')}</h1>
              <p className="text-slate-600 mt-2">
                {t('appSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector />
              {user ? (
                <>
                  <BugTracker 
                    projectId={projectId}
                    publicAnonKey={publicAnonKey}
                    accessToken={accessToken}
                    user={user}
                  />
                  <Button onClick={() => setIsSearchDialogOpen(true)} variant="outline" className="gap-2">
                    <Search className="w-4 h-4" />
                    {t('searchUsers')}
                  </Button>
                  <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t('newIdea')}
                  </Button>
                  <Button onClick={handleLogout} variant="outline" className="gap-2">
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  <BugTracker 
                    projectId={projectId}
                    publicAnonKey={publicAnonKey}
                  />
                  <Button onClick={() => setIsSearchDialogOpen(true)} variant="outline" className="gap-2">
                    <Search className="w-4 h-4" />
                    {t('searchUsers')}
                  </Button>
                  <Button 
                    onClick={() => setIsGuestMode(false)}
                    className="gap-2"
                  >
                    {t('loginRegister')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Ideas Tabs */}
        {user ? (
          <Tabs defaultValue="my-ideas" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-ideas">{t('myIdeas')}</TabsTrigger>
              <TabsTrigger value="discover" className="gap-2">
                <Users className="w-4 h-4" />
                {t('discover')}
              </TabsTrigger>
              <TabsTrigger value="following" className="gap-2">
                {t('following')} ({followingIds.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-ideas">
              <DesignIdeasList 
                ideas={userIdeas}
                onEdit={handleEditClick}
                onDelete={handleDeleteIdea}
                onView={handleViewClick}
                emptyStateType="my-ideas"
              />
            </TabsContent>

            <TabsContent value="discover">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-slate-600">
                  {t('discoverDescription')}
                </p>
                {accessToken && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/debug/kv`,
                          {
                            headers: {
                              'Authorization': `Bearer ${accessToken}`,
                            },
                          }
                        );
                        if (response.ok) {
                          const data = await response.json();
                          console.log('=== KV STORE DEBUG ===');
                          console.log(JSON.stringify(data.debug, null, 2));
                          alert('Debug info logged to console (F12)');
                        }
                      } catch (error) {
                        console.error('Debug error:', error);
                      }
                    }}
                  >
                    Debug KV Store
                  </Button>
                )}
              </div>
              <DesignIdeasList 
                ideas={publicFeed}
                onEdit={() => {}}
                onDelete={() => {}}
                onView={handleViewClick}
                readOnly
                emptyStateType="discover"
              />
            </TabsContent>

            <TabsContent value="following">
              <div className="mb-4">
                <p className="text-slate-600">
                  {t('followingDescription')}
                </p>
              </div>
              <FollowingList 
                users={followingUsers}
                onViewProfile={handleViewProfile}
                onUnfollow={handleFollowUser}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Guest view - only show Discover
          <div className="space-y-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-slate-900 mb-2">{t('discover')}</h2>
                <p className="text-slate-600">
                  {t('discoverDescription')}
                </p>
              </div>
            </div>
            <DesignIdeasList 
              ideas={publicFeed}
              onEdit={() => {}}
              onDelete={() => {}}
              onView={handleViewClick}
              readOnly
              emptyStateType="discover"
            />
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>
                {editingIdea ? t('editIdea') : t('newIdeaTitle')}
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
              <DialogTitle>{t('findFollowUsers')}</DialogTitle>
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
              <DialogTitle>{viewingIdea?.title || t('ideaDetails')}</DialogTitle>
            </DialogHeader>
            {viewingIdea && (
              <DesignIdeaDetail 
                idea={viewingIdea} 
                onEdit={() => handleEditClick(viewingIdea)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* User Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={handleCloseProfile}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>{viewingProfile?.userName || t('userProfile')}</DialogTitle>
            </DialogHeader>
            {viewingProfile && (
              <UserProfile 
                userId={viewingProfile.userId}
                userName={viewingProfile.userName}
                projectId={projectId}
                publicAnonKey={publicAnonKey}
                accessToken={accessToken}
                onBack={handleCloseProfile}
                onViewIdea={handleViewClick}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Welcome Screen for New Users */}
      {showWelcome && <WelcomeScreen onClose={() => setShowWelcome(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
