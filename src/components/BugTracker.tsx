import { useState, useEffect } from 'react';
import { Bug, Plus, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BugReportCard } from './BugReportCard';
import { BugDetail } from './BugDetail';
import { ScrollArea } from './ui/scroll-area';

interface BugType {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'in-progress';
  reportedBy: string;
  reporterName: string;
  reporterEmail?: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

interface Comment {
  id: string;
  bugId: string;
  text: string;
  userId: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
}

interface BugTrackerProps {
  projectId: string;
  publicAnonKey: string;
  accessToken?: string;
  user?: any;
}

export function BugTracker({ projectId, publicAnonKey, accessToken, user }: BugTrackerProps) {
  const [bugs, setBugs] = useState<BugType[]>([]);
  const [selectedBug, setSelectedBug] = useState<BugType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isBugListOpen, setIsBugListOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isBugDetailOpen, setIsBugDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed' | 'in-progress'>('all');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    loadBugs();
  }, []);

  const loadBugs = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/bugs`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Load comment counts for each bug
        const bugsWithComments = await Promise.all(
          data.bugs.map(async (bug: BugType) => {
            const commentsResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/bugs/${bug.id}/comments`,
              {
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                },
              }
            );
            
            if (commentsResponse.ok) {
              const commentsData = await commentsResponse.json();
              return { ...bug, commentCount: commentsData.comments.length };
            }
            return bug;
          })
        );
        
        setBugs(bugsWithComments);
      }
    } catch (error) {
      console.error('Failed to load bugs:', error);
    }
  };

  const loadComments = async (bugId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/bugs/${bugId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmitBug = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user && (!guestName.trim() || !guestEmail.trim())) {
      alert('Vennligst fyll ut navn og e-post');
      return;
    }

    setIsSubmitting(true);
    try {
      const authToken = accessToken || publicAnonKey;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/bugs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            description,
            userInfo: {
              name: user ? user.user_metadata?.name || user.email : guestName,
              email: user ? user.email : guestEmail,
            },
          }),
        }
      );

      if (response.ok) {
        setTitle('');
        setDescription('');
        setGuestName('');
        setGuestEmail('');
        setIsReportDialogOpen(false);
        await loadBugs();
      } else {
        const error = await response.text();
        alert('Feil ved rapportering av bug: ' + error);
      }
    } catch (error) {
      console.error('Failed to submit bug:', error);
      alert('Kunne ikke rapportere bug');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBugClick = async (bug: BugType) => {
    setSelectedBug(bug);
    setIsBugDetailOpen(true);
    await loadComments(bug.id);
  };

  const handleAddComment = async (text: string, userInfo: { name: string; email: string }) => {
    if (!selectedBug) return;

    try {
      const authToken = accessToken || publicAnonKey;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/bugs/${selectedBug.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            userInfo: user ? {
              name: user.user_metadata?.name || user.email,
              email: user.email,
            } : userInfo,
          }),
        }
      );

      if (response.ok) {
        await loadComments(selectedBug.id);
        await loadBugs(); // Reload to update comment count
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  const filteredBugs = statusFilter === 'all' 
    ? bugs 
    : bugs.filter(bug => bug.status === statusFilter);

  return (
    <>
      <Button
        onClick={() => setIsBugListOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Bug className="w-4 h-4" />
        Bugs
      </Button>

      {/* Bug List Dialog */}
      <Dialog open={isBugListOpen} onOpenChange={setIsBugListOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Bug Tracker</span>
              <Button
                onClick={() => {
                  setIsBugListOpen(false);
                  setIsReportDialogOpen(true);
                }}
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Rapporter Bug
              </Button>
            </DialogTitle>
            <DialogDescription>
              Se og rapporter bugs i applikasjonen
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setStatusFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Alle ({bugs.length})
              </TabsTrigger>
              <TabsTrigger value="open">
                Åpne ({bugs.filter(b => b.status === 'open').length})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                Under arbeid ({bugs.filter(b => b.status === 'in-progress').length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Lukkede ({bugs.filter(b => b.status === 'closed').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[50vh]">
                {filteredBugs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Bug className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Ingen bugs funnet</p>
                    <Button
                      onClick={() => {
                        setIsBugListOpen(false);
                        setIsReportDialogOpen(true);
                      }}
                      variant="outline"
                      className="mt-4"
                    >
                      Rapporter en bug
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {filteredBugs.map((bug) => (
                      <BugReportCard
                        key={bug.id}
                        bug={bug}
                        onClick={() => {
                          setIsBugListOpen(false);
                          handleBugClick(bug);
                        }}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="open" className="mt-4">
              <ScrollArea className="h-[50vh]">
                {filteredBugs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Bug className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Ingen åpne bugs</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {filteredBugs.map((bug) => (
                      <BugReportCard
                        key={bug.id}
                        bug={bug}
                        onClick={() => {
                          setIsBugListOpen(false);
                          handleBugClick(bug);
                        }}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="in-progress" className="mt-4">
              <ScrollArea className="h-[50vh]">
                {filteredBugs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Bug className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Ingen bugs under arbeid</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {filteredBugs.map((bug) => (
                      <BugReportCard
                        key={bug.id}
                        bug={bug}
                        onClick={() => {
                          setIsBugListOpen(false);
                          handleBugClick(bug);
                        }}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="closed" className="mt-4">
              <ScrollArea className="h-[50vh]">
                {filteredBugs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Bug className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Ingen lukkede bugs</p>
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {filteredBugs.map((bug) => (
                      <BugReportCard
                        key={bug.id}
                        bug={bug}
                        onClick={() => {
                          setIsBugListOpen(false);
                          handleBugClick(bug);
                        }}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Report Bug Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rapporter en Bug</DialogTitle>
            <DialogDescription>
              Beskriv problemet du har funnet så detaljert som mulig
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitBug} className="space-y-4">
            {!user && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporterName">Ditt navn *</Label>
                  <Input
                    id="reporterName"
                    placeholder="Navn"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required={!user}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporterEmail">Din e-post *</Label>
                  <Input
                    id="reporterEmail"
                    type="email"
                    placeholder="E-post"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    required={!user}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="bugTitle">Tittel *</Label>
              <Input
                id="bugTitle"
                placeholder="Kort beskrivelse av problemet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bugDescription">Beskrivelse *</Label>
              <Textarea
                id="bugDescription"
                placeholder="Detaljert beskrivelse av buggen, inkludert hvordan man reproduserer den..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReportDialogOpen(false)}
              >
                Avbryt
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sender...' : 'Send rapport'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bug Detail Dialog */}
      <Dialog open={isBugDetailOpen} onOpenChange={setIsBugDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]" aria-describedby={undefined}>
          {selectedBug && (
            <BugDetail
              bug={selectedBug}
              comments={comments}
              onAddComment={handleAddComment}
              isLoggedIn={!!user}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
