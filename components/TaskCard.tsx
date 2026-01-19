import React, { useState } from 'react';
import { Task } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { Wand2, MoreVertical, Trash2, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEnhance: (taskId: string) => void;
  isEnhancing: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart, onDelete, onEnhance, isEnhancing }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className="group relative bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        <div className="relative">
          <button 
            onClick={() => setShowActions(!showActions)}
            className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-6 z-10 bg-white border border-slate-200 shadow-xl rounded-md w-40 py-1 flex flex-col">
               <button
                onClick={() => {
                  onEnhance(task.id);
                  setShowActions(false);
                }}
                disabled={isEnhancing}
                className="text-left px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 disabled:opacity-50 font-medium"
              >
                <Wand2 size={14} />
                {isEnhancing ? 'Thinking...' : 'AI Enhance'}
              </button>
              <button
                onClick={() => {
                  onDelete(task.id);
                  setShowActions(false);
                }}
                className="text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-bold text-slate-900 mb-1 leading-tight text-base">{task.title}</h3>
      <p className="text-slate-700 text-sm mb-3 line-clamp-3 font-medium">{task.description || "No description provided."}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {task.tags?.map((tag, idx) => (
          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs rounded-md border border-slate-200 font-semibold">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-100 pt-2 mt-2 font-medium">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
        {isEnhancing && <span className="text-indigo-600 animate-pulse font-bold">AI Working...</span>}
      </div>
    </div>
  );
};