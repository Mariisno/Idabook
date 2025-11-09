import { DesignIdea } from '../App';
import { DesignIdeaCard } from './DesignIdeaCard';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Lightbulb, Share2, Users } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../utils/language-context';

interface DesignIdeasListProps {
  ideas: DesignIdea[];
  onEdit: (idea: DesignIdea) => void;
  onDelete: (id: string) => void;
  onView: (idea: DesignIdea) => void;
  readOnly?: boolean;
  emptyStateType?: 'my-ideas' | 'discover' | 'following';
}

export function DesignIdeasList({ 
  ideas, 
  onEdit, 
  onDelete, 
  onView, 
  readOnly = false,
  emptyStateType = 'my-ideas'
}: DesignIdeasListProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || idea.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getEmptyState = () => {
    if (emptyStateType === 'discover') {
      return {
        icon: <Share2 className="w-8 h-8 text-slate-400" />,
        title: t('emptyDiscover'),
        description: t('emptyDiscoverDescription')
      };
    }
    if (emptyStateType === 'following') {
      return {
        icon: <Users className="w-8 h-8 text-slate-400" />,
        title: t('emptyFollowing'),
        description: t('emptyFollowingDescription')
      };
    }
    return {
      icon: <Lightbulb className="w-8 h-8 text-slate-400" />,
      title: t('emptyMyIdeas'),
      description: t('emptyMyIdeasDescription')
    };
  };

  if (ideas.length === 0) {
    const emptyState = getEmptyState();
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4">
          {emptyState.icon}
        </div>
        <h3 className="text-slate-900 mb-2">{emptyState.title}</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          {emptyState.description}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t('searchIdeas')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="idea">{t('idea')}</SelectItem>
            <SelectItem value="in-progress">{t('inProgress')}</SelectItem>
            <SelectItem value="completed">{t('completed')}</SelectItem>
            <SelectItem value="archived">{t('archived')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('priority')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allPriority')}</SelectItem>
            <SelectItem value="high">{t('high')}</SelectItem>
            <SelectItem value="medium">{t('medium')}</SelectItem>
            <SelectItem value="low">{t('low')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-600">{t('noMatchingIdeas')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map(idea => (
            <DesignIdeaCard
              key={idea.id}
              idea={idea}
              onEdit={() => onEdit(idea)}
              onDelete={() => onDelete(idea.id)}
              onView={() => onView(idea)}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
