import { DesignIdea } from '../App';
import { Badge } from './ui/badge';
import { Clock, Edit } from 'lucide-react';
import { Button } from './ui/button';

interface DesignIdeaDetailProps {
  idea: DesignIdea;
  onEdit: () => void;
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

export function DesignIdeaDetail({ idea, onEdit }: DesignIdeaDetailProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-slate-900 mb-3">{idea.title}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={statusColors[idea.status]}>
              {statusLabels[idea.status]}
            </Badge>
            <Badge variant="outline" className={priorityColors[idea.priority]}>
              {idea.priority.charAt(0).toUpperCase() + idea.priority.slice(1)} Priority
            </Badge>
          </div>
        </div>
        <Button onClick={onEdit} variant="outline" className="gap-2">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </div>

      {/* Images */}
      {idea.images && idea.images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-slate-900">Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {idea.images.map((image, index) => (
              <div key={index} className="aspect-video rounded-lg overflow-hidden bg-slate-100 border">
                <img
                  src={image}
                  alt={`${idea.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {idea.description && (
        <div className="space-y-2">
          <h3 className="text-slate-900">Description</h3>
          <p className="text-slate-600">{idea.description}</p>
        </div>
      )}

      {/* Details */}
      {idea.details && (
        <div className="space-y-2">
          <h3 className="text-slate-900">Details & Notes</h3>
          <p className="text-slate-600 whitespace-pre-wrap">{idea.details}</p>
        </div>
      )}

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-slate-900">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="pt-4 border-t space-y-1">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>Created {formatDate(idea.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>Last updated {formatDate(idea.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
}
