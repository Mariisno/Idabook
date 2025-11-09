import { useState } from 'react';
import { Search, UserPlus, UserCheck, User as UserIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { useLanguage } from '../utils/language-context';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserSearchProps {
  onSearch: (query: string) => Promise<User[]>;
  onFollow: (userId: string) => Promise<void>;
  onViewProfile?: (userId: string, userName: string) => void;
  followingIds: string[];
}

export function UserSearch({ onSearch, onFollow, onViewProfile, followingIds }: UserSearchProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await onSearch(searchQuery);
      setResults(users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await onFollow(userId);
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder={t('searchUserPlaceholder')}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isSearching && (
        <div className="text-center py-8 text-slate-500">
          {t('searching')}
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {results.map((user) => {
              const isFollowing = followingIds.includes(user.id);
              
              return (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div 
                        className="flex-1 min-w-0 cursor-pointer hover:bg-slate-50 rounded -m-2 p-2 transition-colors"
                        onClick={() => onViewProfile?.(user.id, user.name)}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 truncate">{user.name}</p>
                            <p className="text-sm text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isFollowing ? "outline" : "default"}
                        onClick={() => handleFollow(user.id)}
                        className="gap-2 shrink-0"
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4" />
                            {t('unfollow')}
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            {t('follow')}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {!isSearching && query.length >= 2 && results.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          {t('noUsersFound')}
        </div>
      )}

      {query.length < 2 && (
        <div className="text-center py-8 text-slate-500">
          {t('typeToSearch')}
        </div>
      )}
    </div>
  );
}
