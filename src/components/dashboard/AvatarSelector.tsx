import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, User, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import default avatars
import avatar1 from '@/assets/avatar-1.png';
import avatar2 from '@/assets/avatar-2.png';
import avatar3 from '@/assets/avatar-3.png';
import avatar4 from '@/assets/avatar-4.png';

interface AvatarSelectorProps {
  currentAvatarUrl?: string;
  userId: string;
  onAvatarUpdate: (url: string) => void;
}

const DEFAULT_AVATARS = [
  { id: 'avatar-1', url: avatar1, name: 'Professional Blue' },
  { id: 'avatar-2', url: avatar2, name: 'Friendly Green' },
  { id: 'avatar-3', url: avatar3, name: 'Creative Purple' },
  { id: 'avatar-4', url: avatar4, name: 'Warm Orange' }
];

export function AvatarSelector({ currentAvatarUrl, userId, onAvatarUpdate }: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatarUrl || '');
  const [uploading, setUploading] = useState(false);

  const handleDefaultAvatarSelect = async (avatarUrl: string) => {
    try {
      setSelectedAvatar(avatarUrl);
      
      // Update profile with selected avatar
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', userId);

      if (error) throw error;

      onAvatarUpdate(avatarUrl);
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete existing file if it exists
      await supabase.storage
        .from('avatars')
        .remove([fileName]);

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = data.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      setSelectedAvatar(publicUrl);
      onAvatarUpdate(publicUrl);
      toast.success('Avatar uploaded successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Profile Picture</Label>
            <p className="text-sm text-muted-foreground">
              Choose a default avatar or upload your own image
            </p>
          </div>

          {/* Current Avatar Preview */}
          <div className="flex justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={selectedAvatar} alt="Profile picture" />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Default Avatars */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Choose from defaults</Label>
            <div className="grid grid-cols-4 gap-3">
              {DEFAULT_AVATARS.map((avatar) => (
                <div
                  key={avatar.id}
                  className="relative group cursor-pointer"
                  onClick={() => handleDefaultAvatarSelect(avatar.url)}
                >
                  <div className={`relative rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedAvatar === avatar.url 
                      ? 'border-primary shadow-md' 
                      : 'border-muted hover:border-primary/50'
                  }`}>
                    <img 
                      src={avatar.url} 
                      alt={avatar.name}
                      className="w-full aspect-square object-cover"
                    />
                    {selectedAvatar === avatar.url && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <Check className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center mt-1 text-muted-foreground">
                    {avatar.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Custom Avatar */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Or upload your own</Label>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="avatar-upload"
              />
              <Button
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={uploading}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum file size: 2MB. Accepted formats: JPG, PNG, WebP
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}