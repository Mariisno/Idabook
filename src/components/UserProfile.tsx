import { useState, useEffect } from 'react';
import { User, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { DesignIdeasList } from './DesignIdeasList';
import { DesignIdea } from '../App';
import { useLanguage } from '../utils/language-context';

interface UserProfileProps {
  userId: string;
  userName: string;
  projectId: string;
  publicAnonKey: string;
  accessToken?: string | null;
  onBack: () => void;
  onViewIdea: (idea: DesignIdea) => void;
}

export function UserProfile({ 
  userId, 
  userName, 
  projectId, 
  publicAnonKey, 
  accessToken,
  onBack,
  onViewIdea
}: UserProfileProps) {
  const { t } = useLanguage();
  const [ideas, setIdeas] = useState<DesignIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserIdeas();
  }, [userId]);

  const loadUserIdeas = async () => {
    try {
      setIsLoading(true);
      const authToken = accessToken || publicAnonKey;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8b6272cb/users/${userId}/ideas`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas || []);
      } else {
        console.error('Failed to load user ideas:', await response.text());
      }
    } catch (error) {
      console.error('Error loading user ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToSearch')}
        </Button>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4 p-6 bg-white rounded-lg border border-slate-200">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-slate-900">{userName}</h2>
          <p className="text-slate-600">
            {ideas.length} {t('publicIdeas').toLowerCase()}
          </p>
        </div>
      </div>

      {/* User Ideas */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">
          {t('loading')}
        </div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-slate-900 mb-2">{t('noPublicIdeas')}</h3>
          <p className="text-slate-600">
            {t('noPublicIdeasDescription')}
          </p>
        </div>
      ) : (
        <DesignIdeasList 
          ideas={ideas}
          onEdit={() => {}}
          onDelete={() => {}}
          onView={onViewIdea}
          readOnly
          emptyStateType="discover"
        />
      )}
    </div>
  );
}
