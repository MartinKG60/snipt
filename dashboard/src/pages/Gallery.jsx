import React, { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export default function Gallery() {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const fetchScreenshots = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('screenshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScreenshots(data || []);
    } catch (err) {
      console.error('Error fetching screenshots:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Screenshots</h1>
      
      {screenshots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No screenshots yet. Capture some with the Snipt app!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {screenshots.map((screenshot) => (
            <div key={screenshot.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
              <img 
                src={screenshot.image_url} 
                alt="Screenshot" 
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <p className="text-sm text-gray-600">
                  {new Date(screenshot.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
