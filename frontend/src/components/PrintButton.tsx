import { Printer } from 'lucide-react';

interface Props {
  label?: string;
}

export default function PrintButton({ label = 'Print Timetable' }: Props) {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm print:hidden"
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  );
}
