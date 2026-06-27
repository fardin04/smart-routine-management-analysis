import { useState, useEffect } from 'react';
import api from '../services/api';
import { Teacher, Room, Batch, Course, Routine } from '../types';
import { Users, LayoutGrid, Layers, GraduationCap, Calendar, CheckSquare, RefreshCw, BarChart, Sliders } from 'lucide-react';

export default function DashboardView() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    teachers: 0,
    rooms: 0,
    batches: 0,
    courses: 0,
    routines: 0
  });

  const [activeRoutines, setActiveRoutines] = useState<Routine[]>([]);
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [activeTeachers, setActiveTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    fetchDashboardDetails();
  }, []);

  const fetchDashboardDetails = async () => {
    setLoading(true);
    try {
      const [tRes, rRes, bRes, cRes, rtRes] = await Promise.all([
        api.get('/teachers'),
        api.get('/rooms'),
        api.get('/batches'),
        api.get('/courses'),
        api.get('/routines')
      ]);

      const teachersList = Array.isArray(tRes?.data) ? tRes.data : [];
      const roomsList = Array.isArray(rRes?.data) ? rRes.data : [];
      const batchesList = Array.isArray(bRes?.data) ? bRes.data : [];
      const coursesList = Array.isArray(cRes?.data) ? cRes.data : [];
      const routinesList = Array.isArray(rtRes?.data) ? rtRes.data : [];

      setStats({
        teachers: teachersList.length,
        rooms: roomsList.length,
        batches: batchesList.length,
        courses: coursesList.length,
        routines: routinesList.length
      });

      setActiveRoutines(routinesList);
      setActiveRooms(roomsList);
      setActiveTeachers(teachersList);
    } catch (err) {
      console.error('Failed to download system totals.', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate Room usage details for report visualization
  const roomSessions = activeRooms.map(rm => {
    const classCount = activeRoutines.filter(rt => rt.roomNumber === rm.roomNumber).length;
    return {
      roomNumber: rm.roomNumber,
      count: classCount,
      capacity: rm.capacity
    };
  }).slice(0, 8); // Top 8 rooms

  // Generate Teacher workloads (Active scheduled classes count)
  const teacherLoads = activeTeachers.map(t => {
    const classCount = activeRoutines.filter(rt => rt.teacherId === t.id).length;
    return {
      id: t.id,
      name: t.name,
      count: classCount
    };
  }).filter(t => t.count > 0).slice(0, 8); // Top scheduled teachers

  return (
    <div className="space-y-6 animate-slide-up" id="dashboard-hub">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Operational Hub & Analytics</h2>
          <p className="text-xs text-gray-500 mt-1">Live metrics and telemetry logs of scheduled lectures, rooms usage, and teacher burdens.</p>
        </div>
        <button
          onClick={fetchDashboardDetails}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 text-xs text-gray-600 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sync Data Registers
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Syncing live analytics...</div>
      ) : (
        <div className="space-y-6">
          
          {/* Stats Grid Counters - Configured defensively with min-w-0 and truncate to prevent text overflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3 min-w-0 overflow-hidden">
              <div className="p-2 bg-sky-50 text-[#2C4A6F] rounded shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wide truncate">Total Faculty</span>
                <span className="block text-sm sm:text-base md:text-lg font-bold text-gray-800 mt-0.5 truncate">{stats.teachers} Professors</span>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3 min-w-0 overflow-hidden">
              <div className="p-2 bg-rose-50 text-rose-700 rounded shrink-0">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wide truncate">Total Rooms</span>
                <span className="block text-sm sm:text-base md:text-lg font-bold text-gray-800 mt-0.5 truncate">{stats.rooms} Facilities</span>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3 min-w-0 overflow-hidden">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wide truncate">Total Cohorts</span>
                <span className="block text-sm sm:text-base md:text-lg font-bold text-gray-800 mt-0.5 truncate">{stats.batches} Batches</span>
              </div>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3 min-w-0 overflow-hidden">
              <div className="p-2 bg-amber-50 text-amber-700 rounded shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wide truncate">Total syllabus</span>
                <span className="block text-sm sm:text-base md:text-lg font-bold text-gray-800 mt-0.5 truncate">{stats.courses} Courses</span>
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2 md:col-span-1 bg-white p-3 sm:p-4 rounded-lg border border-[#2C4A6F] shadow-xs flex items-center gap-3 min-w-0 overflow-hidden">
              <div className="p-2 bg-sky-50/70 text-[#1B324F] rounded shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wide truncate">Allocated Classes</span>
                <span className="block text-sm sm:text-base md:text-lg font-bold text-[#1E3F66] mt-0.5 truncate">{stats.routines} Scheduled</span>
              </div>
            </div>

          </div>

          {/* ERP Visualizer Charts Grid (Pure Tailwind robust design) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Room Usage Visualizer chart */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                  <BarChart className="w-4 h-4 text-sky-600" />
                  Infrastructure Utilization Heat chart
                </h3>

                {roomSessions.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-6 text-center">No active rooms found or scheduled. Run automated router generator first.</p>
                ) : (
                  <div className="space-y-4">
                    {roomSessions.map((rm, idx) => {
                      const percentage = Math.min(100, Math.round((rm.count / 40) * 100)); // out of 40 possible class hours
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center gap-2 text-xs min-w-0">
                            <span className="font-mono font-bold text-gray-700 truncate">Room {rm.roomNumber} ({rm.capacity} seats)</span>
                            <span className="font-semibold text-gray-500 shrink-0">{rm.count} periods/wk ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-300 bg-[#2C4A6F]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 block mt-4 font-medium">Heat measures occupancies against the max weekly 40-hour limit per room.</span>
            </div>

            {/* Teacher Workload Burden charts */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pb-1 border-b border-gray-100 flex items-center gap-1.5">
                  <BarChart className="w-4 h-4 text-sky-600" />
                  Active Faculty workload allocations
                </h3>

                {teacherLoads.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-6 text-center">No hours allocated to professors. Populate course constraints and generate timings.</p>
                ) : (
                  <div className="space-y-4">
                    {teacherLoads.map((teach, idx) => {
                      const maxTargetWorkload = 15; // academic load target parameters limit
                      const percentage = Math.min(100, Math.round((teach.count / maxTargetWorkload) * 100));
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center gap-2 text-xs min-w-0">
                            <span className="font-semibold text-gray-700 truncate">{teach.name}</span>
                            <span className="font-mono text-gray-500 text-[11px] shrink-0">{teach.count} classes ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                teach.count > 10 ? 'bg-red-500' : 'bg-slate-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 block mt-4 font-medium">Target workloads are mapped against 15 active lecture periods per faculty member per week.</span>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
