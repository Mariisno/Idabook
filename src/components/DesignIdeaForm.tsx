import { useState, useRef } from 'react';
import { DesignIdea } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { CollaboratorManager } from './CollaboratorManager';
import { useLanguage } from '../utils/language-context';

interface DesignIdeaFormProps {
  idea?: DesignIdea | null;
  onSubmit: (data: Omit<DesignIdea, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  onSearchUsers?: (query: string) => Promise<Array<{ id: string; name: string; email: string }>>;
  onAddCollaborator?: (ideaId: string, userId: string, userName: string) => Promise<void>;
  onRemoveCollaborator?: (ideaId: string, userId: string) => Promise<void>;
  followingIds?: string[];
}

export function DesignIdeaForm({ 
  idea, 
  onSubmit, 
  onCancel,
  onSearchUsers,
  onAddCollaborator,
  onRemoveCollaborator,
  followingIds = []
}: DesignIdeaFormProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState(idea?.title || '');
  const [description, setDescription] = useState(idea?.description || '');
  const [details, setDetails] = useState(idea?.details || '');
  const [websiteUrl, setWebsiteUrl] = useState(idea?.websiteUrl || '');
  const [tags, setTags] = useState<string[]>(idea?.tags || []);
  const [images, setImages] = useState<string[]>(idea?.images || []);
  const [tagInput, setTagInput] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(idea?.priority || 'medium');
  const [status, setStatus] = useState<'idea' | 'in-progress' | 'completed' | 'archived'>(idea?.status || 'idea');
  const [isShared, setIsShared] = useState(idea?.isShared || false);
  const [collaborators, setCollaborators] = useState(idea?.collaborators || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      details: details.trim(),
      websiteUrl: websiteUrl.trim(),
      tags,
      images,
      priority,
      status,
      isShared,
      ownerId: idea?.ownerId || '',
      ownerName: idea?.ownerName || '',
      collaborators,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">{t('title')} *</Label>
        <Input
          id="title"
          placeholder={t('titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          placeholder={t('descriptionPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      {/* Details */}
      <div className="space-y-2">
        <Label htmlFor="details">{t('details')}</Label>
        <Textarea
          id="details"
          placeholder={t('detailsPlaceholder')}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={6}
        />
      </div>

      {/* Website URL */}
      <div className="space-y-2">
        <Label htmlFor="websiteUrl">{t('websiteUrl')}</Label>
        <Input
          id="websiteUrl"
          type="url"
          placeholder={t('websiteUrlPlaceholder')}
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
        />
      </div>

      {/* Priority and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">{t('priority')}</Label>
          <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t('low')}</SelectItem>
              <SelectItem value="medium">{t('medium')}</SelectItem>
              <SelectItem value="high">{t('high')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{t('status')}</Label>
          <Select value={status} onValueChange={(value: any) => setStatus(value)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idea">{t('idea')}</SelectItem>
              <SelectItem value="in-progress">{t('inProgress')}</SelectItem>
              <SelectItem value="completed">{t('completed')}</SelectItem>
              <SelectItem value="archived">{t('archived')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sharing */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
        <div className="flex-1">
          <Label htmlFor="isShared" className="cursor-pointer">{t('shareIdea')}</Label>
          <p className="text-sm text-slate-600 mt-1">
            {t('shareDescription')}
          </p>
        </div>
        <Switch
          id="isShared"
          checked={isShared}
          onCheckedChange={setIsShared}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">{t('tags')}</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            placeholder={t('tagsPlaceholder')}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            {t('add')}
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Images */}
      <div className="space-y-2">
        <Label>{t('images')}</Label>
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2"
          >
            <Upload className="w-4 h-4" />
            {t('images')}
          </Button>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-slate-50">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg bg-slate-50">
              <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-slate-500 text-sm">{t('images')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collaborators */}
      {onSearchUsers && onAddCollaborator && onRemoveCollaborator && idea && (
        <CollaboratorManager
          collaborators={collaborators}
          onAdd={async (userId, userName) => {
            await onAddCollaborator(idea.id, userId, userName);
            setCollaborators([...collaborators, { id: userId, name: userName }]);
          }}
          onRemove={async (userId) => {
            await onRemoveCollaborator(idea.id, userId);
            setCollaborators(collaborators.filter(c => c.id !== userId));
          }}
          onSearch={onSearchUsers}
          followingIds={followingIds}
        />
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit">
          {idea ? t('save') : t('newIdea')}
        </Button>
      </div>
    </form>
  );
}
