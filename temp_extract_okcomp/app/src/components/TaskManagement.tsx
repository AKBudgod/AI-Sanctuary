import { useState } from 'react';
import type { Task, Companion, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Plus, Check, Trash2, 
  ListTodo, Sparkles, Calendar
} from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface TaskManagementProps {
  companion: Companion;
  tasks: Task[];
  onAddTask: (title: string) => Task;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onBack: () => void;
  setViewMode: (mode: ViewMode) => void;
}

export function TaskManagement({ 
  companion, 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask,
  onBack,
  setViewMode 
}: TaskManagementProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  const { speak } = useTextToSpeech({
    voiceURI: companion.gender === 'male' ? 'Google UK English Male' : 'Google UK English Female',
    rate: 0.9,
    pitch: 1.1
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const task = onAddTask(newTaskTitle.trim());
    speak(`Task added: ${task.title}`);
    setNewTaskTitle('');
  };

  const handleToggleTask = (task: Task) => {
    onToggleTask(task.id);
    speak(task.completed ? `Task uncompleted: ${task.title}` : `Task completed: ${task.title}`);
  };

  const handleDeleteTask = (task: Task) => {
    onDeleteTask(task.id);
    speak(`Task deleted: ${task.title}`);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={companion.avatar} alt={companion.name} />
              <AvatarFallback>{companion.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-gray-800">Tasks</h1>
              <p className="text-xs text-gray-500">with {companion.name}</p>
            </div>
          </div>
        </div>
        <ListTodo className="w-6 h-6 text-green-500" />
      </header>

      <div className="max-w-2xl mx-auto p-6">
        {/* Stats */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Task Overview</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{totalCount - completedCount}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{completedCount}</div>
              <div className="text-xs text-gray-500">Done</div>
            </div>
          </div>
        </div>

        {/* Add Task */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex gap-3">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a new task..."
              className="flex-1 border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
            <Button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-6"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${filter === f 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ListTodo className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {companion.gender === 'male' ? 'No tasks yet!' : 'No tasks yet, sweetie!'}
              </h3>
              <p className="text-gray-500 text-sm">
                {companion.gender === 'male' 
                  ? "Add a task above and I'll help you stay organized!" 
                  : "Add a task above and let's get organized together!"}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`task-card bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 ${
                  task.completed ? 'completed' : ''
                }`}
              >
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                    ${task.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-green-500'
                    }
                  `}
                >
                  {task.completed && <Check className="w-4 h-4" />}
                </button>
                
                <span className="task-text flex-1 text-gray-800">
                  {task.title}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task)}
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Back to Chat */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setViewMode('chat')}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Back to Chat with {companion.name}
          </Button>
        </div>
      </div>
    </div>
  );
}
