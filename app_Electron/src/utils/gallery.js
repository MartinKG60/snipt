import { supabase } from '../config/supabase';

/**
 * Get all screenshots for current user from Supabase
 */
export const getUserScreenshots = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get images from database
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Generate fresh signed URLs for each image
    const imagesWithUrls = await Promise.all(
      data.map(async (img) => {
        const { data: signedData } = await supabase.storage
          .from('screenshots')
          .createSignedUrl(img.path, 60 * 60 * 24 * 7); // 7 days

        return {
          ...img,
          url: signedData?.signedUrl || img.url
        };
      })
    );

    return imagesWithUrls;
  } catch (error) {
    console.error('Failed to fetch screenshots:', error);
    throw error;
  }
};

/**
 * Delete a screenshot
 */
export const deleteScreenshot = async (imageId, path) => {
  try {
    console.log('Deleting screenshot:', { imageId, path });
    
    // Delete from storage first
    const { error: storageError } = await supabase.storage
      .from('screenshots')
      .remove([path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      throw new Error(`Failed to delete file from storage: ${storageError.message}`);
    }

    console.log('File deleted from storage, now deleting from database...');

    // Delete from database
    const { error: dbError } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      throw new Error(`Failed to delete from database: ${dbError.message}`);
    }

    console.log('Screenshot deleted successfully');
    return true;
  } catch (error) {
    console.error('Failed to delete screenshot:', error);
    throw error;
  }
};
