import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status: string;
  enrollmentDate?: string;
}

interface Program {
  id: string;
  name: string;
}

interface Track {
  id: string;
  name: string;
  program_id: string;
}

export function StudentsPage() {
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    loadPrograms();
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      loadTracks(selectedProgram);
    }
  }, [selectedProgram]);

  const loadPrograms = async () => {
    try {
      const response = await apiClient.getPrograms();
      setPrograms(response.data.data);
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  const loadTracks = async (programId: string) => {
    try {
      const response = await apiClient.getTracks(1, 100, programId);
      setTracks(response.data.data);
    } catch (error) {
      console.error('Failed to load tracks:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getStudents(1, 20, selectedTrack || undefined);
      setStudents(response.data.data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile || !selectedProgram || !selectedTrack) {
      alert('Please select a file, program, and track');
      return;
    }

    setImportLoading(true);
    try {
      const response = await apiClient.importStudents(importFile, selectedProgram, selectedTrack);
      setImportResult(response.data.data);
      loadStudents(); // Refresh list
    } catch (error: any) {
      alert('Import failed: ' + error.response?.data?.error?.message || error.message);
    } finally {
      setImportLoading(false);
    }
  };

  const canImport = user?.role === 'student_affairs' || user?.role === 'admin';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Students Management</h1>

      {canImport && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Bulk Import Students</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Program</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Track</label>
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                disabled={!selectedProgram}
              >
                <option value="">Select Track</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={importLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {importLoading ? 'Importing...' : 'Import Students'}
          </button>

          {importResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800">Import Results</h3>
              <p className="text-green-700">
                Imported: {importResult.imported}, Failed: {importResult.failed}
              </p>
              {importResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">View Errors</summary>
                  <ul className="mt-2 text-sm text-red-600">
                    {importResult.errors.map((error: any, index: number) => (
                      <li key={index}>
                        Row {index + 1}: {error.error}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Students List</h2>
          <div className="mt-4 flex gap-4">
            <select
              value={selectedTrack}
              onChange={(e) => {
                setSelectedTrack(e.target.value);
                loadStudents();
              }}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">All Tracks</option>
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Phone</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Enrollment Date</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="py-2">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="py-2">{student.email}</td>
                      <td className="py-2">{student.phone || '-'}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            student.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-2">
                        {student.enrollmentDate
                          ? new Date(student.enrollmentDate).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}