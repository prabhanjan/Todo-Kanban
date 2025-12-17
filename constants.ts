import { ColumnDef } from './types';

export const COLUMNS: ColumnDef[] = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100 border-slate-200' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-50 border-blue-200' },
  { id: 'review', title: 'Review', color: 'bg-purple-50 border-purple-200' },
  { id: 'done', title: 'Done', color: 'bg-green-50 border-green-200' },
];

export const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};
