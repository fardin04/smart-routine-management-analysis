import React, { useState, useEffect } from 'react';
import api from './services/api';
import DashboardView from './components/DashboardView';
import TeachersTab from './components/TeachersTab';
import RoomsTab from './components/RoomsTab';
import BatchesTab from './components/BatchesTab';
import CoursesTab from './components/CoursesTab';
import RoutineGeneratorTab from './components/RoutineGeneratorTab';
import RoutineViewerTab from './components/RoutineViewerTab';
import AiAnalysisTab from './components/AiAnalysisTab';
import ReportsTab from './components/ReportsTab';

import {
  LayoutGrid,
  BookOpen,
  Layers,
  Users,
  GraduationCap,
  Sliders,
  Calendar,
  Sparkles,
  BarChart,
  LogOut,
  UserCheck,
  ShieldAlert,
  Loader2,
  Lock,
  Building,
  ArrowRight
} from 'lucide-react';

type TabId =
  | 'dashboard'
  | 'teachers'
  | 'rooms'
  | 'batches'
  | 'courses'
  | 'generator'
  | 'viewer'
  | 'ai'
  | 'reports';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Layout Tab selection
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  
  // Track has existing routines to pass to subtabs
  const [hasRoutines, setHasRoutines] = useState(false);

  useEffect(() => {
    checkTokenIntegrity();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      checkExistingRoutines();
    }
  }, [isAuthenticated, activeTab]);

  const checkTokenIntegrity = async () => {
    const cachedToken = localStorage.getItem('university_academic_jwt_token');
    if (!cachedToken) {
      setIsAuthenticated(false);
      setCheckingAuth(false);
      return;
    }

    try {
      const response = await api.get('/auth/status');
      if (response.data.authenticated) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('university_academic_jwt_token');
        setIsAuthenticated(false);
      }
    } catch (err) {
      localStorage.removeItem('university_academic_jwt_token');
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const checkExistingRoutines = async () => {
    try {
      const response = await api.get('/routines');
      setHasRoutines(response.data && response.data.length > 0);
    } catch (err) {
      console.error('Error verifying existing routine grids.', err);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const response = await api.post('/auth/login', {
        username: loginUsername.trim(),
        password: loginPassword
      });

      if (response.data.token) {
        localStorage.setItem('university_academic_jwt_token', response.data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid response credentials from authentication server.');
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Authentication rejected. Verify network links.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('university_academic_jwt_token');
    setIsAuthenticated(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-3 font-sans">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <span className="text-xs font-semibold text-gray-500">Checking terminal keys...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F7FA] p-4 font-sans select-none" id="login-layout">
        <div className="w-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-md p-6 relative overflow-hidden flex flex-col justify-between animate-scale-in">
          
          {/* Header branding */}
          <div className="text-center mb-6">
            <div className="w-11 h-11 bg-sky-50 text-sky-700 rounded-lg flex items-center justify-center border border-sky-100 mx-auto mb-2">
              <Building className="w-5 h-5" />
            </div>
            <h1 className="text-md font-bold text-gray-800 tracking-tight leading-snug">University Routine Terminal</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">Academic Constraint Engine Setup</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border-l-3 border-red-500 text-red-800 text-[11px] rounded flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                Administrative Username
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 bg-gray-50 cursor-pointer"
                placeholder="Enter admin user"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                Passkey Code
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full text-xs p-2.5 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-sky-500 bg-gray-50 cursor-pointer"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#2C4A6F] text-white text-xs py-2.5 px-4 rounded hover:bg-[#1B324F] transition font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              Authenticate System
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Seed credentials guide box as requested */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          </div>

        </div>
      </div>
    );
  }

  // Loaded administrative dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans" id="academia-workspace">
      
      {/* Side Navigation Rail */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 shrink-0 select-none flex flex-col justify-between print:hidden">
        <div>
          {/* Institution banner */}
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3">
            <div className="p-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-gray-800 leading-tight">University Portal</h1>
              <span className="text-[9px] text-sky-600 font-bold uppercase tracking-wider">ERP Routines Engine</span>
            </div>
          </div>

          {/* Navigation Rails */}
          <nav className="p-3 space-y-1">
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4 shrink-0" />
              Operational Desk
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === 'teachers'
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              Faculty Members
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === 'rooms'
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              Room Facilities
            </button>

            <button
              onClick={() => setActiveTab('batches')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === 'batches'
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              Student Cohorts
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === 'courses'
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              Syllabus Curriculum
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              Routine Generator
            </button>

            <button
              onClick={() => setActiveTab('viewer')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === 'viewer'
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              Schedules Matrix
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              AI Audit Analyst
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded transition cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart className="w-4 h-4 shrink-0" />
              Operational Reports
            </button>

          </nav>
        </div>

        {/* User profile bottom rail */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/50 flex flex-col gap-2">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-gray-700 font-mono select-none">
              AD
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-gray-800 leading-none">System Admin</span>
              <span className="block text-[9px] text-emerald-600 mt-0.5 font-bold uppercase">Terminal Active</span>
            </div>
          </div>

          <button
            onClick={handleLogOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition mt-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Disconnect Admin
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-8 space-y-6 print:p-0 print:bg-white bg-[#F9FAFC]">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'teachers' && <TeachersTab />}
        {activeTab === 'rooms' && <RoomsTab />}
        {activeTab === 'batches' && <BatchesTab />}
        {activeTab === 'courses' && <CoursesTab />}
        {activeTab === 'generator' && (
          <RoutineGeneratorTab
            onRoutineGenerated={checkExistingRoutines}
            hasExistingRoutines={hasRoutines}
          />
        )}
        {activeTab === 'viewer' && <RoutineViewerTab />}
        {activeTab === 'ai' && <AiAnalysisTab hasRoutines={hasRoutines} />}
        {activeTab === 'reports' && <ReportsTab />}
      </main>

    </div>
  );
}
