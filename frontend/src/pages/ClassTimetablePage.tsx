import { useState } from 'react';
import { generateTimetable } from '../engine/generator';
import { ALL_CLASSES, ClassId, DAYS, PERIODS, SubjectName, SUBJECT_COLORS } from '../types';
import TimetableGrid from '../components/TimetableGrid';
import PrintButton from '../components/PrintButton';
import { Info } from 'lucide-react';

const STANDARDS = [1, 2, 3, 4];
const SECTIONS = ['A', 'B', 'G', 'D'];

// Subject count for the selected class
function subjectCount(
  schedule: ReturnType<typeof generateTimetable>[ClassId],
): Partial<Record<SubjectName, number>> {
  const counts: Partial<Record<SubjectName, number>> = {};
  for (const d of DAYS)
    for (const p of PERIODS) {
      const sub = schedule[d][p]?.subject;
      if (sub) counts[sub] = (counts[sub] ?? 0) + 1;
    }
  return counts;
}

export default function ClassTimetablePage() {
  const [selected, setSelected] = useState<ClassId>('1A');
  const tt = generateTimetable();

  const schedule = tt[selected];
  const counts = subjectCount(schedule);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6 space-y-5">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Timetable</h2>
          <p className="text-gray-500 text-sm">Select a class to view its weekly timetable.</p>
        </div>
        <PrintButton label={`Print Class ${selected}`} />
      </div>

      {/* Class picker */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 print:hidden">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Select Class
        </div>
        <div className="space-y-3">
          {STANDARDS.map((std) => (
            <div key={std} className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-600 w-16">Std {std}</span>
              <div className="flex gap-2">
                {SECTIONS.map((sec) => {
                  const id = `${std}${sec}` as ClassId;
                  const active = id === selected;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelected(id)}
                      className={`
                        w-14 h-10 rounded-lg text-sm font-semibold border transition-all
                        ${active
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:text-blue-600'}
                      `}
                    >
                      {id}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print header (only in print mode) */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold">Class {selected} – Weekly Timetable</h1>
        <p className="text-sm text-gray-600">School Management System • Academic Year 2025–26</p>
      </div>

      {/* Timetable grid */}
      <div>
        <div className="flex items-center gap-2 mb-3 print:hidden">
          <h3 className="text-lg font-bold text-gray-800">Class {selected}</h3>
          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            Standard {selected[0]} · Section {selected[1]}
          </span>
        </div>
        <TimetableGrid classId={selected} schedule={schedule} showTeacher />
      </div>

      {/* Weekly summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 print:hidden">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Weekly Period Summary – Class {selected}</h3>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {(Object.entries(counts) as [SubjectName, number][])
            .filter(([sub]) => sub !== 'Free')
            .sort(([, a], [, b]) => b - a)
            .map(([sub, n]) => {
              const { bg, text, border } = SUBJECT_COLORS[sub];
              return (
                <div key={sub} className={`rounded-lg border p-2 text-center ${bg} ${border}`}>
                  <div className={`text-xs font-semibold ${text}`}>{sub}</div>
                  <div className={`text-xl font-bold ${text}`}>{n}</div>
                  <div className={`text-[10px] opacity-60 ${text}`}>periods</div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 print:hidden">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Legend</h3>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(SUBJECT_COLORS) as [SubjectName, { bg: string; text: string; border: string }][])
            .filter(([sub]) => sub !== 'Free')
            .map(([sub, { bg, text, border }]) => (
              <div key={sub} className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${bg} ${text} ${border}`}>
                {sub}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
