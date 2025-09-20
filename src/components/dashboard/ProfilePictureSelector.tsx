import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Camera, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import avatar images
import avatar1 from '@/assets/avatar-1.jpg';
import avatar2 from '@/assets/avatar-2.jpg';
import avatar3 from '@/assets/avatar-3.jpg';
import avatar4 from '@/assets/avatar-4.jpg';

interface ProfilePictureSelectorProps {
  currentAvatarUrl?: string;
  userId: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

const PRESET_AVATARS = [
  { id: 'avatar-1', url: avatar1, name: 'Professional Woman' },
  { id: 'avatar-2', url: avatar2, name: 'Professional Man' },
  { id: 'avatar-3', url: avatar3, name: 'Young Professional' },
  { id: 'avatar-4', url: avatar4, name: 'Diverse Professional' },
];

export function ProfilePictureSelector({ 
  currentAvatarUrl, 
  userId, 
  onAvatarUpdate 
}: ProfilePictureSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handlePresetSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setSelectedAvatar(data.publicUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!selectedAvatar) {
      toast.error('Please select an avatar');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: selectedAvatar })
        .eq('user_id', userId);

      if (error) throw error;

      onAvatarUpdate(selectedAvatar);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Current Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={selectedAvatar} alt="Profile picture" />
            <AvatarFallback>
              <Camera className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Choose from preset avatars or upload your own image
            </p>
          </div>
        </div>

        {/* Preset Avatars */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Choose from preset avatars:</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESET_AVATARS.map((avatar) => (
              <div key={avatar.id} className="text-center">
                <button
                  onClick={() => handlePresetSelect(avatar.url)}
                  className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedAvatar === avatar.url 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === avatar.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </button>
                <p className="text-xs text-muted-foreground mt-1">{avatar.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Or upload your own:</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Button
              variant="outline"
              disabled={uploading}
              className="shrink-0"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, GIF. Max size: 5MB
          </p>
        </div>

        {/* Update Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleUpdateAvatar}
            disabled={updating || !selectedAvatar || selectedAvatar === currentAvatarUrl}
            className="w-full"
          >
            {updating ? 'Updating...' : 'Update Profile Picture'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}