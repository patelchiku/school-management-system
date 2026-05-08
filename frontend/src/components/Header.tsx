import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, LayoutDashboard, BookOpen, AlertCircle } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
  { to: '/class', label: 'Class Timetable', shortLabel: 'Classes', icon: Calendar },
  { to: '/teacher', label: 'Teacher Schedule', shortLabel: 'Teachers', icon: Users },
  { to: '/validation', label: 'Validation', shortLabel: 'Validate', icon: AlertCircle },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <>
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-lg print:hidden">
        <div className="max-w-screen-2xl mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center gap-3 py-3 border-b border-blue-600">
            <div className="flex items-center justify-center w-9 h-9 bg-white/20 rounded-lg shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-bold leading-tight truncate">
                School Management System
              </h1>
              <p className="text-blue-200 text-xs truncate">
                Timetable • Classes 1–4 • Academic Year 2025–26
              </p>
            </div>
          </div>

          {/* Desktop nav (hidden on mobile — replaced by bottom tab bar) */}
          <nav className="hidden md:flex gap-1 py-1">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${active ? 'bg-white text-blue-800' : 'text-blue-100 hover:bg-blue-600'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 flex md:hidden bg-blue-900 border-t border-blue-700 z-50 print:hidden safe-area-inset-bottom">
        {NAV.map(({ to, shortLabel, icon: Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`
                flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors
                ${active ? 'text-white bg-blue-700' : 'text-blue-300 hover:text-white'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
