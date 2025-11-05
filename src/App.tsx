import { useState, useEffect } from 'react';
import { DesignIdeasList } from './components/DesignIdeasList';
import { DesignIdeaForm } from './components/DesignIdeaForm';
import { DesignIdeaDetail } from './components/DesignIdeaDetail';
import { Button } from './components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';

export interface DesignIdea {
  id: string;
  title: string;
  description: string;
  details: string;
  tags: string[];
  images: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'idea' | 'in-progress' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export default function App() {
  const [ideas, setIdeas] = useState<DesignIdea[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<DesignIdea | null>(null);
  const [viewingIdea, setViewingIdea] = useState<DesignIdea | null>(null);

  // Load ideas from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('designIdeas');
    if (stored) {
      setIdeas(JSON.parse(stored));
    }
  }, []);

  // Save ideas to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('designIdeas', JSON.stringify(ideas));
  }, [ideas]);

  const handleAddIdea = (idea: Omit<DesignIdea, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIdea: DesignIdea = {
      ...idea,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setIdeas([newIdea, ...ideas]);
    setIsDialogOpen(false);
  };

  const handleUpdateIdea = (id: string, updates: Omit<DesignIdea, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIdeas(ideas.map(idea => 
      idea.id === id 
        ? { ...idea, ...updates, updatedAt: new Date().toISOString() }
        : idea
    ));
    setEditingIdea(null);
    setIsDialogOpen(false);
  };

  const handleDeleteIdea = (id: string) => {
    setIdeas(ideas.filter(idea => idea.id !== id));
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
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Idea
            </Button>
          </div>
        </div>

        {/* Ideas List */}
        <DesignIdeasList 
          ideas={ideas}
          onEdit={handleEditClick}
          onDelete={handleDeleteIdea}
          onView={handleViewClick}
        />

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
