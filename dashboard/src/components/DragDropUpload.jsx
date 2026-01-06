import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useToast } from '../hooks/useToast';

export default function DragDropUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const uploadFile = async (file) => {
    try {
      // Check file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        showToast(`File is ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed is 2MB.`, 'error');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Not authenticated', 'error');
        return;
      }

      setIsUploading(true);

      // Generate filename
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `snipt-${timestamp}.png`;
      const filePath = `${user.id}/${filename}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('screenshots')
        .upload(filePath, file, {
          contentType: file.type || 'image/png',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Generate signed URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from('screenshots')
        .createSignedUrl(filePath, 60 * 60 * 24 * 7);

      if (signedError) throw signedError;

      // Log metadata in database
      const { error: insertError } = await supabase
        .from('images')
        .insert({
          user_id: user.id,
          path: uploadData.path,
          filename: filename,
          url: signedData.signedUrl
        });

      if (insertError) {
        console.warn('Failed to log metadata:', insertError);
      }

      showToast('File uploaded successfully!', 'success');
      onUploadSuccess?.();
    } catch (err) {
      console.error('Upload failed:', err);
      showToast(err.message || 'Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    for (let file of files) {
      if (file.type.startsWith('image/')) {
        await uploadFile(file);
      } else {
        showToast('Please drop image files only', 'warning');
      }
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    for (let file of files) {
      await uploadFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-4 text-center transition
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
      `}
    >
      <div className="flex items-center justify-center gap-4">
        <div className="text-2xl">📸</div>
        <div className="text-left">
          <p className="text-gray-700 font-medium text-sm">Drag images here or</p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Select Files'}
          </label>
        </div>
      </div>
    </div>
  );
}
