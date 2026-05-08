import { SubjectName, SUBJECT_COLORS, TimetableSlot } from '../types';

interface Props {
  slot: TimetableSlot;
  showTeacher?: boolean;
  compact?: boolean;
}

const SUBJECT_SHORT: Record<SubjectName, string> = {
  'Math':         'Math',
  'English':      'Eng',
  'Theme':        'Theme',
  'Science Lab':  'Sci Lab',
  'Computer Lab': 'Comp Lab',
  'Block Room':   'Block Rm',
  'Nature Club':  'Nature',
  'Library':      'Library',
  'Sanskrit':     'Sanskrit',
  'Hindi':        'Hindi',
  'Free':         'Free',
};

export default function SubjectBadge({ slot, showTeacher = true, compact = false }: Props) {
  const { bg, text, border } = SUBJECT_COLORS[slot.subject];

  if (slot.subject === 'Free') {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs italic">
        —
      </div>
    );
  }

  return (
    <div
      className={`
        w-full h-full flex flex-col items-center justify-center gap-0.5
        rounded border ${bg} ${text} ${border}
        ${slot.isBlockStart ? 'rounded-b-none border-b-0' : ''}
        ${slot.isBlockContinuation ? 'rounded-t-none border-t-0' : ''}
      `}
    >
      <span className={`font-semibold leading-tight text-center ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {compact ? SUBJECT_SHORT[slot.subject] : slot.subject}
      </span>
      {showTeacher && !compact && (
        <span className="text-[9px] leading-tight opacity-70 text-center px-1">
          {slot.teacherLabel}
        </span>
      )}
      {slot.room && !compact && (
        <span className="text-[8px] opacity-50">{slot.room}</span>
      )}
    </div>
  );
}
