import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';
import ImageLightbox from '../components/ImageLightbox';
import DragDropUpload from '../components/DragDropUpload';

export default function Gallery() {
  const [screenshots, setScreenshots] = useState([]);
  const [filteredScreenshots, setFilteredScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetchScreenshots();
  }, []);

  // Update filtered screenshots when search query or screenshots change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredScreenshots(screenshots);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = screenshots.filter(
        (s) =>
          s.filename.toLowerCase().includes(query) ||
          new Date(s.created_at).toLocaleDateString().includes(query)
      );
      setFilteredScreenshots(filtered);
    }
  }, [searchQuery, screenshots]);

  const fetchScreenshots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Generate fresh signed URLs for each image
      const imagesWithUrls = await Promise.all(
        (data || []).map(async (img) => {
          const { data: signedData } = await supabase.storage
            .from('screenshots')
            .createSignedUrl(img.path, 60 * 60 * 24 * 7); // 7 days

          return {
            ...img,
            url: signedData?.signedUrl || img.url
          };
        })
      );

      setScreenshots(imagesWithUrls);
    } catch (err) {
      console.error('Error fetching screenshots:', err.message);
      showToast('Failed to load screenshots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (url, filename) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    } catch (err) {
      console.error('Failed to copy link:', err);
      showToast('Failed to copy link', 'error');
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      showToast('Download started!', 'success');
    } catch (err) {
      console.error('Failed to download:', err);
      showToast('Failed to download', 'error');
    }
  };

  const handleDelete = async (imageId, path) => {
    if (!window.confirm('Are you sure you want to delete this screenshot?')) {
      return;
    }

    setDeleting(imageId);
    try {
      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('screenshots')
        .remove([path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Update local state
      setScreenshots(screenshots.filter(s => s.id !== imageId));
      showToast('Screenshot deleted', 'success');
    } catch (err) {
      console.error('Failed to delete screenshot:', err);
      showToast('Failed to delete screenshot', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    const count = selectedIds.size;
    if (!window.confirm(`Delete ${count} screenshot${count > 1 ? 's' : ''}?`)) {
      return;
    }

    try {
      const selectedArray = Array.from(selectedIds);
      const pathsToDelete = screenshots
        .filter(s => selectedArray.includes(s.id))
        .map(s => s.path);

      // Delete from storage
      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('screenshots')
          .remove(pathsToDelete);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .in('id', selectedArray);

      if (dbError) throw dbError;

      setScreenshots(screenshots.filter(s => !selectedArray.includes(s.id)));
      setSelectedIds(new Set());
      showToast(`Deleted ${count} screenshot${count > 1 ? 's' : ''}`, 'success');
    } catch (err) {
      console.error('Failed to delete screenshots:', err);
      showToast('Failed to delete screenshots', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredScreenshots.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredScreenshots.map(s => s.id)));
    }
  };

  const toggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <ImageLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />

      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Your Screenshots</h1>

        {screenshots.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by filename or date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />

            {/* Upload Area */}
            <DragDropUpload onUploadSuccess={fetchScreenshots} />

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between bg-blue-100 p-4 rounded-lg border-2 border-blue-400">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredScreenshots.length}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-base font-semibold text-gray-900">
                    {selectedIds.size} selected
                  </span>
                </div>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold"
                >
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        )}

        {filteredScreenshots.length === 0 && screenshots.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-6">No screenshots yet. Capture some with the Snipt app!</p>
            <DragDropUpload onUploadSuccess={fetchScreenshots} />
          </div>
        ) : filteredScreenshots.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No screenshots match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScreenshots.map((screenshot) => (
              <div key={screenshot.id} className="relative border rounded-lg overflow-hidden hover:shadow-lg transition bg-white">
                {/* Checkbox */}
                <div className="absolute top-2 left-2 z-10 bg-white rounded p-1 shadow-md flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(screenshot.id)}
                    onChange={() => toggleSelect(screenshot.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                {/* Image */}
                <img
                  src={screenshot.url}
                  alt={screenshot.filename || "Screenshot"}
                  onClick={() => setSelectedImage(screenshot)}
                  className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition"
                />

                {/* Info */}
                <div className="p-3 space-y-3">
                  <div>
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {screenshot.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(screenshot.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyLink(screenshot.url, screenshot.filename)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                      title="Copy shareable link"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleDownload(screenshot.url, screenshot.filename)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                      title="Download original image"
                    >
                      Download
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(screenshot.id, screenshot.path)}
                    disabled={deleting === screenshot.id}
                    className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {deleting === screenshot.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
