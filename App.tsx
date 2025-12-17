import React, { useState, useEffect } from 'react';
import { Task, Status, Priority, AITaskSuggestion } from './types';
import { COLUMNS } from './constants';
import { Column } from './components/Column';
import { CreateTaskModal } from './components/CreateTaskModal';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { enhanceTaskDescription } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Layout, Sparkles, Plus, Loader2, LogOut, User as UserIcon } from 'lucide-react';

// Helpers to map between DB schema (snake_case) and App types (camelCase)
const mapTaskFromDB = (row: any): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  priority: row.priority,
  status: row.status,
  tags: row.tags || [],
  createdAt: new Date(row.created_at).getTime(),
});

const mapTaskToDB = (task: Task, userId: string) => ({
  id: task.id,
  user_id: userId,
  title: task.title,
  description: task.description,
  priority: task.priority,
  status: task.status,
  tags: task.tags,
  created_at: new Date(task.createdAt).toISOString(),
});

const App: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [currentColumnForAdd, setCurrentColumnForAdd] = useState<Status>('todo');
  const [enhancingTaskIds, setEnhancingTaskIds] = useState<Set<string>>(new Set());
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Initial Load when User is present
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        setIsDataLoading(true);
        // RLS policy ensures we only get this user's tasks
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Error fetching tasks:", error);
        } else if (data) {
          setTasks(data.map(mapTaskFromDB));
        }
      } catch (err) {
        console.error("Unexpected error fetching tasks:", err);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: Status) => {
    e.preventDefault();
    if (draggedTaskId && user) {
      setTasks(prev => prev.map(t => 
        t.id === draggedTaskId ? { ...t, status } : t
      ));

      const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', draggedTaskId);
        
      if (error) console.error("Error updating task status:", error);
      setDraggedTaskId(null);
    }
  };

  const addTask = async (title: string, description: string, priority: Priority, status: Status) => {
    if (!user) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      priority,
      status,
      tags: [],
      createdAt: Date.now(),
    };

    setTasks(prev => [...prev, newTask]);

    const { error } = await supabase
      .from('tasks')
      .insert([mapTaskToDB(newTask, user.id)]);

    if (error) {
      console.error("Error creating task:", error);
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error("Error deleting task:", error);
      setTasks(previousTasks);
    }
  };

  const handleAIGeneratedTasks = async (suggestions: AITaskSuggestion[]) => {
    if (!user) return;

    const newTasks: Task[] = suggestions.map(s => ({
      id: crypto.randomUUID(),
      title: s.title,
      description: s.description,
      priority: s.priority,
      status: s.status,
      tags: s.tags || ['ai-generated'],
      createdAt: Date.now(),
    }));

    setTasks(prev => [...prev, ...newTasks]);

    if (newTasks.length > 0) {
      const { error } = await supabase
        .from('tasks')
        .insert(newTasks.map(t => mapTaskToDB(t, user.id)));

      if (error) {
        console.error("Error inserting generated tasks:", error);
        const newIds = new Set(newTasks.map(t => t.id));
        setTasks(prev => prev.filter(t => !newIds.has(t.id)));
      }
    }
  };

  const handleEnhanceTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setEnhancingTaskIds(prev => new Set(prev).add(taskId));
    try {
      const result = await enhanceTaskDescription(task.title, task.description);
      
      let newDesc = result.description;
      if (result.subtasks && result.subtasks.length > 0) {
        newDesc += '\n\n**Subtasks:**\n' + result.subtasks.map(s => `- [ ] ${s}`).join('\n');
      }

      const updatedTags = [...(task.tags || [])];
      if (!updatedTags.includes('enhanced')) updatedTags.push('enhanced');

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, description: newDesc, tags: updatedTags } : t
      ));

      await supabase
        .from('tasks')
        .update({ 
          description: newDesc, 
          tags: updatedTags 
        })
        .eq('id', taskId);

    } catch (err) {
      console.error("Failed to enhance task", err);
    } finally {
      setEnhancingTaskIds(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const openAddTask = (status: Status) => {
    setCurrentColumnForAdd(status);
    setIsTaskModalOpen(true);
  };

  // Auth/Loading States
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-indigo-600">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Layout size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">AI Kanban</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* User Info & Logout */}
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 mr-2 border-r border-slate-200 pr-4">
            <UserIcon size={16} />
            <span className="truncate max-w-[150px]">{user.email}</span>
          </div>

          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors border border-indigo-200 text-sm"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">AI Plan</span>
          </button>
          
          <button
            onClick={() => openAddTask('todo')}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-colors shadow-sm text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          <button
            onClick={signOut}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Board Area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-6 relative">
        {isDataLoading && tasks.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 z-20">
             <Loader2 size={40} className="animate-spin text-indigo-600" />
           </div>
        ) : (
          <div className="flex h-full gap-6 min-w-max">
            {COLUMNS.map(col => (
              <Column
                key={col.id}
                id={col.id}
                title={col.title}
                colorClass={col.color}
                tasks={tasks.filter(t => t.status === col.id)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragStart={handleDragStart}
                onDeleteTask={deleteTask}
                onEnhanceTask={handleEnhanceTask}
                onAddTask={openAddTask}
                enhancingTaskIds={enhancingTaskIds}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={addTask}
        initialStatus={currentColumnForAdd}
      />
      
      <AIGeneratorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onTasksGenerated={handleAIGeneratedTasks}
      />
    </div>
  );
};

export default App;