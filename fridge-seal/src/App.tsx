import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Moon, Sun, LayoutDashboard, Briefcase, Users2, CalendarDays, Package2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import SchedulerPage from './pages/SchedulerPage';
import CustomersPage from './pages/CustomersPage';
import PartsPage from './pages/PartsPage';
import GlobalSearch from './components/GlobalSearch';
import { initSeed } from './services/db';

function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return { dark, setDark };
}

function Shell() {
  const { dark, setDark } = useDarkMode();

  useEffect(() => {
    initSeed();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        const el = document.getElementById('global-search-input');
        el?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.getElementById('global-search-input');
        el?.focus();
      }
      if (e.key.toLowerCase() === 'n') {
        // open new job modal via custom event
        document.dispatchEvent(new CustomEvent('open-new-job'));
      }
      if ((e.key.toLowerCase() === 'j') && (e.shiftKey || (e.metaKey || e.ctrlKey))) {
        // not used
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/60 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="flex">
        <aside className="hidden md:flex md:flex-col w-60 p-4 gap-2 border-r border-slate-200 dark:border-white/10">
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
            <img src="/vite.svg" className="h-6" />
            FridgeSeal Pro
          </Link>
          <nav className="mt-4 flex flex-col gap-1">
            <Link to="/" className="btn-ghost"><LayoutDashboard className="h-4 w-4"/> Dashboard</Link>
            <Link to="/jobs" className="btn-ghost"><Briefcase className="h-4 w-4"/> Jobs</Link>
            <Link to="/scheduler" className="btn-ghost"><CalendarDays className="h-4 w-4"/> Scheduler</Link>
            <Link to="/customers" className="btn-ghost"><Users2 className="h-4 w-4"/> Customers</Link>
            <Link to="/parts" className="btn-ghost"><Package2 className="h-4 w-4"/> Parts</Link>
          </nav>
          <div className="mt-auto" />
          <button className="btn-ghost" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>} Toggle theme
          </button>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <GlobalSearch />
            <div className="md:hidden ml-auto">
              <button className="btn-ghost" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">
                {dark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
              </button>
            </div>
          </div>
          <div className="">
            <Routes>
              <Route path="/" element={<DashboardPage/>} />
              <Route path="/jobs" element={<JobsPage/>} />
              <Route path="/jobs/:id" element={<JobDetailPage/>} />
              <Route path="/scheduler" element={<SchedulerPage/>} />
              <Route path="/customers" element={<CustomersPage/>} />
              <Route path="/parts" element={<PartsPage/>} />
              <Route path="*" element={<Navigate to="/" replace/>} />
            </Routes>
          </div>
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}
