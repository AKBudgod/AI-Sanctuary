import { useState, useEffect } from 'react';
import type { ViewMode } from '@/types';
import { useAICompanion } from '@/hooks/useAICompanion';
import { Hero } from '@/components/Hero';
import { CharacterSelection } from '@/components/CharacterSelection';
import { ChatInterface } from '@/components/ChatInterface';
import { ImageGeneration } from '@/components/ImageGeneration';
import { VideoGeneration } from '@/components/VideoGeneration';
import { TaskManagement } from '@/components/TaskManagement';
import { ReminderManagement } from '@/components/ReminderManagement';
import { NotesManagement } from '@/components/NotesManagement';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('hero');
  
  const {
    messages,
    tasks,
    reminders,
    notes,
    companions,
    selectedCompanion,
    sendMessage,
    addTask,
    toggleTask,
    deleteTask,
    addReminder,
    deleteReminder,
    addNote,
    deleteNote,
    selectCompanion,
    setMessages
  } = useAICompanion();

  // Initialize with welcome message when companion is selected
  useEffect(() => {
    if (selectedCompanion && messages.length === 0) {
      const personality = selectedCompanion.gender === 'male' 
        ? "Hey there! I'm Alex, your AI companion. I'm here to help you with anything you need - from generating amazing images and videos to managing your daily tasks. What can I do for you today?"
        : "Hi sweetie! I'm Luna, your AI companion and friend. I'm here to help make your day easier and more creative. Whether you want to generate beautiful images, create videos, or just need help organizing your life - I'm here for you!";
      
      const welcomeMessage = {
        id: 'welcome',
        text: personality,
        sender: 'ai' as const,
        timestamp: new Date(),
        type: 'text' as const
      };
      
      setMessages([welcomeMessage]);
    }
  }, [selectedCompanion, messages.length, setMessages]);

  const handleGetStarted = () => {
    setViewMode('character');
  };

  const handleBackToCharacter = () => {
    setViewMode('character');
  };

  // Render appropriate view based on mode
  const renderView = () => {
    switch (viewMode) {
      case 'hero':
        return <Hero onGetStarted={handleGetStarted} />;
      
      case 'character':
        return (
          <CharacterSelection
            companions={companions}
            onSelectCompanion={selectCompanion}
            setViewMode={setViewMode}
          />
        );
      
      case 'chat':
        if (!selectedCompanion) {
          setViewMode('character');
          return null;
        }
        return (
          <ChatInterface
            companion={selectedCompanion}
            messages={messages}
            onSendMessage={sendMessage}
            setViewMode={setViewMode}
            onBack={handleBackToCharacter}
          />
        );
      
      case 'image':
        if (!selectedCompanion) {
          setViewMode('character');
          return null;
        }
        return (
          <ImageGeneration
            companion={selectedCompanion}
            onBack={() => setViewMode('chat')}
            setViewMode={setViewMode}
          />
        );
      
      case 'video':
        if (!selectedCompanion) {
          setViewMode('character');
          return null;
        }
        return (
          <VideoGeneration
            companion={selectedCompanion}
            onBack={() => setViewMode('chat')}
            setViewMode={setViewMode}
          />
        );
      
      case 'tasks':
        if (!selectedCompanion) {
          setViewMode('character');
          return null;
        }
        return (
          <TaskManagement
            companion={selectedCompanion}
            tasks={tasks}
            onAddTask={addTask}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onBack={() => setViewMode('chat')}
            setViewMode={setViewMode}
          />
        );
      
      case 'reminders':
        if (!selectedCompanion) {
          setViewMode('character');
          return null;
        }
        return (
          <ReminderManagement
            companion={selectedCompanion}
            reminders={reminders}
            onAddReminder={addReminder}
            onDeleteReminder={deleteReminder}
            onBack={() => setViewMode('chat')}
            setViewMode={setViewMode}
          />
        );
      
      case 'notes':
        if (!selectedCompanion) {
          setViewMode('character');
          return null;
        }
        return (
          <NotesManagement
            companion={selectedCompanion}
            notes={notes}
            onAddNote={addNote}
            onDeleteNote={deleteNote}
            onBack={() => setViewMode('chat')}
            setViewMode={setViewMode}
          />
        );
      
      default:
        return <Hero onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="w-full min-h-screen">
      {renderView()}
    </div>
  );
}

export default App;
