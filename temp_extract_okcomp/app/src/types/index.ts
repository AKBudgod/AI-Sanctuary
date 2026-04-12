export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'image' | 'task' | 'reminder' | 'note';
  imageUrl?: string;
  task?: Task;
  reminder?: Reminder;
  note?: Note;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  title: string;
  date: Date;
  time: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface Companion {
  id: string;
  name: string;
  gender: 'male' | 'female';
  avatar: string;
  personality: string;
  voice: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  url: string;
  createdAt: Date;
}

export interface GeneratedVideo {
  id: string;
  prompt: string;
  status: 'generating' | 'completed' | 'failed';
  url?: string;
  createdAt: Date;
}

export type ViewMode = 'hero' | 'chat' | 'image' | 'video' | 'tasks' | 'reminders' | 'notes' | 'character';
