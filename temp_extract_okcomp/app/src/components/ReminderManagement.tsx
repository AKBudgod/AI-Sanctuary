import { useState } from 'react';
import type { Reminder, Companion, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Bell, Calendar, Clock, Trash2, Sparkles
} from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface ReminderManagementProps {
  companion: Companion;
  reminders: Reminder[];
  onAddReminder: (title: string, date: Date, time: string) => Reminder;
  onDeleteReminder: (id: string) => void;
  onBack: () => void;
  setViewMode: (mode: ViewMode) => void;
}

export function ReminderManagement({ 
  companion, 
  reminders, 
  onAddReminder, 
  onDeleteReminder,
  onBack,
  setViewMode 
}: ReminderManagementProps) {
  const [newTitle, setNewTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const { speak } = useTextToSpeech({
    voiceURI: companion.gender === 'male' ? 'Google UK English Male' : 'Google UK English Female',
    rate: 0.9,
    pitch: 1.1
  });

  const handleAddReminder = () => {
    if (!newTitle.trim() || !selectedDate || !selectedTime) return;
    
    const date = new Date(selectedDate);
    const reminder = onAddReminder(newTitle.trim(), date, selectedTime);
    speak(`Reminder set: ${reminder.title} on ${reminder.date.toLocaleDateString()} at ${reminder.time}`);
    
    // Reset form
    setNewTitle('');
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleDeleteReminder = (reminder: Reminder) => {
    onDeleteReminder(reminder.id);
    speak(`Reminder deleted: ${reminder.title}`);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateStr = date.toLocaleDateString();
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return dateStr;
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 to-amber-50">
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
              <h1 className="font-semibold text-gray-800">Reminders</h1>
              <p className="text-xs text-gray-500">with {companion.name}</p>
            </div>
          </div>
        </div>
        <Bell className="w-6 h-6 text-orange-500" />
      </header>

      <div className="max-w-2xl mx-auto p-6">
        {/* Add Reminder Form */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Set a Reminder</h2>
          
          <div className="space-y-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What should I remind you about?"
              className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Time</label>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>
            
            <Button
              onClick={handleAddReminder}
              disabled={!newTitle.trim() || !selectedDate || !selectedTime}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
            >
              <Bell className="w-4 h-4 mr-2" />
              Set Reminder
            </Button>
          </div>
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {sortedReminders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No reminders yet!
              </h3>
              <p className="text-gray-500 text-sm">
                {companion.gender === 'male' 
                  ? "Add a reminder above and I'll make sure you don't forget!" 
                  : "I'll keep track of everything for you, just add a reminder!"}
              </p>
            </div>
          ) : (
            sortedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-orange-500" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{reminder.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(reminder.date)}</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>{reminder.time}</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteReminder(reminder)}
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
