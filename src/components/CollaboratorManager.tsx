import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { UserSearch } from './UserSearch';
import { Badge } from './ui/badge';

interface Collaborator {
  id: string;
  name: string;
}

interface CollaboratorManagerProps {
  collaborators: Collaborator[];
  onAdd: (userId: string, userName: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onSearch: (query: string) => Promise<Array<{ id: string; name: string; email: string }>>;
  followingIds: string[];
  disabled?: boolean;
}

export function CollaboratorManager({ 
  collaborators, 
  onAdd, 
  onRemove, 
  onSearch,
  followingIds,
  disabled = false
}: CollaboratorManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCollaborator = async (userId: string) => {
    const results = await onSearch('');
    const user = results.find(u => u.id === userId);
    if (user) {
      await onAdd(userId, user.name);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-slate-700">Collaborators</label>
        {!disabled && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Collaborator</DialogTitle>
              </DialogHeader>
              <UserSearch
                onSearch={onSearch}
                onFollow={handleAddCollaborator}
                followingIds={collaborators.map(c => c.id)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {collaborators.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {collaborators.map((collaborator) => (
            <Badge 
              key={collaborator.id} 
              variant="secondary"
              className="gap-2 pl-3 pr-2 py-1"
            >
              {collaborator.name}
              {!disabled && (
                <button
                  onClick={() => onRemove(collaborator.id)}
                  className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No collaborators</p>
      )}
    </div>
  );
}
