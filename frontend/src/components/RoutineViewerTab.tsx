import { useEffect, useState } from "react";
import api from "../services/api";
import {type Routine } from "../types";
import { RefreshCw, Printer } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] as const;

const SLOTS = [
  { slot: 1, time: "8:50 AM - 10:00 AM" },
  { slot: 2, time: "10:05 AM - 11:15 AM" },
  { slot: 3, time: "11:20 AM - 12:30 PM" },
  { slot: 4, time: "12:35 PM - 1:45 PM" },
  { slot: 5, time: "1:50 PM - 3:00 PM" },
  { slot: 6, time: "3:05 PM - 4:15 PM" },
  { slot: 7, time: "4:20 PM - 5:30 PM" },
  { slot: 8, time: "5:35 PM - 6:45 PM" },
];

export default function RoutineViewerTab() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setLoading(true);
    try {
      const res = await api.get<Routine[]>('/routines');
      setRoutines(res.data);
    } catch (err) {
      console.error('Failed to load routines', err);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  const getSessionInfo = (day: typeof DAYS[number], slot: number) => {
    const session = routines.find(r => r.day === day && r.slot === slot) || null;
    if (!session) return { session: null, isContinuation: false };

    const prev = routines.find(r => r.day === day && r.slot === slot - 1) || null;

    const isContinuation = !!(
      prev &&
      session.courseId === prev.courseId &&
      session.course?.courseType === 'Lab'
    );

    return { session, isContinuation };
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Routine Viewer</h2>
          <p className="text-xs text-gray-500 mt-1">Weekly timetable view (Sunday - Thursday)</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRoutines}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded text-sm"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded text-sm"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded border border-gray-200 p-4">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              <th className="w-36 text-left text-xs font-semibold text-gray-600">Time / Day</th>
              {DAYS.map((d) => (
                <th key={d} className="text-left text-xs font-semibold text-gray-600 px-2">{d}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {SLOTS.map(({ slot, time }) => (
              <tr key={slot} className="align-top">
                <td className="py-2 text-[13px] font-medium text-gray-700">{`Slot ${slot}`}
                  <div className="text-xs text-gray-400">{time}</div>
                </td>

                {DAYS.map((day) => {
                  const { session, isContinuation } = getSessionInfo(day, slot);

                  return (
                    <td key={`${day}-${slot}`} className="px-2 py-2 align-top border-l border-gray-100 h-20">
                      {!session ? (
                        <div className="text-[12px] text-gray-400 italic">&nbsp;</div>
                      ) : isContinuation ? (
                        <div className="w-full h-full flex items-center justify-center bg-amber-50 border border-amber-100 rounded text-xxs text-amber-700 font-semibold text-[11px]">
                          LAB CONTINUATION
                        </div>
                      ) : (
                        <div className="p-2 bg-sky-50 border border-sky-100 rounded h-full">
                          <div className="flex items-start justify-between">
                            <div className="text-sm font-semibold text-gray-800 truncate">
                              {session.course?.courseName || 'N/A'}
                            </div>
                            <div className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                              session.course?.courseType === 'Lab' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {session.course?.courseType === 'Lab' ? 'LAB' : 'LEC'}
                            </div>
                          </div>

                          <div className="text-[12px] text-gray-600 mt-1">
                            <div className="truncate">Prof: {session.teacher?.name || 'TBD'}</div>
                            <div className="flex items-center justify-between text-[12px] text-sky-800 font-bold mt-1">
                              <span>Rm: {session.roomNumber}</span>
                              <span className="bg-sky-100/70 px-1 rounded">B.{session.batch?.batchNumber} S.{session.batch?.section}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
