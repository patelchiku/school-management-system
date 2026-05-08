import { useState } from 'react';
import { ClassId, ClassSchedule, Day, DAYS, PERIODS, PERIOD_TIMINGS, TimetableSlot } from '../types';
import SubjectBadge from './SubjectBadge';

interface Props {
  classId: ClassId;
  schedule: ClassSchedule;
  showTeacher?: boolean;
}

const BREAK_AFTER: Record<number, { label: string; time: string }> = {
  2: { label: '☕ Break', time: '9:15 – 9:40' },
  5: { label: '☕ Break', time: '11:25 – 11:40' },
};

const DAY_SHORT: Record<Day, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri',
};

// ─── Mobile: single-day list view ────────────────────────────────────────────

function MobileRow({ label, time, bg, children }: {
  label: string; time: string; bg?: string; children: React.ReactNode;
}) {
  return (
    <div className={`flex items-stretch border-b border-gray-100 last:border-b-0 ${bg ?? 'bg-white'}`}>
      <div className="w-20 shrink-0 p-2 border-r border-gray-100 flex flex-col justify-center">
        <div className="font-semibold text-gray-800 text-xs leading-tight">{label}</div>
        <div className="text-gray-400 text-[10px] mt-0.5">{time}</div>
      </div>
      <div className="flex-1 p-1.5 flex items-center">{children}</div>
    </div>
  );
}

function MobileView({ schedule, showTeacher }: { schedule: ClassSchedule; showTeacher: boolean }) {
  const [day, setDay] = useState<Day>('Monday');

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Day tabs */}
      <div className="flex bg-gray-800">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={`flex-1 py-2 text-xs font-semibold transition-colors
              ${d === day ? 'bg-white text-blue-800' : 'text-gray-300 hover:bg-gray-700'}`}
          >
            {DAY_SHORT[d]}
          </button>
        ))}
      </div>

      {/* Rows for selected day */}
      <div>
        {/* Home Period */}
        <MobileRow label="Home" time="7:25–7:45" bg="bg-gray-50">
          <div className="w-full h-8 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500 font-medium">
            Home Period
          </div>
        </MobileRow>

        {/* Prayer */}
        <MobileRow label="Prayer" time="7:45–8:05" bg="bg-amber-50">
          <div className="w-full h-8 flex items-center justify-center bg-amber-100 rounded text-xs text-amber-700 font-medium">
            🙏 Prayer
          </div>
        </MobileRow>

        {PERIODS.map((period) => {
          const timing = PERIOD_TIMINGS.find((t) => t.period === period)!;
          const slot = schedule[day][period];
          return (
            <>
              <MobileRow key={period} label={`P${period}`} time={`${timing.start}–${timing.end}`}>
                {slot
                  ? <SubjectBadge slot={slot} showTeacher={showTeacher} />
                  : <div className="text-gray-300 text-xs pl-1">—</div>}
              </MobileRow>

              {BREAK_AFTER[period] && (
                <div key={`brk-${period}`} className="flex items-center bg-gray-100 border-b border-gray-200 px-3 py-1.5">
                  <span className="text-[10px] text-gray-400 italic">
                    {BREAK_AFTER[period].label} &nbsp;·&nbsp; {BREAK_AFTER[period].time}
                  </span>
                </div>
              )}
            </>
          );
        })}

        {/* Home Period 2 */}
        <MobileRow label="Home" time="12:50–13:05" bg="bg-gray-50">
          <div className="w-full h-8 flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500 font-medium">
            Home Period
          </div>
        </MobileRow>
      </div>
    </div>
  );
}

// ─── Desktop: full 5-day table ────────────────────────────────────────────────

function DesktopView({ schedule, showTeacher }: { schedule: ClassSchedule; showTeacher: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm print:shadow-none">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="w-28 p-2 text-left font-medium text-xs border-r border-gray-700">Period</th>
            {DAYS.map((day) => (
              <th key={day} className="p-2 text-center font-semibold border-r border-gray-700 last:border-r-0 min-w-[120px]">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Home Period */}
          <tr className="bg-gray-50 border-b border-gray-200">
            <td className="p-2 border-r border-gray-200">
              <div className="font-medium text-gray-700 text-xs">Home Period</div>
              <div className="text-gray-400 text-[10px]">7:25 – 7:45</div>
            </td>
            {DAYS.map((day) => (
              <td key={day} className="p-1 border-r border-gray-200 last:border-r-0 h-10">
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500 font-medium">
                  Home Period
                </div>
              </td>
            ))}
          </tr>

          {/* Prayer */}
          <tr className="bg-amber-50 border-b border-gray-200">
            <td className="p-2 border-r border-gray-200">
              <div className="font-medium text-gray-700 text-xs">Prayer</div>
              <div className="text-gray-400 text-[10px]">7:45 – 8:05</div>
            </td>
            {DAYS.map((day) => (
              <td key={day} className="p-1 border-r border-gray-200 last:border-r-0 h-10">
                <div className="w-full h-full flex items-center justify-center bg-amber-100 rounded text-xs text-amber-700 font-medium">
                  🙏 Prayer
                </div>
              </td>
            ))}
          </tr>

          {PERIODS.map((period) => {
            const timing = PERIOD_TIMINGS.find((t) => t.period === period)!;
            return (
              <>
                <tr key={period} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                  <td className="p-2 border-r border-gray-200 bg-white">
                    <div className="font-semibold text-gray-800 text-xs">P{period}</div>
                    <div className="text-gray-400 text-[10px]">{timing.start} – {timing.end}</div>
                  </td>
                  {DAYS.map((day) => {
                    const s = schedule[day][period];
                    return (
                      <td key={day} className="p-1 border-r border-gray-200 last:border-r-0 h-14">
                        {s
                          ? <SubjectBadge slot={s} showTeacher={showTeacher} />
                          : <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">—</div>}
                      </td>
                    );
                  })}
                </tr>
                {BREAK_AFTER[period] && (
                  <tr key={`break-${period}`} className="border-b border-gray-200">
                    <td className="p-1.5 border-r border-gray-200 bg-gray-100">
                      <div className="font-medium text-gray-500 text-[10px]">{BREAK_AFTER[period].label}</div>
                      <div className="text-gray-400 text-[9px]">{BREAK_AFTER[period].time}</div>
                    </td>
                    {DAYS.map((day) => (
                      <td key={day} className="p-1 border-r border-gray-200 last:border-r-0 bg-gray-100">
                        <div className="w-full h-6 flex items-center justify-center text-[10px] text-gray-400 italic">
                          {BREAK_AFTER[period].label}
                        </div>
                      </td>
                    ))}
                  </tr>
                )}
              </>
            );
          })}

          {/* Home Period 2 */}
          <tr className="bg-gray-50">
            <td className="p-2 border-r border-gray-200">
              <div className="font-medium text-gray-700 text-xs">Home Period</div>
              <div className="text-gray-400 text-[10px]">12:50 – 13:05</div>
            </td>
            {DAYS.map((day) => (
              <td key={day} className="p-1 border-r border-gray-200 last:border-r-0 h-10">
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500 font-medium">
                  Home Period
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export default function TimetableGrid({ classId: _classId, schedule, showTeacher = true }: Props) {
  return (
    <>
      <div className="md:hidden">
        <MobileView schedule={schedule} showTeacher={showTeacher} />
      </div>
      <div className="hidden md:block">
        <DesktopView schedule={schedule} showTeacher={showTeacher} />
      </div>
    </>
  );
}
