import { useState } from 'react';
import type { Note, Companion, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, Plus, StickyNote, Trash2, Sparkles, FileText
} from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface NotesManagementProps {
  companion: Companion;
  notes: Note[];
  onAddNote: (title: string, content: string) => Note;
  onDeleteNote: (id: string) => void;
  onBack: () => void;
  setViewMode: (mode: ViewMode) => void;
}

export function NotesManagement({ 
  companion, 
  notes, 
  onAddNote, 
  onDeleteNote,
  onBack,
  setViewMode 
}: NotesManagementProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  
  const { speak } = useTextToSpeech({
    voiceURI: companion.gender === 'male' ? 'Google UK English Male' : 'Google UK English Female',
    rate: 0.9,
    pitch: 1.1
  });

  const handleCreateNote = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    const note = onAddNote(newTitle.trim(), newContent.trim());
    speak(`Note created: ${note.title}`);
    
    // Reset form
    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  const handleDeleteNote = (note: Note) => {
    onDeleteNote(note.id);
    speak(`Note deleted: ${note.title}`);
  };

  const sortedNotes = [...notes].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 to-rose-50">
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
              <h1 className="font-semibold text-gray-800">Notes</h1>
              <p className="text-xs text-gray-500">with {companion.name}</p>
            </div>
          </div>
        </div>
        <StickyNote className="w-6 h-6 text-pink-500" />
      </header>

      <div className="max-w-3xl mx-auto p-6">
        {/* Create Note Button */}
        {!isCreating && (
          <div className="mb-6">
            <Button
              onClick={() => setIsCreating(true)}
              className="w-full h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Note
            </Button>
          </div>
        )}

        {/* Create Note Form */}
        {isCreating && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">New Note</h2>
            
            <div className="space-y-4">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note title..."
                className="border-gray-200 focus:border-pink-500 focus:ring-pink-500"
              />
              
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your note here..."
                className="min-h-[200px] border-gray-200 focus:border-pink-500 focus:ring-pink-500 resize-none"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateNote}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
                >
                  Save Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTitle('');
                    setNewContent('');
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="grid gap-4">
          {sortedNotes.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No notes yet!
              </h3>
              <p className="text-gray-500 text-sm">
                {companion.gender === 'male' 
                  ? "Click 'Create New Note' to start capturing your thoughts!" 
                  : "Let's capture your brilliant ideas - create your first note!"}
              </p>
            </div>
          ) : (
            sortedNotes.map((note) => (
              <div
                key={note.id}
                className="note-card bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-2">{note.title}</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-3">
                      {note.createdAt.toLocaleDateString()} at {note.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(note)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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
