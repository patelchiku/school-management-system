import { generateTimetable, validateTimetable } from '../engine/generator';
import { ALL_CLASSES, DAYS, PERIODS, SubjectName, SUBJECT_COLORS, WEEKLY_REQUIREMENTS } from '../types';
import { Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';

const SUBJECT_LIST = Object.keys(WEEKLY_REQUIREMENTS).filter(
  (k) => WEEKLY_REQUIREMENTS[k as SubjectName] > 0,
) as SubjectName[];

export default function DashboardPage() {
  const tt = generateTimetable();
  const validation = validateTimetable(tt);

  // Count total periods per subject across all classes
  const subjectTotals: Partial<Record<SubjectName, number>> = {};
  for (const c of ALL_CLASSES)
    for (const d of DAYS)
      for (const p of PERIODS) {
        const sub = tt[c][d][p]?.subject;
        if (sub && sub !== 'Free') subjectTotals[sub] = (subjectTotals[sub] ?? 0) + 1;
      }

  const stats = [
    { label: 'Classes', value: '16', sub: 'Standards 1–4, Sections A·B·G·D', color: 'blue' },
    { label: 'Subjects', value: '10', sub: 'Math · English · Theme · Labs · more', color: 'green' },
    { label: 'Teachers', value: '21', sub: '16 class teachers + 5 subject teachers', color: 'purple' },
    {
      label: 'Status',
      value: validation.valid ? 'Valid' : `${validation.errors.length} issues`,
      sub: validation.valid ? 'All constraints satisfied' : 'See Validation tab',
      color: validation.valid ? 'teal' : 'red',
    },
  ];

  const colorMap: Record<string, string> = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    teal:   'bg-teal-50 border-teal-200 text-teal-700',
    red:    'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Timetable Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Auto-generated timetable for the current academic session. Monday–Friday, Periods 1–7.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((st) => (
          <div
            key={st.label}
            className={`rounded-xl border p-4 ${colorMap[st.color]}`}
          >
            <div className="text-2xl font-bold">{st.value}</div>
            <div className="text-sm font-semibold mt-0.5">{st.label}</div>
            <div className="text-xs opacity-70 mt-1">{st.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/class"
          className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Class Timetable</div>
            <div className="text-sm text-gray-500">View weekly schedule for any class</div>
          </div>
        </Link>

        <Link
          to="/teacher"
          className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Teacher Schedule</div>
            <div className="text-sm text-gray-500">View workload for each teacher</div>
          </div>
        </Link>
      </div>

      {/* Daily schedule overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Daily Schedule Structure
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {[
            { t: '7:25–7:45', l: 'Home Period', c: 'bg-gray-100 text-gray-600' },
            { t: '7:45–8:05', l: 'Prayer', c: 'bg-amber-100 text-amber-700' },
            { t: '8:05–8:40', l: 'Period 1', c: 'bg-blue-50 text-blue-700' },
            { t: '8:40–9:15', l: 'Period 2', c: 'bg-blue-50 text-blue-700' },
            { t: '9:15–9:40', l: '☕ Break', c: 'bg-orange-50 text-orange-500 italic' },
            { t: '9:40–10:15', l: 'Period 3', c: 'bg-blue-50 text-blue-700' },
            { t: '10:15–10:50', l: 'Period 4', c: 'bg-blue-50 text-blue-700' },
            { t: '10:50–11:25', l: 'Period 5', c: 'bg-blue-50 text-blue-700' },
            { t: '11:25–11:40', l: '☕ Break', c: 'bg-orange-50 text-orange-500 italic' },
            { t: '11:40–12:15', l: 'Period 6', c: 'bg-blue-50 text-blue-700' },
            { t: '12:15–12:50', l: 'Period 7', c: 'bg-blue-50 text-blue-700' },
            { t: '12:50–13:05', l: 'Home Period', c: 'bg-gray-100 text-gray-600' },
          ].map((row) => (
            <div key={row.t} className={`rounded-lg p-2 text-center ${row.c}`}>
              <div className="font-semibold">{row.l}</div>
              <div className="opacity-70 text-[10px] mt-0.5">{row.t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Subject Coverage (All Classes)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {SUBJECT_LIST.map((sub) => {
            const { bg, text, border } = SUBJECT_COLORS[sub];
            const total = subjectTotals[sub] ?? 0;
            const expected = WEEKLY_REQUIREMENTS[sub] * ALL_CLASSES.length;
            const ok = total >= expected;
            return (
              <div
                key={sub}
                className={`rounded-lg border p-3 ${bg} ${border}`}
              >
                <div className={`text-sm font-semibold ${text}`}>{sub}</div>
                <div className={`text-xl font-bold ${text}`}>{total}</div>
                <div className={`text-xs opacity-60 ${text}`}>
                  {ok ? '✓' : '⚠'} {WEEKLY_REQUIREMENTS[sub]}×16={expected} expected
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          {validation.valid
            ? <CheckCircle className="w-4 h-4 text-green-500" />
            : <XCircle className="w-4 h-4 text-red-500" />}
          Constraint Validation
        </h3>
        {validation.valid ? (
          <p className="text-green-600 text-sm font-medium">
            All constraints satisfied. Timetable is valid.
          </p>
        ) : (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {validation.errors.slice(0, 20).map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-600">
                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                {e}
              </div>
            ))}
            {validation.warnings.slice(0, 10).map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-600">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                {w}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
