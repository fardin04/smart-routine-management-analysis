import { useState } from 'react';
import api from '../services/api';
import { ConflictReport, Routine } from '../types';
import { Calendar, Play, RefreshCw, Trash2, ArrowRight, ShieldAlert, CheckCircle2, Sliders, Clock, HelpCircle } from 'lucide-react';

interface RoutineGeneratorTabProps {
  onRoutineGenerated: () => void;
  hasExistingRoutines: boolean;
}

export default function RoutineGeneratorTab({ onRoutineGenerated, hasExistingRoutines }: RoutineGeneratorTabProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<ConflictReport[] | null>(null);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  const formatDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const formatSlots = [
    { slot: 1, time: '8:50 AM - 10:00 AM' },
    { slot: 2, time: '10:05 AM - 11:15 AM' },
    { slot: 3, time: '11:20 AM - 12:30 PM' },
    { slot: 4, time: '12:35 PM - 1:45 PM' },
    { slot: 5, time: '1:50 PM - 3:00 PM' },
    { slot: 6, time: '3:05 PM - 4:15 PM' },
    { slot: 7, time: '4:20 PM - 5:30 PM' },
    { slot: 8, time: '5:35 PM - 6:45 PM' }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setConflicts(null);
    setSuccessMsg(null);
    setErrorHeader(null);

    try {
      const response = await api.post('/routines/generate');
      
      if (response.data.success) {
        setSuccessMsg(response.data.message);
        onRoutineGenerated();
      } else {
        setErrorHeader(response.data.message);
        setConflicts(response.data.conflicts || []);
      }
    } catch (err: any) {
      setErrorHeader(err.response?.data?.error || 'A critical exception was thrown during backtracking execution.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you strictly sure you want to clear the entire generated university class routine? This is irreversible.')) {
      return;
    }

    setLoading(true);
    setConflicts(null);
    setSuccessMsg(null);
    setErrorHeader(null);

    try {
      await api.post('/routines/clear');
      setSuccessMsg('Academic routine grid cleared successfully.');
      onRoutineGenerated();
    } catch (err: any) {
      setErrorHeader(err.response?.data?.error || 'Failed to clear current routine database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="generator-section">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Automated Routine Generator</h2>
        <p className="text-xs text-gray-500 mt-1">
          Compute and draft conflict-free university class schedules matching standard educational constraints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module Controllers */}
        <div className="lg:col-span-1 bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between h-fit gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100 flex items-center gap-2 mb-3">
              <Sliders className="w-4 h-4 text-sky-600" />
              Engine Operations
            </h3>
            
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Our automated system uses a backtracking search algorithm with constraint propagation. 
              The system scans faculties, student capacities, and facility allocations instantly to compute safe calendars.
            </p>

            <div className="p-3 bg-gray-50 rounded border border-gray-100 mb-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-2">Core Constraints Checked:</span>
              <ul className="space-y-1.5 text-[11px] text-gray-600 list-disc pl-4 font-medium">
                <li>Theory courses get 2 non-adjacent day sessions.</li>
                <li>Laboratory classes occupy 2 contiguous slots.</li>
                <li>No teacher overlaps in identical periods.</li>
                <li>No room collision in identical periods.</li>
                <li>Cohort-groups restricted to single lesson per hour.</li>
                <li>Class cohorts match or fit room seating capacity.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2C4A6F] text-white text-xs font-semibold py-3 px-4 rounded hover:bg-[#1B324F] transition disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {hasExistingRoutines ? 'Regenerate Complete Routine' : 'Generate Routine Automatically'}
            </button>

            {hasExistingRoutines && (
              <button
                onClick={handleClear}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 text-xs font-semibold py-2.5 px-4 rounded hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear Master Schedules
              </button>
            )}
          </div>
        </div>

        {/* Status Report & Target Slot Outlines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications area */}
          {successMsg && (
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded text-emerald-800 text-xs flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Academic Generation Successful!</span>
                <span className="block mt-1">{successMsg} Go to the Routine Viewer to check results.</span>
              </div>
            </div>
          )}

          {errorHeader && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-800 text-xs flex flex-col gap-2 shadow-xs">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Routine Execution Problem</span>
                  <span className="block mt-1">{errorHeader}</span>
                </div>
              </div>

              {/* Backtracking Failures/Conflicts Log Panel */}
              {conflicts && conflicts.length > 0 && (
                <div className="mt-3 bg-white p-3 rounded border border-red-100">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800 block mb-2">Backtracking Failure Analysis:</span>
                  <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto">
                    {conflicts.map((conf, idx) => (
                      <div key={idx} className="py-2 flex items-start justify-between text-xs gap-3">
                        <div>
                          <p className="font-semibold text-gray-800">{conf.failedCourse}</p>
                          <p className="font-mono text-[10px] text-gray-500">Code: {conf.courseCode}</p>
                        </div>
                        <span className="inline-block bg-rose-50 border border-rose-100 text-rose-700 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                          {conf.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Academic Constraints Settings Structure Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-5">
            <h3 className="text-sm font-semibold text-gray-700 pb-2 border-b border-gray-100 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-sky-600" />
              University Timetable Matrix Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Working Academic Days:</span>
                <div className="flex flex-wrap gap-1.5">
                  {formatDays.map((d, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 border border-gray-200 rounded text-xs font-medium text-gray-700">
                      {d}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 block mt-2">Routine spans Friday & Saturday as official weekend holidays.</span>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Schedule Period slots:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                  {formatSlots.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-gray-50 border border-gray-100 rounded">
                      <span className="font-semibold text-gray-700">Slot {s.slot}</span>
                      <span className="font-mono text-gray-500 text-[11px]">{s.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
