import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Plus, Loader } from 'lucide-react';

interface Track {
  id: string;
  name: string;
  program_id: string;
  status: string;
  description?: string;
}

export function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    program_id: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getTracks();
      setTracks(response.data.data);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createTrack(formData);
      setFormData({ program_id: '', name: '', description: '' });
      setShowForm(false);
      await loadTracks();
    } catch (error) {
      console.error('Failed to create track:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tracks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Track
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Create New Track</h2>
          
          <div>
            <label className="label">Track Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-24"
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary">Create Track</button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tracks.map((track) => (
            <div key={track.id} className="card">
              <h3 className="font-semibold text-lg mb-2">{track.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{track.description}</p>
              <p className="text-sm mb-4">
                Status: <span className={`font-medium px-2 py-1 rounded text-xs ${
                  track.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>{track.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
