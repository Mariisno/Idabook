import { DesignIdea } from '../App';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Clock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface DesignIdeaCardProps {
  idea: DesignIdea;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  readOnly?: boolean;
}

const priorityColors = {
  low: 'bg-slate-100 text-slate-700 border-slate-300',
  medium: 'bg-blue-100 text-blue-700 border-blue-300',
  high: 'bg-red-100 text-red-700 border-red-300',
};

const statusColors = {
  idea: 'bg-purple-100 text-purple-700 border-purple-300',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
  archived: 'bg-slate-100 text-slate-600 border-slate-300',
};

const statusLabels = {
  idea: 'Idea',
  'in-progress': 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};

export function DesignIdeaCard({ idea, onEdit, onDelete, onView, readOnly = false }: DesignIdeaCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={onView}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-slate-900 truncate">{idea.title}</h3>
          </div>
          {!readOnly && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete "{idea.title}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className={statusColors[idea.status]}>
            {statusLabels[idea.status]}
          </Badge>
          <Badge variant="outline" className={priorityColors[idea.priority]}>
            {idea.priority.charAt(0).toUpperCase() + idea.priority.slice(1)}
          </Badge>
          {idea.isShared && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              Shared
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Images */}
        {idea.images && idea.images.length > 0 && (
          <div className="mb-3">
            {idea.images.length === 1 ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={idea.images[0]}
                  alt={idea.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {idea.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative">
                    <img
                      src={image}
                      alt={`${idea.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 3 && idea.images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white">+{idea.images.length - 4}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <p className="text-slate-600 line-clamp-2 mb-3">
          {idea.description}
        </p>
        {idea.details && (
          <p className="text-slate-500 text-sm line-clamp-3">
            {idea.details}
          </p>
        )}
        {idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {idea.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Clock className="w-3.5 h-3.5" />
          <span>Updated {formatDate(idea.updatedAt)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
