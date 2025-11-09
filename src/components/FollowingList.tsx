import { User, UserMinus } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useLanguage } from '../utils/language-context';

export interface FollowingUser {
  id: string;
  name: string;
  email: string;
  bio: string;
  publicIdeasCount: number;
}

interface FollowingListProps {
  users: FollowingUser[];
  onViewProfile: (userId: string, userName: string) => void;
  onUnfollow: (userId: string) => void;
  isLoading?: boolean;
}

export function FollowingList({ 
  users, 
  onViewProfile, 
  onUnfollow,
  isLoading = false 
}: FollowingListProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="text-center py-12 text-slate-500">
        {t('loading')}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4">
          <User className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-slate-900 mb-2">{t('emptyFollowing')}</h3>
        <p className="text-slate-600">
          {t('emptyFollowingDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <Card key={user.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white">
              <User className="w-8 h-8" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-900 mb-1 truncate">{user.name}</h3>
              {user.bio && (
                <p className="text-slate-600 text-sm line-clamp-2 mb-2">
                  {user.bio}
                </p>
              )}
              <p className="text-slate-500 text-sm">
                {user.publicIdeasCount} {t('publicIdeas').toLowerCase()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onViewProfile(user.id, user.name)}
              >
                {t('viewProfile')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUnfollow(user.id)}
                className="gap-2"
              >
                <UserMinus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
