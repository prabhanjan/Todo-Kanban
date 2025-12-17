import React from 'react';
import { Task, Status } from '../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface ColumnProps {
  id: Status;
  title: string;
  colorClass: string;
  tasks: Task[];
  onDrop: (e: React.DragEvent<HTMLDivElement>, status: Status) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEnhanceTask: (taskId: string) => void;
  onAddTask: (status: Status) => void;
  enhancingTaskIds: Set<string>;
}

export const Column: React.FC<ColumnProps> = ({
  id,
  title,
  colorClass,
  tasks,
  onDrop,
  onDragOver,
  onDragStart,
  onDeleteTask,
  onEnhanceTask,
  onAddTask,
  enhancingTaskIds,
}) => {
  return (
    <div
      className={`flex flex-col min-w-[300px] w-full md:w-[350px] rounded-xl h-full max-h-full ${colorClass} transition-colors`}
      onDrop={(e) => onDrop(e, id)}
      onDragOver={onDragOver}
    >
      <div className="p-4 flex justify-between items-center border-b border-black/5">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-700">{title}</h2>
          <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-medium text-slate-600">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(id)}
          className="p-1.5 hover:bg-white/50 rounded-md text-slate-600 transition-colors"
          title="Add Task"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 no-scrollbar space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={onDragStart}
            onDelete={onDeleteTask}
            onEnhance={onEnhanceTask}
            isEnhancing={enhancingTaskIds.has(task.id)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm">
            Drop items here
          </div>
        )}
      </div>
    </div>
  );
};
