import { supabase } from '../config/supabase';

export const generateFilename = (prefix = 'snipt') => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}-${timestamp}.png`;
};

/**
 * Save screenshot to local clipboard/file (no login needed)
 */
export const saveScreenshotLocally = async (blob) => {
  try {
    // Copy to clipboard
    const item = new ClipboardItem({ 'image/png': blob });
    await navigator.clipboard.write([item]);

    return {
      success: true,
      message: 'Screenshot copied to clipboard',
      type: 'local'
    };
  } catch (error) {
    console.error('Failed to save locally:', error);
    throw error;
  }
};

/**
 * Upload screenshot to Supabase cloud (requires authentication)
 * Throws error if user not authenticated
 */
export const uploadScreenshotToCloud = async (blob) => {
  try {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId) {
      throw { code: 'AUTH_REQUIRED', message: 'Not authenticated' };
    }

    const filename = generateFilename();
    const filePath = `${userId}/${filename}`;

    // Upload to private bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload(filePath, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Generate signed URL (valid 7 days)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('screenshots')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7);

    if (signedError) throw signedError;

    // Log metadata in database
    const { error: insertError } = await supabase
      .from('images')
      .insert({
        user_id: userId,
        path: uploadData.path,
        filename: filename,
        url: signedData.signedUrl
      });

    if (insertError) {
      console.warn('Failed to log metadata:', insertError);
    }

    return {
      success: true,
      path: uploadData.path,
      filename: filename,
      url: signedData.signedUrl,
      shareableLink: signedData.signedUrl,
      type: 'cloud'
    };
  } catch (error) {
    console.error('Cloud upload failed:', error);
    throw error;
  }
};
