import { generateTimetable, validateTimetable } from '../engine/generator';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export default function ValidationPage() {
  const tt = generateTimetable();
  const result = validateTimetable(tt);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Timetable Validation</h2>
        <p className="text-gray-500 text-sm mt-1">
          Automated constraint checks across all 16 classes.
        </p>
      </div>

      {/* Overall status */}
      <div className={`rounded-xl border p-5 ${result.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-3">
          {result.valid
            ? <CheckCircle className="w-8 h-8 text-green-500" />
            : <XCircle className="w-8 h-8 text-red-500" />}
          <div>
            <div className={`text-lg font-bold ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
              {result.valid ? 'All Constraints Satisfied' : `${result.errors.length} Constraint Violation${result.errors.length !== 1 ? 's' : ''}`}
            </div>
            <div className={`text-sm ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
              {result.warnings.length} warning{result.warnings.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Constraints being checked */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Constraints Enforced
        </h3>
        <ul className="space-y-1.5 text-sm text-gray-700">
          {[
            'Math: exactly 1 period per day, must be in Period 1, 2, or 3',
            'Math: 5 periods per week per class',
            'Science Lab: fixed day/period assignments per standard',
            'Science Lab: 2 consecutive periods per visit (no break between)',
            'Block Room: 2 consecutive periods on the same day',
            'Block Room: not on the same day as Science Lab',
            'Theme: not on Science Lab day or Block Room day',
            'Computer Lab: not on Thursday',
            'Computer Lab: maximum 1 class at a time',
            'Library: maximum 1 class at a time',
            'Nature Club: maximum 1 class at a time',
            'Sanskrit: 2 periods per class per week (1 shared teacher)',
            'Hindi: 4 periods per class per week (3 teachers, assigned classes)',
            'English: 4 periods per class per week',
            'No teacher double-booking (same teacher in 2 classes simultaneously)',
          ].map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-green-500 shrink-0" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Errors ({result.errors.length})
          </h3>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {result.errors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded p-2">
                <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-5">
          <h3 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Warnings ({result.warnings.length})
          </h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {result.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 rounded p-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {w}
              </div>
            ))}
          </div>
        </div>
      )}

      {result.valid && result.warnings.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center text-green-700 font-semibold">
          No errors or warnings. The timetable fully satisfies all constraints.
        </div>
      )}
    </div>
  );
}
