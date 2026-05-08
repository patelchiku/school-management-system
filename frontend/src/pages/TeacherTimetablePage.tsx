import { useState } from 'react';
import { generateTimetable, getTeacherSchedule } from '../engine/generator';
import { ALL_TEACHERS } from '../data/schoolConfig';
import { DAYS, PERIODS, PERIOD_TIMINGS, SUBJECT_COLORS, SubjectName } from '../types';
import PrintButton from '../components/PrintButton';

export default function TeacherTimetablePage() {
  const [teacherId, setTeacherId] = useState(ALL_TEACHERS[0].id);
  const tt = generateTimetable();

  const teacher = ALL_TEACHERS.find((t) => t.id === teacherId)!;
  const schedule = getTeacherSchedule(tt, teacherId);

  // Build a lookup: day+period → { classId, subject }
  const lookup = new Map(
    schedule.map((e) => [`${e.day}-${e.period}`, e]),
  );

  // Period count per subject
  const subjectCount: Partial<Record<SubjectName, number>> = {};
  for (const e of schedule) subjectCount[e.subject] = (subjectCount[e.subject] ?? 0) + 1;

  const totalPeriods = schedule.filter((e) => e.subject !== 'Free').length;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teacher Schedule</h2>
          <p className="text-gray-500 text-sm">View which classes each teacher is assigned to.</p>
        </div>
        <PrintButton label="Print Teacher Schedule" />
      </div>

      {/* Teacher selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 print:hidden">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Select Teacher
        </div>

        <div className="space-y-4">
          {/* Class Teachers */}
          <div>
            <div className="text-xs text-gray-400 mb-2 font-medium">Class Teachers (16)</div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TEACHERS.filter((t) => t.subject === 'Class Teacher').map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTeacherId(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                    ${teacherId === t.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}
                >
                  {t.classes[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Teachers */}
          <div>
            <div className="text-xs text-gray-400 mb-2 font-medium">Subject Teachers (5)</div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TEACHERS.filter((t) => t.subject !== 'Class Teacher').map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTeacherId(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                    ${teacherId === t.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher info */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <h3 className="text-lg font-bold text-gray-800">{teacher.label}</h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
          {teacher.subject}
        </span>
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
          {teacher.classes.length} class{teacher.classes.length !== 1 ? 'es' : ''}
        </span>
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
          {totalPeriods} periods/week
        </span>
      </div>

      {/* Schedule table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="w-28 p-2 text-left text-xs font-medium border-r border-gray-700">
                Period
              </th>
              {DAYS.map((d) => (
                <th key={d} className="p-2 text-center font-semibold border-r border-gray-700 last:border-r-0 min-w-[130px]">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((p) => {
              const timing = PERIOD_TIMINGS.find((t) => t.period === p)!;
              return (
                <tr key={p} className="border-b border-gray-200 hover:bg-gray-50/50">
                  <td className="p-2 border-r border-gray-200 bg-white">
                    <div className="font-semibold text-gray-800 text-xs">P{p}</div>
                    <div className="text-gray-400 text-[10px]">{timing.start} – {timing.end}</div>
                  </td>
                  {DAYS.map((d) => {
                    const entry = lookup.get(`${d}-${p}`);
                    if (!entry) {
                      return (
                        <td key={d} className="p-1 border-r border-gray-200 last:border-r-0 h-14">
                          <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">—</div>
                        </td>
                      );
                    }
                    const { bg, text, border } = SUBJECT_COLORS[entry.subject];
                    return (
                      <td key={d} className="p-1 border-r border-gray-200 last:border-r-0 h-14">
                        <div className={`w-full h-full flex flex-col items-center justify-center rounded border text-center ${bg} ${text} ${border}`}>
                          <span className="text-xs font-bold">{entry.classId}</span>
                          <span className="text-[10px] opacity-80">{entry.subject}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Subject breakdown */}
      {Object.keys(subjectCount).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 print:hidden">
          <h3 className="font-semibold text-gray-800 mb-3">Weekly Load Breakdown</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(subjectCount) as [SubjectName, number][])
              .filter(([s]) => s !== 'Free')
              .map(([sub, n]) => {
                const { bg, text, border } = SUBJECT_COLORS[sub];
                return (
                  <div key={sub} className={`rounded-lg border px-3 py-2 text-center ${bg} ${border}`}>
                    <div className={`text-sm font-semibold ${text}`}>{sub}</div>
                    <div className={`text-xl font-bold ${text}`}>{n}</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
