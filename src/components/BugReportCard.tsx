import { MessageSquare, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';

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
  commentCount?: number;
}

interface BugReportCardProps {
  bug: Bug;
  onClick: () => void;
}

export function BugReportCard({ bug, onClick }: BugReportCardProps) {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'open':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'nå nettopp';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min siden`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} timer siden`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dager siden`;
    
    return date.toLocaleDateString('nb-NO', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-900 mb-2 line-clamp-1">{bug.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{bug.description}</p>
          </div>
          <Badge variant="secondary" className={getStatusColor(bug.status)}>
            {getStatusIcon(bug.status)}
            <span className="ml-1 capitalize">{bug.status === 'in-progress' ? 'Under arbeid' : bug.status === 'open' ? 'Åpen' : 'Lukket'}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{bug.reporterName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{formatDate(bug.createdAt)}</span>
          </div>
          {bug.commentCount !== undefined && bug.commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{bug.commentCount}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
