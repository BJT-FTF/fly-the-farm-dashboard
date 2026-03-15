import React, { useRef } from 'react';
import {
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
  TextField,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import { PhotoRef } from '../types/fieldManagement';

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const QUALITY = 0.7;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

interface PhotoUploadProps {
  photos: PhotoRef[];
  onChange: (photos: PhotoRef[]) => void;
}

export default function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newPhotos: PhotoRef[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const dataUrl = await resizeImage(file);
        newPhotos.push({
          fileName: file.name,
          dataUrl,
          caption: '',
          takenAt: new Date().toISOString(),
          type: 'after',
        });
      } catch {
        // skip failed images
      }
    }
    onChange([...photos, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const updatePhoto = (index: number, updates: Partial<PhotoRef>) => {
    onChange(photos.map((p, i) => i === index ? { ...p, ...updates } : p));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          Photos ({photos.length})
        </Typography>
        <Button
          size="small"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => inputRef.current?.click()}
          sx={{ borderRadius: '8px', fontWeight: 600 }}
        >
          Add Photos
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </Box>

      {photos.length === 0 ? (
        <Box
          onClick={() => inputRef.current?.click()}
          sx={{
            p: 3, borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
            border: `1.5px dashed ${alpha(theme.palette.primary.main, 0.15)}`,
            '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.3), bgcolor: alpha(theme.palette.primary.main, 0.02) },
          }}
        >
          <AddPhotoAlternateIcon sx={{ fontSize: 32, color: alpha(theme.palette.text.secondary, 0.3), mb: 0.5 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            Tap to add before/after photos
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {photos.map((photo, idx) => (
            <Box key={idx} sx={{
              display: 'flex', gap: 1.5, p: 1.5, borderRadius: '10px',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}>
              <Box
                component="img"
                src={photo.dataUrl}
                alt={photo.caption || photo.fileName}
                sx={{
                  width: 80, height: 80, borderRadius: '8px',
                  objectFit: 'cover', flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField
                    select
                    value={photo.type}
                    onChange={(e) => updatePhoto(idx, { type: e.target.value as 'before' | 'after' })}
                    size="small"
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="before">Before</MenuItem>
                    <MenuItem value="after">After</MenuItem>
                  </TextField>
                  <IconButton size="small" onClick={() => removePhoto(idx)} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
                <TextField
                  placeholder="Caption (optional)"
                  value={photo.caption}
                  onChange={(e) => updatePhoto(idx, { caption: e.target.value })}
                  size="small"
                  fullWidth
                />
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
