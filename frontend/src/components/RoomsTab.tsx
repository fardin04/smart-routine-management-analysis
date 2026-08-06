import { useState, useEffect } from 'react';
import api from '../services/api';
import  {type Room } from '../types';
import { Search, Plus, Edit, Trash2, Check, X, ShieldAlert, Layers } from 'lucide-react';

export default function RoomsTab() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ roomNumber: '', capacity: '', type: 'Classroom', availableDays: ['Sunday','Monday','Tuesday','Wednesday','Thursday'] });
  const [editData, setEditData] = useState({ capacity: '', type: 'Classroom', availableDays: ['Sunday','Monday','Tuesday','Wednesday','Thursday'] });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/rooms');
      setRooms(Array.isArray(response?.data) ? response.data : []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to download academic room logs.');
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
    const { roomNumber, capacity, type, availableDays } = formData;

    if (!roomNumber.trim() || !capacity) {
      setError('Room Number and Room Capacity are mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/rooms', {
        roomNumber: roomNumber.trim().toUpperCase(),
        capacity: parseInt(capacity, 10),
        type,
        availableDays,
      });
      setRooms([response.data, ...rooms]);
      setFormData({ roomNumber: '', capacity: '', type: 'Classroom', availableDays: ['Sunday','Monday','Tuesday','Wednesday','Thursday'] });
      showSuccess(`Room ${response.data.roomNumber} has been added.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register the new room profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (roomNumber: string) => {
    setError(null);
    const { capacity, type, availableDays } = editData;

    if (!capacity) {
      setError('Please provide room seat capacity.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/rooms/${roomNumber}`, {
        capacity: parseInt(capacity, 10),
        type,
        availableDays,
      });
      setRooms(rooms.map(r => r.roomNumber === roomNumber ? response.data : r));
      setIsEditing(null);
      showSuccess(`Room ${roomNumber} parameters modified.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to edit room meta data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomNumber: string) => {
    if (!window.confirm(`Are you sure you want to remove room ${roomNumber}?`)) {
      return;
    }

    setError(null);
    try {
      setLoading(true);
      await api.delete(`/rooms/${roomNumber}`);
      setRooms(rooms.filter(r => r.roomNumber !== roomNumber));
      showSuccess(`Room ${roomNumber} deleted.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove selected room.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(r =>
    r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up" id="rooms-section">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Room Infrastructure Management</h2>
        <p className="text-xs text-gray-500 mt-1">Configure and manage Classrooms and Laboratories for lecture assignments.</p>
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
            <Layers className="w-4 h-4 text-sky-600" />
            Add Infrastructure Room
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Room Code / Number</label>
              <input
                type="text"
                placeholder="e.g. LAB-502 or RM-301"
                value={formData.roomNumber}
                onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Seating Capacity</label>
              <input
                type="number"
                placeholder="e.g. 60"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Facility Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="Classroom">Classroom (Theory)</option>
                <option value="Laboratory">Laboratory (Practical / Lab)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Available Days</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Sunday','Monday','Tuesday','Wednesday','Thursday'].map(day => (
                  <label key={day} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.availableDays.includes(day)}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...formData.availableDays, day]
                          : formData.availableDays.filter(d => d !== day);
                        setFormData({ ...formData, availableDays: next });
                      }}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2C4A6F] text-white text-xs py-2.5 px-4 rounded hover:bg-[#1B324F] transition font-medium cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Register Room
            </button>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Infrastructure Inventory ({filteredRooms.length})</span>
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
                  <th className="py-3 px-4 font-semibold">Room Code/Number</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Capacity</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && rooms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">Loading infrastructure list...</td>
                  </tr>
                ) : filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400">No rooms configured in standard registers.</td>
                  </tr>
                ) : (
                  filteredRooms.map(room => (
                    <tr key={room.roomNumber} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">{room.roomNumber}</td>
                      <td className="py-3.5 px-4">
                        {isEditing === room.roomNumber ? (
                          <select
                            value={editData.type}
                            onChange={e => setEditData({ ...editData, type: e.target.value as any })}
                            className="p-1 border border-sky-500 bg-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                          >
                            <option value="Classroom">Classroom</option>
                            <option value="Laboratory">Laboratory</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            room.type === 'Laboratory'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-indigo-50 text-[#1E3F66] border border-indigo-100'
                          }`}>
                            {room.type}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing === room.roomNumber ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              value={editData.capacity}
                              onChange={e => setEditData({ ...editData, capacity: e.target.value })}
                              className="p-1 border border-sky-500 rounded text-xs focus:outline-none focus:ring-1"
                              style={{ width: '80px' }}
                            />
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              {['Sunday','Monday','Tuesday','Wednesday','Thursday'].map(day => (
                                <label key={day} className="inline-flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={editData.availableDays.includes(day)}
                                    onChange={e => {
                                      const next = e.target.checked
                                        ? [...editData.availableDays, day]
                                        : editData.availableDays.filter(d => d !== day);
                                      setEditData({ ...editData, availableDays: next });
                                    }}
                                  />
                                  {day.slice(0,3)}
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium text-gray-700">{room.capacity} seats</span>
                            <div className="text-gray-500 text-xs">{(room.availableDays || []).join(', ')}</div>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isEditing === room.roomNumber ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleUpdate(room.roomNumber)}
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
                                setIsEditing(room.roomNumber);
                                setEditData({ capacity: room.capacity.toString(), type: room.type, availableDays: Array.isArray(room.availableDays) ? room.availableDays : ['Sunday','Monday','Tuesday','Wednesday','Thursday'] });
                              }}
                              className="p-1 text-[#2C4A6F] hover:bg-slate-100 rounded cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(room.roomNumber)}
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
