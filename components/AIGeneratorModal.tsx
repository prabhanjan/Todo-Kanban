import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { generateTasksFromGoal } from '../services/geminiService';
import { AITaskSuggestion } from '../types';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksGenerated: (tasks: AITaskSuggestion[]) => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({ isOpen, onClose, onTasksGenerated }) => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    try {
      const tasks = await generateTasksFromGoal(goal);
      onTasksGenerated(tasks);
      setGoal('');
      onClose();
    } catch (error) {
      console.error("Failed to generate", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="flex justify-between items-center p-6 pb-2">
            <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles size={24} />
                <h2 className="text-xl font-bold text-slate-900">AI Project Planner</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
            </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 pt-4">
          <p className="text-slate-600 mb-4">
            Describe your project or goal, and Gemini will generate a prioritized Kanban board structure for you.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">What are you working on?</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none text-slate-700"
              placeholder="e.g., Plan a company retreat, Build a mobile app MVP, Organize a wedding..."
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3">
             <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !goal.trim()}
              className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-medium shadow-md shadow-indigo-200 hover:shadow-lg disabled:opacity-70 flex items-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
