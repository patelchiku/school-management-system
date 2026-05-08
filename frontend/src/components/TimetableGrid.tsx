import { ClassId, ClassSchedule, DAYS, PERIODS, PERIOD_TIMINGS, TimetableSlot } from '../types';
import SubjectBadge from './SubjectBadge';

interface Props {
  classId: ClassId;
  schedule: ClassSchedule;
  showTeacher?: boolean;
}

// Fixed rows that appear every day regardless of class
const FIXED_ROWS = [
  { label: 'Home Period', time: '7:25 – 7:45', bg: 'bg-gray-100' },
  { label: 'Prayer', time: '7:45 – 8:05', bg: 'bg-amber-50' },
];

const BREAK_AFTER: Record<number, { label: string; time: string }> = {
  2: { label: '☕ Break', time: '9:15 – 9:40' },
  5: { label: '☕ Break', time: '11:25 – 11:40' },
};

export default function TimetableGrid({ classId, schedule, showTeacher = true }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm print:shadow-none">
      <table className="w-full border-collapse text-sm">
        {/* Header */}
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="w-28 p-2 text-left font-medium text-xs border-r border-gray-700">
              Period
            </th>
            {DAYS.map((day) => (
              <th key={day} className="p-2 text-center font-semibold border-r border-gray-700 last:border-r-0 min-w-[120px]">
                {day}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Fixed: Home Period */}
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

          {/* Fixed: Prayer */}
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

          {/* Periods 1–7 with breaks */}
          {PERIODS.map((period) => {
            const timing = PERIOD_TIMINGS.find((t) => t.period === period)!;
            const slot: Record<string, TimetableSlot | undefined> = {};
            for (const d of DAYS) slot[d] = schedule[d][period];

            return (
              <>
                <tr key={period} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                  <td className="p-2 border-r border-gray-200 bg-white">
                    <div className="font-semibold text-gray-800 text-xs">P{period}</div>
                    <div className="text-gray-400 text-[10px]">
                      {timing.start} – {timing.end}
                    </div>
                  </td>
                  {DAYS.map((day) => {
                    const s = schedule[day][period];
                    return (
                      <td key={day} className="p-1 border-r border-gray-200 last:border-r-0 h-14">
                        {s ? (
                          <SubjectBadge slot={s} showTeacher={showTeacher} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Insert break row after P2 and P5 */}
                {BREAK_AFTER[period] && (
                  <tr key={`break-${period}`} className="border-b border-gray-200">
                    <td className="p-1.5 border-r border-gray-200 bg-gray-100">
                      <div className="font-medium text-gray-500 text-[10px]">
                        {BREAK_AFTER[period].label}
                      </div>
                      <div className="text-gray-400 text-[9px]">
                        {BREAK_AFTER[period].time}
                      </div>
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

          {/* Fixed: Home Period 2 */}
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
