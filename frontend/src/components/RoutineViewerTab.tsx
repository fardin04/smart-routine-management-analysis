import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Routine, Teacher, Batch } from '../types';
import { Search, Printer, Sliders, Calendar, Users, Eye, HelpCircle, FileDown, Check, Maximize2, Minimize2 } from 'lucide-react';

export default function RoutineViewerTab() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Mode state
  const [isPrintFriendly, setIsPrintFriendly] = useState(false);
  const [isMatrixFullscreen, setIsMatrixFullscreen] = useState(false);

  const formatDays: Array<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'> = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday'
  ];

  const timeSlots = [
    { slot: 1, time: '8:50 AM - 10:00 AM' },
    { slot: 2, time: '10:05 AM - 11:15 AM' },
    { slot: 3, time: '11:20 AM - 12:30 PM' },
    { slot: 4, time: '12:35 PM - 1:45 PM' },
    { slot: 5, time: '1:50 PM - 3:00 PM' },
    { slot: 6, time: '3:05 PM - 4:15 PM' },
    { slot: 7, time: '4:20 PM - 5:30 PM' },
    { slot: 8, time: '5:35 PM - 6:45 PM' }
  ];

  useEffect(() => {
    loadRoutinesAndFilters();
  }, []);

  const loadRoutinesAndFilters = async () => {
    setLoading(true);
    setError(null);
    try {
      const [routinesRes, teachersRes, batchesRes] = await Promise.all([
        api.get('/routines'),
        api.get('/teachers'),
        api.get('/batches')
      ]);
      setRoutines(Array.isArray(routinesRes?.data) ? routinesRes.data : []);
      setTeachers(Array.isArray(teachersRes?.data) ? teachersRes.data : []);
      setBatches(Array.isArray(batchesRes?.data) ? batchesRes.data : []);
    } catch (err: any) {
      setError('Could not download finalized lecture schedule logs.');
    } finally {
      setLoading(false);
    }
  };

  // Filter actions
  const filteredRoutines = routines.filter(r => {
    if (selectedBatchId && r.batchId.toString() !== selectedBatchId) return false;
    if (selectedTeacherId && r.teacherId !== selectedTeacherId) return false;
    if (selectedDay && r.day !== selectedDay) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedBatchId('');
    setSelectedTeacherId('');
    setSelectedDay('');
  };

  /**
   * Safe helper to find localized items for grid rendering, accounting for multi-slot Labs
   */
  const findSessionAt = (day: string, slotIndex: number) => {
    // Check if there is an exact start match at this slot
    const exactMatch = filteredRoutines.find(r => r.day === day && r.slot === slotIndex);
    if (exactMatch) return { session: exactMatch, isContinuation: false };
    
    // Check if there is a Lab session starting in the adjacent previous slot
    const prevMatch = filteredRoutines.find(r => r.day === day && r.slot === slotIndex - 1);
    if (prevMatch && prevMatch.course?.courseType === 'Lab') {
      return { session: prevMatch, isContinuation: true };
    }
    
    return null;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="routine-viewer-tab">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-1.5">
            Finalized Academic Routines
            <span title="Use the filter panel to isolate routines for single batches, sections, or lecturers.">
              <HelpCircle className="w-4 h-4 text-gray-400 shrink-0 cursor-help" />
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Display, filter, check classes, and download scheduled sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routines, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", "university_schedule.json");
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="flex items-center gap-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold py-1.5 px-3 rounded hover:bg-gray-50 transition cursor-pointer"
            title="Download full schedule raw dataset as JSON"
          >
            <FileDown className="w-3.5 h-3.5" />
            Export Raw JSON
          </button>

          <button
            onClick={() => setIsPrintFriendly(!isPrintFriendly)}
            className={`px-3 py-1.5 text-xs font-semibold rounded border transition flex items-center gap-1.5 cursor-pointer ${
              isPrintFriendly 
                ? 'bg-sky-50 text-sky-700 border-sky-200' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {isPrintFriendly ? 'Normal UI Layout' : 'Printable Layout View'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#2C4A6F] text-white text-xs font-semibold py-1.5 px-3 rounded hover:bg-[#1B324F] transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Schedules & Export PDF
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400 print:hidden flex flex-col items-center gap-2">
          <Calendar className="w-6 h-6 animate-spin text-sky-600" />
          <span>Synchronizing finalized schedules...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-800 text-xs flex gap-2 print:hidden">
          <HelpCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : routines.length === 0 && (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-xs print:hidden">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No Academic Schedule Created</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
            The university schedule database is currently empty. Trigger the auto generator to schedule classes.
          </p>
        </div>
      )}

      {routines.length > 0 && (
        <div className="space-y-6">
          {/* Filters Selection Card */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs flex flex-wrap gap-4 items-end print:hidden">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 w-full mb-1">
              <Search className="w-3.5 h-3.5 text-sky-600" />
              <span>Routine Filters Control</span>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3 text-sky-600 shrink-0" />
                Filter by Cohort
              </label>
              <select
                value={selectedBatchId}
                onChange={e => setSelectedBatchId(e.target.value)}
                className="text-xs p-2 border border-gray-300 rounded bg-white w-48 focus:ring-1 focus:ring-sky-500"
              >
                <option value="">-- All Batches --</option>
                {batches.map(b => (
                  <option key={b.id} value={b.id}>Batch {b.batchNumber} - {b.section}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-sky-600 shrink-0" />
                Filter by Teacher
              </label>
              <select
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="text-xs p-2 border border-gray-300 rounded bg-white w-48 focus:ring-1 focus:ring-sky-500"
              >
                <option value="">-- All Teachers --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-sky-600 shrink-0" />
                Filter by Day
              </label>
              <select
                value={selectedDay}
                onChange={e => setSelectedDay(e.target.value)}
                className="text-xs p-2 border border-gray-300 rounded bg-white w-40 focus:ring-1 focus:ring-sky-500"
              >
                <option value="">-- All Days --</option>
                {formatDays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {(selectedBatchId || selectedTeacherId || selectedDay) && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold py-2 px-3 border border-gray-200 bg-gray-50 hover:bg-gray-100 rounded text-gray-600 transition cursor-pointer"
              >
                Reset Filters
              </button>
            )}

            <span className="text-[11px] text-gray-400 ml-auto self-center font-mono">
              Displaying {filteredRoutines.length} classes
            </span>
          </div>

          {/* Grid/Matrix view of Routine schedule */}
          {isPrintFriendly ? (
            /* PRINT FRIENDLY COMPACT TABLE VIEW */
            <div className="bg-white p-6 rounded-lg border border-gray-300 shadow-sm print:shadow-none print:border-none">
              <div className="text-center pb-4 mb-6 border-b border-gray-200">
                <h1 className="text-lg font-bold text-gray-900 uppercase tracking-wide">University Academic Routine Statement</h1>
                <p className="text-xs text-gray-500 mt-1">Generated Timetable & Course Schedules</p>
                {selectedBatchId && (
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    Cohort Target: Batch {batches.find(b => b.id.toString() === selectedBatchId)?.batchNumber} - {batches.find(b => b.id.toString() === selectedBatchId)?.section}
                  </p>
                )}
                {selectedTeacherId && (
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    Faculty Assignment: {teachers.find(t => t.id === selectedTeacherId)?.name}
                  </p>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 font-bold text-gray-700 w-24">Day</th>
                      <th className="border border-gray-300 p-2 font-bold text-gray-700">Scheduled Sessions & Time slots</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formatDays.map(day => {
                      const sessionsOnDay = filteredRoutines.filter(r => r.day === day);
                      if (selectedDay && day !== selectedDay) return null;

                      return (
                        <tr key={day}>
                          <td className="border border-gray-300 p-2 font-bold text-gray-900 bg-gray-50">{day}</td>
                          <td className="border border-gray-300 p-2">
                            {sessionsOnDay.length === 0 ? (
                              <span className="text-gray-400 italic text-xs">No active lectures scheduled.</span>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {sessionsOnDay.map(session => (
                                  <div key={session.id} className="p-2 border border-gray-200 rounded bg-gray-50 text-[11px]">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-gray-800 font-mono">{session.course?.courseCode}</span>
                                      <span className="text-[9px] font-mono font-medium text-gray-400">Slot {session.slot}</span>
                                    </div>
                                    <div className="font-medium text-gray-900 truncate mb-0.5">{session.course?.courseName}</div>
                                    <div className="text-[10px] text-gray-500 flex justify-between">
                                      <span>Room {session.roomNumber}</span>
                                      <span>Teacher: {session.teacher?.name}</span>
                                    </div>
                                    <div className="text-[9px] font-semibold text-sky-700 mt-1">
                                      Batch {session.batch?.batchNumber} ({session.batch?.section})
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* DETAILED ACADEMIC MATRIX GRID DESIGN */
            <div className={`${
              isMatrixFullscreen 
                ? 'fixed inset-0 z-50 bg-white rounded-none shadow-none overflow-auto flex flex-col' 
                : 'bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden flex flex-col'
            }`}>
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  Timetable Allocation Matrix
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-gray-400 leading-none">
                    Row: Academic Day | Column: Time Hour Slot Index
                  </span>
                  <button
                    onClick={() => setIsMatrixFullscreen(!isMatrixFullscreen)}
                    className="p-1.5 hover:bg-gray-200 rounded transition text-gray-600 hover:text-gray-900 cursor-pointer"
                    title={isMatrixFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isMatrixFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center table-fixed min-w-[900px] text-xs">
                  <thead>
                    <tr className="bg-gray-100/80 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
                      <th className="py-3 px-2 border-r border-gray-200 w-24">Day</th>
                      {timeSlots.map(s => (
                        <th key={s.slot} className="py-3 px-1 border-r border-gray-200 font-semibold last:border-0">
                          <div className="font-bold text-gray-600">Slot {s.slot}</div>
                          <div className="text-[9px] text-gray-400 mt-0.5 font-mono font-normal">{s.time}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {formatDays.map(day => {
                      if (selectedDay && day !== selectedDay) return null;

                      return (
                        <tr key={day} className="hover:bg-slate-50/40">
                          <td className="py-4 px-2 border-r border-gray-200 font-bold bg-gray-50/50 text-gray-800 uppercase tracking-widest text-[10px] text-center">
                            {day}
                          </td>

                          {timeSlots.map(s => {
                            const result = findSessionAt(day, s.slot);
                            
                            return (
                              <td key={s.slot} className="p-2 border-r border-gray-200 align-top last:border-0 h-28 relative">
                                {result ? (
                                  result.isContinuation ? (
                                    <div className="h-full p-2 rounded border border-dashed text-left flex flex-col justify-between bg-amber-50/30 border-amber-200 hover:shadow-xs transition duration-150">
                                      <div>
                                        <div className="flex justify-between items-start mb-1">
                                          <span className="px-1.5 py-0.5 font-mono text-[9px] font-bold bg-white text-gray-700 border border-gray-200 rounded">
                                            {result.session.course?.courseCode}
                                          </span>
                                          <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-1.5 rounded">
                                            LAB CONT.
                                          </span>
                                        </div>
                                        <div className="font-semibold text-gray-500 leading-tight line-clamp-2 text-[10px] mb-1 italic">
                                          [Continuation of {result.session.course?.courseName}]
                                        </div>
                                      </div>
                                      <div className="text-[9px] text-gray-400 font-medium">
                                        Rm: {result.session.roomNumber} | Batch {result.session.batch?.batchNumber}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="h-full p-2 rounded border text-left flex flex-col justify-between bg-sky-50/60 border-sky-200 hover:shadow-xs transition duration-150">
                                      <div>
                                        <div className="flex justify-between items-start mb-1">
                                          <span className="px-1.5 py-0.5 font-mono text-[9px] font-bold bg-white text-gray-700 border border-gray-200 rounded">
                                            {result.session.course?.courseCode}
                                          </span>
                                          <span className={`text-[8px] font-bold px-1.5 rounded flex items-center gap-0.5 ${
                                            result.session.course?.courseType === 'Lab' 
                                              ? 'bg-amber-100 text-amber-800' 
                                              : 'bg-emerald-100 text-emerald-800'
                                          }`}>
                                            <Check className="w-2.5 h-2.5 text-current shrink-0" />
                                            {result.session.course?.courseType === 'Lab' ? 'LAB' : 'LEC'}
                                          </span>
                                        </div>
                                        <div className="font-semibold text-gray-900 leading-tight line-clamp-2 text-[10px] mb-1">
                                          {result.session.course?.courseName}
                                        </div>
                                      </div>

                                      <div className="space-y-0.5 text-[9px] text-gray-500 font-medium">
                                        <div className="truncate">
                                          Prof: {result.session.teacher?.name}
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-sky-800 font-bold mt-1 pt-1 border-t border-sky-100">
                                          <span>Rm: {result.session.roomNumber}</span>
                                          <span className="bg-sky-100/70 px-1 rounded">B.{result.session.batch?.batchNumber} S.{result.session.batch?.section}</span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                ) : (
                                  <div className="h-full flex items-center justify-center text-[10px] text-gray-300 border-dashed border border-gray-100 bg-gray-50/10 rounded">
                                    No Lecture
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
