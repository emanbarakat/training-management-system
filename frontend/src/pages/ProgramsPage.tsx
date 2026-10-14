import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Plus, Loader, AlertCircle } from 'lucide-react';

interface Program {
  id: string;
  name: string;
  type: string;
  duration_months: number;
  status: string;
}

export function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'diploma',
    duration_months: 9,
    description: '',
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPrograms();
      setPrograms(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createProgram(formData);
      setFormData({ name: '', type: 'diploma', duration_months: 9, description: '' });
      setShowForm(false);
      await loadPrograms();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create program');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Programs</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Program
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Create New Program</h2>
          
          <div>
            <label className="label">Program Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                <option value="diploma">Diploma</option>
                <option value="short_course">Short Course</option>
                <option value="summer_training">Summer Training</option>
              </select>
            </div>
            <div>
              <label className="label">Duration (Months)</label>
              <input
                type="number"
                min="1"
                value={formData.duration_months}
                onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
                className="input"
              />
            </div>
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
            <button type="submit" className="btn btn-primary">Create Program</button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="card">
              <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Type: <span className="font-medium capitalize">{program.type.replace(/_/g, ' ')}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Duration: <span className="font-medium">{program.duration_months} months</span>
              </p>
              <p className="text-sm mb-4">
                Status: <span className={`font-medium px-2 py-1 rounded text-xs ${
                  program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>{program.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
