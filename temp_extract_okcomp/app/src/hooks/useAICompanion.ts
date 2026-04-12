import { useState, useCallback } from 'react';
import type { Message, Task, Reminder, Note, Companion } from '@/types';

// AI Companion personalities and responses
const COMPANION_PERSONALITIES = {
  male: {
    name: 'Alex',
    greeting: "Hey there! I'm Alex, your AI companion. I'm here to help you with anything you need - from generating amazing images and videos to managing your daily tasks. What can I do for you today?",
    responses: {
      greeting: ["Hey! Great to see you again!", "Hello! Ready to create something amazing?", "Hi there! What shall we work on today?"],
      image: ["I'll create that image for you right away!", "Great idea! Let me generate that image.", "Creating your masterpiece now!"],
      video: ["Let's bring your vision to life with video!", "I'll start generating that video for you.", "Creating your video - this will look amazing!"],
      task: ["I've added that task to your list.", "Task added! You're staying organized.", "Got it! Another task checked off your mental load."],
      reminder: ["I'll make sure you don't forget that!", "Reminder set! I've got your back.", "Perfect! I'll remind you at the right time."],
      note: ["I've saved that note for you.", "Note created! Great for keeping track of ideas.", "Saved! Your thoughts are safely stored."],
      fallback: ["That's interesting! Tell me more.", "I understand. How can I help with that?", "Got it! Is there anything specific you'd like me to do?"]
    }
  },
  female: {
    name: 'Luna',
    greeting: "Hi sweetie! I'm Luna, your AI companion and friend. I'm here to help make your day easier and more creative. Whether you want to generate beautiful images, create videos, or just need help organizing your life - I'm here for you!",
    responses: {
      greeting: ["Hey gorgeous! So happy to see you!", "Hello darling! Ready to create some magic?", "Hi love! What are we working on today?"],
      image: ["Ooh, that's going to be beautiful! Creating now...", "I love that idea! Let me paint that picture for you.", "Yes! Let's create something stunning!"],
      video: ["How exciting! Let's make an amazing video!", "I'll start working on that video right away.", "Creating your video - I can't wait to see how it turns out!"],
      task: ["All done! You're so organized.", "Task added, love! Keeping you on track.", "Perfect! I've got that on your list."],
      reminder: ["I'll definitely remind you, don't worry!", "Set! I won't let you forget that.", "Reminder saved - I've got you covered!"],
      note: ["Saved that note for you, sweetie!", "All written down! Great minds think alike.", "Your note is safe with me!"],
      fallback: ["Tell me more about that!", "I'm listening. What's on your mind?", "I hear you. How can I help make things easier?"]
    }
  }
};

export function useAICompanion() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);

  const companions: Companion[] = [
    {
      id: 'alex',
      name: 'Alex',
      gender: 'male',
      avatar: '/ai-boy.png',
      personality: 'friendly, helpful, professional',
      voice: 'Google UK English Male'
    },
    {
      id: 'luna',
      name: 'Luna',
      gender: 'female',
      avatar: '/ai-girl.png',
      personality: 'warm, supportive, creative',
      voice: 'Google UK English Female'
    }
  ];

  const generateAIResponse = useCallback((userMessage: string, companion: Companion): string => {
    const personality = COMPANION_PERSONALITIES[companion.gender];
    const message = userMessage.toLowerCase();
    
    // Check for keywords to determine response type
    if (message.includes('image') || message.includes('picture') || message.includes('generate')) {
      const responses = personality.responses.image;
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (message.includes('video') || message.includes('movie')) {
      const responses = personality.responses.video;
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (message.includes('task') || message.includes('todo')) {
      const responses = personality.responses.task;
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (message.includes('remind') || message.includes('remember')) {
      const responses = personality.responses.reminder;
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (message.includes('note') || message.includes('write')) {
      const responses = personality.responses.note;
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = personality.responses.fallback;
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }, []);

  const sendMessage = useCallback((text: string, type: Message['type'] = 'text') => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type
    };

    setMessages(prev => [...prev, userMessage]);

    // Generate AI response
    if (selectedCompanion) {
      const aiResponse = generateAIResponse(text, selectedCompanion);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };

      setTimeout(() => {
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  }, [selectedCompanion, generateAIResponse]);

  const addTask = useCallback((title: string) => {
    const task: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date()
    };
    setTasks(prev => [...prev, task]);
    return task;
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const addReminder = useCallback((title: string, date: Date, time: string) => {
    const reminder: Reminder = {
      id: Date.now().toString(),
      title,
      date,
      time,
      createdAt: new Date()
    };
    setReminders(prev => [...prev, reminder]);
    return reminder;
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  }, []);

  const addNote = useCallback((title: string, content: string) => {
    const note: Note = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date()
    };
    setNotes(prev => [...prev, note]);
    return note;
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const selectCompanion = useCallback((companion: Companion) => {
    setSelectedCompanion(companion);
  }, []);

  return {
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
  };
}
