import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Course, Teacher, Batch } from '../types';
import { Search, Plus, Edit, Trash2, Check, X, ShieldAlert, BookOpen, UserCheck, Layers } from 'lucide-react';

export default function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    courseType: 'Theory',
    teacherId: '',
    batchId: ''
  });
  const [editData, setEditData] = useState({
    courseName: '',
    courseCode: '',
    courseType: 'Theory',
    teacherId: '',
    batchId: ''
  });

  useEffect(() => {
    loadAllDependencies();
  }, []);

  const loadAllDependencies = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesRes, teachersRes, batchesRes] = await Promise.all([
        api.get('/courses'),
        api.get('/teachers'),
        api.get('/batches')
      ]);
      setCourses(Array.isArray(coursesRes?.data) ? coursesRes.data : []);
      setTeachers(Array.isArray(teachersRes?.data) ? teachersRes.data : []);
      setBatches(Array.isArray(batchesRes?.data) ? batchesRes.data : []);
    } catch (err: any) {
      setError('Failed to sync master listings for courses, teachers, and student cohorts.');
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
    const { courseName, courseCode, courseType, teacherId, batchId } = formData;

    if (!courseName.trim() || !courseCode.trim() || !batchId) {
      setError('Course Code, Name, and Target Batch Cohorts are strictly required.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/courses', {
        courseName: courseName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        courseType,
        teacherId: teacherId || null,
        batchId: parseInt(batchId, 10)
      });
      setCourses([response.data, ...courses]);
      setFormData({
        courseName: '',
        courseCode: '',
        courseType: 'Theory',
        teacherId: '',
        batchId: ''
      });
      showSuccess(`Course ${response.data.courseCode} added under active syllabus.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to enroll course syllabus.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    setError(null);
    const { courseName, courseCode, courseType, teacherId, batchId } = editData;

    if (!courseName.trim() || !courseCode.trim() || !batchId) {
      setError('Please provide completed course syllabus properties.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.put(`/courses/${id}`, {
        courseName: courseName.trim(),
        courseCode: courseCode.trim().toUpperCase(),
        courseType,
        teacherId: teacherId || null,
        batchId: parseInt(batchId, 10)
      });
      setCourses(courses.map(c => c.id === id ? response.data : c));
      setIsEditing(null);
      showSuccess('Course curriculum configuration modified successfully.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to modify course attributes.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (!window.confirm(`Are you sure you want to remove course curriculum ${label}?`)) {
      return;
    }

    setError(null);
    try {
      setLoading(true);
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter(c => c.id !== id));
      showSuccess(`Course syllabus ${label} removed.`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete curriculum record.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.teacher?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="courses-section">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Syllabus & Course Registries</h2>
        <p className="text-xs text-gray-500 mt-1">Configure study titles, code classifications, theoretical or laboratory formats, and assign faculty.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-5 rounded-lg border border-gray-200 shadow-xs h-fit">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            Add Course Syllabus
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CSE-401"
                value={formData.courseCode}
                onChange={e => setFormData({ ...formData, courseCode: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Course Title</label>
              <input
                type="text"
                placeholder="e.g. Software Engineering"
                value={formData.courseName}
                onChange={e => setFormData({ ...formData, courseName: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Course Category Type</label>
              <select
                value={formData.courseType}
                onChange={e => setFormData({ ...formData, courseType: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="Theory">Theory (2 Lessons / Wk)</option>
                <option value="Lab">Lab / Practical (1 Dual-Slot / Wk)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Teacher (Lecturer)</label>
              <select
                value={formData.teacherId}
                onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">-- Assign Senior Faculty (Optional) --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Target Student Cohorts (Batch)</label>
              <select
                value={formData.batchId}
                onChange={e => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full text-xs p-2.5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 animate-none"
                required
              >
                <option value="">-- Choose Target Batch-Section --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>Batch {b.batchNumber} - {b.section} ({b.studentCount} Students)</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2C4A6F] text-white text-xs py-2.5 px-4 rounded hover:bg-[#1B324F] transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Enroll Course
            </button>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">Curriculum Records ({filteredCourses.length})</span>
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
                  <th className="py-3 px-4 font-semibold">Course Code</th>
                  <th className="py-3 px-4 font-semibold">Course Title</th>
                  <th className="py-3 px-4 font-semibold">Class Format</th>
                  <th className="py-3 px-4 font-semibold">Allocated Teacher</th>
                  <th className="py-3 px-4 font-semibold">Enrolled Cohort</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">Syncing database curriculum data...</td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">No matching syllabus or courses found.</td>
                  </tr>
                ) : (
                  filteredCourses.map(course => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {isEditing === course.id ? (
                          <input
                            type="text"
                            value={editData.courseCode}
                            onChange={e => setEditData({ ...editData, courseCode: e.target.value })}
                            className="p-1 border border-sky-500 rounded text-xs focus:outline-none focus:ring-1 w-full max-w-[90px]"
                          />
                        ) : (
                          course.courseCode
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing === course.id ? (
                          <input
                            type="text"
                            value={editData.courseName}
                            onChange={e => setEditData({ ...editData, courseName: e.target.value })}
                            className="p-1 border border-sky-500 rounded text-xs focus:outline-none focus:ring-1 w-full max-w-xs"
                          />
                        ) : (
                          <span className="text-gray-800 font-medium">{course.courseName}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing === course.id ? (
                          <select
                            value={editData.courseType}
                            onChange={e => setEditData({ ...editData, courseType: e.target.value })}
                            className="p-1 border border-sky-500 bg-white rounded text-xs focus:outline-none focus:ring-1"
                          >
                            <option value="Theory">Theory</option>
                            <option value="Lab">Lab</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            course.courseType === 'Lab'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {course.courseType}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {isEditing === course.id ? (
                          <select
                            value={editData.teacherId}
                            onChange={e => setEditData({ ...editData, teacherId: e.target.value })}
                            className="p-1 border border-sky-500 bg-white rounded text-xs focus:outline-none focus:ring-1 w-full"
                          >
                            <option value="">-- No Assignment --</option>
                            {teachers.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        ) : (
                          course.teacher ? (
                            <span className="font-medium text-gray-700">{course.teacher.name}</span>
                          ) : (
                            <span className="text-red-500 font-mono text-[11px] font-semibold">Teacher Not Assigned</span>
                          )
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E3F66]">
                        {isEditing === course.id ? (
                          <select
                            value={editData.batchId}
                            onChange={e => setEditData({ ...editData, batchId: e.target.value })}
                            className="p-1 border border-sky-500 bg-white rounded text-xs focus:outline-none focus:ring-1 w-full"
                          >
                            {batches.map(b => (
                              <option key={b.id} value={b.id}>Batch {b.batchNumber} - {b.section}</option>
                            ))}
                          </select>
                        ) : (
                          course.batch ? (
                            <span>Batch {course.batch.batchNumber} - {course.batch.section}</span>
                          ) : (
                            <span className="text-gray-400">Unknown Cohort</span>
                          )
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isEditing === course.id ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleUpdate(course.id)}
                              className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded"
                              title="Save changes"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setIsEditing(null);
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
                                setIsEditing(course.id);
                                setEditData({
                                  courseName: course.courseName,
                                  courseCode: course.courseCode,
                                  courseType: course.courseType,
                                  teacherId: course.teacherId || '',
                                  batchId: course.batchId.toString()
                                });
                              }}
                              className="p-1 text-[#2C4A6F] hover:bg-slate-100 rounded"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(course.id, `${course.courseCode}: ${course.courseName}`)}
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
