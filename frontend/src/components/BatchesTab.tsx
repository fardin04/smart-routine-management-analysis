import { useState, useEffect } from 'react';
import api from '../services/api';
import { type Batch } from '../types';
import { Search, Plus, Edit, Trash2, Check, X, ShieldAlert, Users } from 'lucide-react';

export default function BatchesTab() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState({ batchNumber: '', section: '', studentCount: '' });
  const [editData, setEditData] = useState({ batchNumber: '', section: '', studentCount: '' });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/batches');
      setBatches(Array.isArray(response?.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download academic cohort registers.');
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
    const { batchNumber, section, studentCount } = formData;

    if (!batchNumber.trim() || !section.trim() || !studentCount) {
      setError('Batch Number, Section ID, and Enrolled Student Capacity are strictly required.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/batches', {
        batchNumber: batchNumber.trim(),
        section: section.trim(),
        studentCount: parseInt(studentCount, 10)
      });
      setBatches([response.data, ...batches]);
      setFormData({ batchNumber: '', section: '', studentCount: '' });
      showSuccess(`Batch ${response.data.batchNumber} - ${response.data.section} registered successfully.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save the specify cohort to database.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    setError(null);
    const { batchNumber, section, studentCount } = editData;

    if (!batchNumber.trim() || !section.trim() || !studentCount) {
      setError('Please provide complete academic cohort properties.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/batches/${id}`, {
        batchNumber: batchNumber.trim(),
        section: section.trim(),
        studentCount: parseInt(studentCount, 10)
      });
      setBatches(batches.map(b => b.id === id ? response.data : b));
      setIsEditing(null);
      showSuccess('Cohort structure edited.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update academic cohort log.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (!window.confirm(`Are you sure you want to remove batch ${label}?`)) {
      return;
    }

    setError(null);
    try {
      setLoading(true);
      await api.delete(`/batches/${id}`);
      setBatches(batches.filter(b => b.id !== id));
      showSuccess('Cohort profile deleted successfully.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove selected cohort.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(b =>
    `${b.batchNumber} ${b.section}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="batches-section">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Academic Cohorts & Batches</h2>
        <p className="text-xs text-gray-500 mt-1">Manage student batches, enrolled section structures, and class capacities.</p>
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
            <Users className="w-4 h-4 text-sky-600" />
            Add Student Batch Group
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Batch Identifier</label>
              <input
                type="text"
                placeholder="e.g. 232 or 241"
                value={formData.batchNumber}
                onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Section Identifier</label>
              <input
                type="text"
                placeholder="e.g. Section 1 or A"
                value={formData.section}
                onChange={e => setFormData({ ...formData, section: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Student Headcount</label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={formData.studentCount}
                onChange={e => setFormData({ ...formData, studentCount: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2C4A6F] text-white text-xs py-2.5 px-4 rounded hover:bg-[#1B324F] transition font-medium cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Register Batch Profile
            </button>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Cohort Group Registers ({filteredBatches.length})</span>
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
                  <th className="py-3 px-4 font-semibold">Cohort Label</th>
                  <th className="py-3 px-4 font-semibold">Section</th>
                  <th className="py-3 px-4 font-semibold">Active Student Count</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && batches.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">Loading batch details...</td>
                    
                  </tr>
                ) : filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">No active cohorts have been registered.</td>
                  </tr>
                ) : (
                  filteredBatches.map(batch => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        {isEditing === batch.id ? (
                          <input
                            type="text"
                            value={editData.batchNumber}
                            onChange={e => setEditData({ ...editData, batchNumber: e.target.value })}
                            className="p-1 border border-sky-500 rounded text-xs focus:outline-none focus:ring-1 max-w-[120px]"
                          />
                        ) : (
                          <span>Batch {batch.batchNumber}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing === batch.id ? (
                          <input
                            type="text"
                            value={editData.section}
                            onChange={e => setEditData({ ...editData, section: e.target.value })}
                            className="p-1 border border-sky-500 rounded text-xs focus:outline-none focus:ring-1 max-w-[120px]"
                          />
                        ) : (
                          <span className="text-gray-800 font-medium">{batch.section}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing === batch.id ? (
                          <input
                            type="number"
                            value={editData.studentCount}
                            onChange={e => setEditData({ ...editData, studentCount: e.target.value })}
                            className="p-1 border border-sky-500 rounded text-xs focus:outline-none focus:ring-1 max-w-[80px]"
                          />
                        ) : (
                          <span className="font-semibold text-[#1E3F66]">{batch.studentCount} Active Students</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isEditing === batch.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleUpdate(batch.id)}
                              className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded cursor-pointer"
                              title="Save changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(null);
                              }}
                              className="p-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setIsEditing(batch.id);
                                setEditData({
                                  batchNumber: batch.batchNumber,
                                  section: batch.section,
                                  studentCount: batch.studentCount.toString()
                                });
                              }}
                              className="p-1 text-[#2C4A6F] hover:bg-slate-100 rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(batch.id, `${batch.batchNumber} - ${batch.section}`)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
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
