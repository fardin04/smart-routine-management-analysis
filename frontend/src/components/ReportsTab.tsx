import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Routine, Room, Teacher, Course } from '../types';
import { BarChart, BookOpen, Layers, ShieldCheck, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ReportsTab() {
  const [loading, setLoading] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [routinesRes, roomsRes, teachersRes, coursesRes] = await Promise.all([
        api.get('/routines'),
        api.get('/rooms'),
        api.get('/teachers'),
        api.get('/courses')
      ]);
      setRoutines(Array.isArray(routinesRes?.data) ? routinesRes.data : []);
      setRooms(Array.isArray(roomsRes?.data) ? roomsRes.data : []);
      setTeachers(Array.isArray(teachersRes?.data) ? teachersRes.data : []);
      setCourses(Array.isArray(coursesRes?.data) ? coursesRes.data : []);
    } catch (err) {
      console.error('Failed to sync master listings for reports.', err);
    } finally {
      setLoading(false);
    }
  };

  const totalClasses = routines.filter(r => r.course?.courseType === 'Theory').length;
  const totalLabs = routines.filter(r => r.course?.courseType === 'Lab').length;

  // Calculat Room utilization (Active slots filled out of possible slots)
  // Working slots in Sunday-Thursday (5 days) * 8 slots/day = 40 possible slots per room
  const possibleSlotsPerRoom = 40;
  const totalRoomsCount = rooms.length;
  const maxPossibleUniversitySlots = totalRoomsCount * possibleSlotsPerRoom;
  
  // Single room utilization calculation helper
  const roomOccupancyRate = maxPossibleUniversitySlots > 0 
    ? Math.round((routines.length / maxPossibleUniversitySlots) * 100) 
    : 0;

  // Calculate teacher workloads: find individual max assigned lectures
  const teacherLoadsMap: Record<string, { name: string; count: number }> = {};
  
  // Preset all teachers to 0
  teachers.forEach(t => {
    teacherLoadsMap[t.id] = { name: t.name, count: 0 };
  });

  routines.forEach(r => {
    if (r.teacherId && teacherLoadsMap[r.teacherId]) {
      teacherLoadsMap[r.teacherId].count += 1;
    }
  });

  const sortedTeacherLoads = Object.values(teacherLoadsMap).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6" id="reports-section">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 animate-pulse-slow shrink-0" />
          Analytical & Utilization Reports
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Review operational metrics, calculated lecturer hours, room utilization distributions, and syllabus reports.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Computing statistics telemetry...</div>
      ) : (
        <div className="space-y-6">
          
          {/* Top telemetry cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 text-[#1E3F66] rounded-md border border-sky-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-bold">Total Theory Lectures</span>
                <span className="block text-lg font-bold text-gray-800 mt-0.5">{totalClasses} Active Periods</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-700 rounded-md border border-rose-100">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-bold">Total Laboratory Labs</span>
                <span className="block text-lg font-bold text-gray-800 mt-0.5">{totalLabs} Active Periods</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-bold">Global Room Utilization</span>
                <span className="block text-lg font-bold text-gray-800 mt-0.5">{roomOccupancyRate}% Occupied</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] text-gray-400 uppercase font-bold">Syllabus Completion</span>
                <span className="block text-lg font-bold text-gray-800 mt-0.5">
                  {courses.length > 0 ? Math.min(100, Math.round((routines.length / (courses.length * 2)) * 100)) : 0}% Allocated
                </span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Faculty Workload breakdown */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                <BarChart className="w-4 h-4 text-sky-600" />
                Faculty Workload & Allocated Hours
              </h3>
              
              {sortedTeacherLoads.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-4">No lecturers registered in data files.</p>
              ) : (
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-2">
                  {sortedTeacherLoads.map((load, index) => {
                    const maxPossibleTeacherPeriods = 15; // standard target workload limit
                    const loadPercentage = Math.min(100, Math.round((load.count / maxPossibleTeacherPeriods) * 100));
                    
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-800">{load.name}</span>
                          <span className="font-semibold text-gray-600">{load.count} classes/week</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
                          <div 
                            className={`h-full rounded transition-all ${
                              load.count > 10 ? 'bg-red-500' : 'bg-[#2C4A6F]'
                            }`}
                            style={{ width: `${loadPercentage}%` }}
                          />
                        </div>
                        {load.count > 10 && (
                          <span className="text-[9px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            High workload warning: lecturer approaches weekly overtime restrictions.
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Room occupy status detailed report table */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-600" />
                Infrastructure Capacity and Occupancy Log
              </h3>

              {rooms.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-4">No rooms or lab spaces entered.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-600">
                    <thead className="bg-gray-50 uppercase text-[9px] tracking-wider text-gray-500">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Room Code</th>
                        <th className="py-2.5 px-3 font-semibold">Type</th>
                        <th className="py-2.5 px-3 font-semibold">Seating</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Occupied slots/40</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rooms.slice(0, 10).map((rm, idx) => {
                        const occupiedSlotsOfThisRoom = routines.filter(r => r.roomNumber === rm.roomNumber).length;
                        const roomRate = Math.round((occupiedSlotsOfThisRoom / possibleSlotsPerRoom) * 100);

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3 font-mono font-medium text-gray-900">{rm.roomNumber}</td>
                            <td className="py-3 px-3">
                              <span className={`inline-block text-[10px] rounded px-1.5 py-0.5 font-bold ${
                                rm.type === 'Laboratory' ? 'bg-rose-50 text-rose-700' : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {rm.type === 'Laboratory' ? 'Lab/Practical' : 'Lecture'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-500 font-semibold">{rm.capacity} seats</td>
                            <td className="py-3 px-3 text-right">
                              <span className="font-semibold text-gray-700">{occupiedSlotsOfThisRoom} slots</span>
                              <span className="text-[10px] text-gray-400 block">{roomRate}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
