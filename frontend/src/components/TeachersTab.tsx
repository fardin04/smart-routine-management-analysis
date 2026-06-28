import { useState, useEffect } from 'react';
import api from '../services/api';
import { Teacher } from '../types';
import { Search, Plus, Edit, Trash2, Check, X, ShieldAlert, BookOpen } from 'lucide-react';

export default function TeachersTab() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [isEditing, setIsEditing] = useState<string | null>(null); // teacher id when editing
  const [formData, setFormData] = useState({ id: '', name: '' });
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/teachers');
      setTeachers(Array.isArray(response?.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download teacher logs.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.id.trim() || !formData.name.trim()) {
      setError('Please provide correct teacher identifiers and names.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/teachers', {
        id: formData.id.trim().toUpperCase(),
        name: formData.name.trim()
      });
      setTeachers([response.data, ...teachers]);
      setFormData({ id: '', name: '' });
      showSuccess(`Teacher profile ${response.data.name} saved successfully.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register the new teacher profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setError(null);
    if (!editName.trim()) {
      setError('Teacher name cannot be blank.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/teachers/${id}`, { name: editName.trim() });
      setTeachers(teachers.map(t => t.id === id ? response.data : t));
      setIsEditing(null);
      setEditName('');
      showSuccess('Teacher metadata modified successfully.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to modify teacher data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove teacher ${name}?`)) {
      return;
    }

    setError(null);
    try {
      setLoading(true);
      await api.delete(`/teachers/${id}`);
      setTeachers(teachers.filter(t => t.id !== id));
      showSuccess('Teacher profile deleted from the database.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete the selected teacher. It may possess active class courses.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up" id="teachers-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Faculty Registry</h2>
          <p className="text-xs text-gray-500 mt-1">Configure registered university lecturers, assistants, and professors.</p>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded shadow-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-xs rounded shadow-sm flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            Add Faculty Member
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Teacher ID / Initials</label>
              <input
                type="text"
                placeholder="e.g. CSE-MBH"
                value={formData.id}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Dr. Mohammad Badrul Hasan"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2C4A6F] text-white text-xs py-2.5 px-4 rounded hover:bg-[#1B324F] transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Register Profile
            </button>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Registered Faculty ({filteredTeachers.length})</span>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 w-44 md:w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-100 uppercase text-[10px] tracking-wider text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Teacher ID</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && teachers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-gray-400">Loading catalog...</td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-gray-400">No faculty records found.</td>
                  </tr>
                ) : (
                  filteredTeachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-mono font-semibold text-gray-700">{teacher.id}</td>
                      <td className="py-3.5 px-4">
                        {isEditing === teacher.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="p-1 border border-sky-500 rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 w-full max-w-sm"
                          />
                        ) : (
                          <span className="text-gray-900 font-medium">{teacher.name}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isEditing === teacher.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleUpdate(teacher.id)}
                              className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded"
                              title="Save changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(null);
                                setEditName('');
                              }}
                              className="p-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setIsEditing(teacher.id);
                                setEditName(teacher.name);
                              }}
                              className="p-1 text-[#2C4A6F] hover:bg-slate-100 rounded"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(teacher.id, teacher.name)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
