import { useState, useEffect } from 'react';
import { User, Clock, MessageSquare, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface Bug {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'in-progress';
  reportedBy: string;
  reporterName: string;
  reporterEmail?: string;
  createdAt: string;
  updatedAt: string;
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

interface BugDetailProps {
  bug: Bug;
  comments: Comment[];
  onAddComment: (text: string, userInfo: { name: string; email: string }) => Promise<void>;
  isLoggedIn: boolean;
}

export function BugDetail({ bug, comments, onAddComment, isLoggedIn }: BugDetailProps) {
  const [commentText, setCommentText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'closed':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    if (!isLoggedIn && (!guestName.trim() || !guestEmail.trim())) {
      alert('Vennligst fyll ut navn og e-post');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(commentText, {
        name: guestName || 'Logged in user',
        email: guestEmail || ''
      });
      setCommentText('');
      if (!isLoggedIn) {
        setGuestName('');
        setGuestEmail('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Bug Header */}
      <div className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-slate-900">{bug.title}</h2>
          <Badge variant="secondary" className={getStatusColor(bug.status)}>
            {bug.status === 'in-progress' ? 'Under arbeid' : bug.status === 'open' ? 'Åpen' : 'Lukket'}
          </Badge>
        </div>
        
        <p className="text-slate-600">{bug.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>Rapportert av {bug.reporterName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDate(bug.createdAt)}</span>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Comments Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-slate-600" />
          <h3 className="text-slate-900">Kommentarer ({comments.length})</h3>
        </div>

        <ScrollArea className="flex-1 mb-4 -mx-6 px-6">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Ingen kommentarer ennå. Vær den første til å kommentere!
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-slate-900">{comment.userName}</p>
                        <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-700 ml-10">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t">
          {!isLoggedIn && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="guestName" className="text-xs">Ditt navn</Label>
                <Input
                  id="guestName"
                  placeholder="Navn"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required={!isLoggedIn}
                  size="sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guestEmail" className="text-xs">Din e-post</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="E-post"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required={!isLoggedIn}
                  size="sm"
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Skriv en kommentar..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 min-h-[80px]"
              required
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={isSubmitting}
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
