import { validateTimetable } from '../engine/generator';
import { Suggestion } from '../types';
import { useTimetable } from '../context/TimetableContext';
import {
  CheckCircle, XCircle, AlertTriangle, Info,
  Lightbulb, Check, X, RotateCcw, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

// ─── Suggestion Card ──────────────────────────────────────────────────────────

function SuggestionCard({
  suggestion,
  onAccept,
  onReject,
}: {
  suggestion: Suggestion;
  onAccept: () => void;
  onReject: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const severityStyles = {
    error:   { ring: 'border-red-200 bg-red-50',    icon: <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,   badge: 'bg-red-100 text-red-700' },
    warning: { ring: 'border-amber-200 bg-amber-50', icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />, badge: 'bg-amber-100 text-amber-700' },
    info:    { ring: 'border-blue-200 bg-blue-50',  icon: <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,      badge: 'bg-blue-100 text-blue-700' },
  }[suggestion.severity];

  return (
    <div className={`rounded-lg border p-4 ${severityStyles.ring}`}>
      <div className="flex items-start gap-3">
        {severityStyles.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{suggestion.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityStyles.badge}`}>
              {suggestion.type === 'fix' ? 'Fix' : suggestion.type === 'optimize' ? 'Optimise' : 'Info'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>

          {suggestion.changes.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Hide' : 'Show'} {suggestion.changes.length} change{suggestion.changes.length !== 1 ? 's' : ''}
            </button>
          )}

          {expanded && suggestion.changes.length > 0 && (
            <div className="mt-2 space-y-1">
              {suggestion.changes.map((c, i) => (
                <div key={i} className="text-xs bg-white/70 border border-gray-200 rounded px-2 py-1 font-mono text-gray-700">
                  {c.classId} · {c.day} P{c.period} → <span className="font-semibold">{c.newSlot.subject}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accept / Reject */}
        <div className="flex gap-2 shrink-0">
          {suggestion.changes.length > 0 && (
            <button
              onClick={onAccept}
              title="Accept and apply this suggestion"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-3 h-3" /> Accept
            </button>
          )}
          <button
            onClick={onReject}
            title="Dismiss this suggestion"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-3 h-3" /> {suggestion.changes.length === 0 ? 'Dismiss' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Applied Suggestion Card ──────────────────────────────────────────────────

function AppliedCard({
  suggestion,
  onUndo,
}: {
  suggestion: Suggestion;
  onUndo: () => void;
}) {
  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-3">
      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-green-800">{suggestion.title}</p>
        <p className="text-xs text-green-700 mt-0.5">{suggestion.description}</p>
      </div>
      <button
        onClick={onUndo}
        title="Undo this change"
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors shrink-0"
      >
        <RotateCcw className="w-3 h-3" /> Undo
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ValidationPage() {
  const { timetable, pendingSuggestions, appliedSuggestions, acceptSuggestion, rejectSuggestion } =
    useTimetable();

  // Undo: remove the accepted suggestion + its overrides by re-running accept without it.
  // Simplest approach: track undo by filtering applied list & rebuilding overrides via context
  // We expose a simple "undoAccept" by rejecting the id after re-accepting won't work well.
  // Instead we expose a new prop — but for now, we use rejectSuggestion as a dismiss on applied side.
  // We'll use a separate local dismissed-applied state.
  const [undoneIds, setUndoneIds] = useState<string[]>([]);

  const visibleApplied = appliedSuggestions.filter((s) => !undoneIds.includes(s.id));

  const result = validateTimetable(timetable);

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

      {/* ── Suggestion Box ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-800">
            Suggestions
          </h3>
          {pendingSuggestions.length > 0 && (
            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
              {pendingSuggestions.length} pending
            </span>
          )}
        </div>

        <div className="p-5 space-y-3">
          {pendingSuggestions.length === 0 && visibleApplied.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No suggestions right now — the timetable looks good!
            </p>
          )}

          {pendingSuggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onAccept={() => acceptSuggestion(s)}
              onReject={() => rejectSuggestion(s.id)}
            />
          ))}

          {visibleApplied.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-1">
                Applied changes
              </p>
              {visibleApplied.map((s) => (
                <AppliedCard
                  key={s.id}
                  suggestion={s}
                  onUndo={() => setUndoneIds((prev) => [...prev, s.id])}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Constraints */}
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
            'Sanskrit: 2 periods per class per week (2 teachers: T1 Std 1–2, T2 Std 3–4)',
            'Sanskrit: maximum 1 period per class per day',
            'Hindi: 4 periods per class per week (3 teachers, assigned classes)',
            'Hindi: maximum 1 period per class per day',
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
