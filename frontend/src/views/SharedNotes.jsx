import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  FileText, Plus, Pin, Trash2, CheckCircle2, 
  Circle, ChevronRight, ClipboardList, ShoppingCart, 
  Map, Users, Sparkles, BookOpen
} from 'lucide-react';

export const SharedNotes = () => {
  const { user } = useAuth();
  const { themeColor } = useTheme();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Note states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('richtext');

  // Active edit states
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [newTodoText, setNewTodoText] = useState('');

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-700 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'girls': return 'bg-pink-400 hover:bg-pink-500 text-slate-950 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-700 text-white';
    }
  };

  const getAccentText = () => {
    switch (themeColor) {
      case 'violet': return 'text-violet-400';
      case 'emerald': return 'text-emerald-400';
      case 'rose': return 'text-rose-400';
      case 'amber': return 'text-amber-400';
      case 'girls': return 'text-pink-300';
      case 'indigo':
      default: return 'text-indigo-400';
    }
  };

  const getAccentBg = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600/20 text-violet-300';
      case 'emerald': return 'bg-emerald-600/20 text-emerald-300';
      case 'rose': return 'bg-rose-600/20 text-rose-300';
      case 'amber': return 'bg-amber-600/20 text-amber-300';
      case 'girls': return 'bg-pink-400/20 text-pink-300 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600/20 text-indigo-300';
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
      if (res.data.length > 0 && !selectedNote) {
        setSelectedNote(res.data[0]);
        setEditTitle(res.data[0].title);
        setEditContent(res.data[0].content || '');
      }
    } catch (error) {
      console.error('Fetch notes error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content || '');
    setNewTodoText('');
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.post('/notes', {
        title: newTitle,
        type: newType,
        todos: [],
      });
      setNotes((prev) => [res.data, ...prev]);
      setSelectedNote(res.data);
      setEditTitle(res.data.title);
      setEditContent(res.data.content || '');
      setNewTitle('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Create note error:', error.message);
    }
  };

  const handleSaveContent = async () => {
    if (!selectedNote) return;
    try {
      const res = await api.put(`/notes/${selectedNote._id}`, {
        title: editTitle,
        content: editContent,
      });
      // Update list
      setNotes((prev) => prev.map((n) => (n._id === selectedNote._id ? res.data : n)));
      setSelectedNote(res.data);
    } catch (error) {
      console.error('Save note error:', error.message);
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      await api.post(`/notes/${noteId}/pin`);
      fetchNotes();
    } catch (error) {
      console.error('Toggle pin error:', error.message);
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this notebook permanently?')) return;
    try {
      await api.delete(`/notes/${noteId}`);
      setSelectedNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Delete note error:', error.message);
    }
  };

  // Todo / Checklist checklist logic
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim() || !selectedNote) return;

    const updatedTodos = [...selectedNote.todos, { task: newTodoText, completed: false }];
    
    try {
      const res = await api.put(`/notes/${selectedNote._id}`, {
        todos: updatedTodos,
      });
      setNotes((prev) => prev.map((n) => (n._id === selectedNote._id ? res.data : n)));
      setSelectedNote(res.data);
      setNewTodoText('');
    } catch (error) {
      console.error('Add checklist item error:', error.message);
    }
  };

  const handleToggleTodo = async (todoId) => {
    if (!selectedNote) return;

    const updatedTodos = selectedNote.todos.map((todo) => {
      if (todo._id === todoId) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });

    try {
      const res = await api.put(`/notes/${selectedNote._id}`, {
        todos: updatedTodos,
      });
      setNotes((prev) => prev.map((n) => (n._id === selectedNote._id ? res.data : n)));
      setSelectedNote(res.data);
    } catch (error) {
      console.error('Toggle checklist item error:', error.message);
    }
  };

  const getNoteIcon = (type) => {
    switch (type) {
      case 'todo':
      case 'checklist':
        return <ClipboardList className="h-4.5 w-4.5 text-indigo-400" />;
      case 'shopping':
        return <ShoppingCart className="h-4.5 w-4.5 text-amber-400" />;
      case 'travel':
        return <Map className="h-4.5 w-4.5 text-emerald-400" />;
      case 'richtext':
      default:
        return <FileText className="h-4.5 w-4.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-3xl border border-slate-900 bg-slate-950/45 shadow-xl overflow-hidden">
      
      {/* Left side list menu */}
      <div className="w-64 border-r border-slate-900 bg-slate-950/60 p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-900">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Notebooks</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : notes.length === 0 ? (
          <div className="text-center py-10 text-[10px] text-slate-500 italic">
            No notebooks found.
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto flex flex-col gap-1 pr-1">
            {notes.map((note) => {
              const isSelected = selectedNote?._id === note._id;
              return (
                <button
                  key={note._id}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center justify-between transition-all ${
                    isSelected 
                      ? 'bg-slate-900/90 text-white font-bold' 
                      : 'text-slate-400 hover:bg-slate-900/40 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[80%]">
                    {getNoteIcon(note.type)}
                    <span className="text-xs truncate">{note.title}</span>
                  </div>
                  {note.isPinned && <Pin className="h-3 w-3 text-amber-400 fill-amber-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right side editor layout */}
      <div className="flex-grow flex flex-col bg-slate-950/20">
        {selectedNote ? (
          <div className="flex-grow flex flex-col p-6 h-full relative">
            
            {/* Header controls toolbar */}
            <div className="flex justify-between items-start border-b border-slate-900 pb-3.5 mb-5">
              <div className="flex flex-col gap-1.5 flex-grow mr-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={handleSaveContent}
                    className="text-lg font-extrabold bg-transparent border-none text-white focus:outline-none focus:ring-0 p-0 max-w-md"
                  />
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getAccentBg()}`}>
                    {selectedNote.type}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 capitalize">
                  Owner: {selectedNote.author?.username || 'user'} &bull; Updated: {new Date(selectedNote.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePin(selectedNote._id)}
                  className={`rounded-xl p-2.5 bg-slate-900 border border-slate-800 transition-colors ${
                    selectedNote.isPinned ? 'text-amber-400 hover:text-amber-500' : 'text-slate-500 hover:text-white'
                  }`}
                  title="Pin Notebook"
                >
                  <Pin className={`h-4.5 w-4.5 ${selectedNote.isPinned ? 'fill-amber-400' : ''}`} />
                </button>
                {(selectedNote.author?._id === user._id || user.role === 'Admin') && (
                  <button
                    onClick={() => handleDelete(selectedNote._id)}
                    className="rounded-xl p-2.5 bg-slate-900 border border-slate-800 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors animate-pulse"
                    title="Delete Notebook"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Document body editor panel */}
            <div className="flex-grow flex flex-col overflow-y-auto">
              
              {/* Checklist / Todo Board */}
              {['todo', 'checklist', 'shopping', 'travel'].includes(selectedNote.type) ? (
                <div className="flex flex-col gap-4 max-w-xl w-full mx-auto">
                  
                  {/* Create item form */}
                  <form onSubmit={handleAddTodo} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      placeholder="Add task details..."
                      className="flex-grow rounded-xl py-2 px-3 text-xs glass-input font-medium"
                      required
                    />
                    <button
                      type="submit"
                      className={`rounded-xl px-4 text-xs font-bold transition-all cursor-pointer ${getAccentBtn()}`}
                    >
                      Add
                    </button>
                  </form>

                  {/* Checklist items list */}
                  <div className="flex flex-col gap-2">
                    {selectedNote.todos?.length === 0 ? (
                      <div className="text-center py-10 text-xs text-slate-500 italic">
                        Checklist is empty.
                      </div>
                    ) : (
                      selectedNote.todos.map((todo) => (
                        <button
                          key={todo._id}
                          onClick={() => handleToggleTodo(todo._id)}
                          className="w-full text-left flex items-start gap-3 rounded-xl bg-slate-900/35 border border-slate-900 p-3 hover:border-slate-800 transition-all text-xs"
                        >
                          <span className="flex-shrink-0 mt-0.5">
                            {todo.completed ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-indigo-400" />
                            ) : (
                              <Circle className="h-4.5 w-4.5 text-slate-500" />
                            )}
                          </span>
                          <span className={`leading-relaxed ${
                            todo.completed ? 'line-through text-slate-500' : 'text-slate-300 font-medium'
                          }`}>
                            {todo.task}
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                </div>
              ) : (
                // Standard Notepad layout
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onBlur={handleSaveContent}
                  placeholder="Start drafting shared notes..."
                  className="w-full flex-grow bg-transparent border-none text-slate-200 focus:outline-none focus:ring-0 p-0 text-xs font-medium leading-relaxed resize-none"
                />
              )}

            </div>
            
            {/* Auto save note indicator */}
            <div className="absolute bottom-4 right-6 text-[9px] text-slate-500 italic">
              *Autosaves changes on exit.
            </div>

          </div>
        ) : (
          <div className="my-auto text-center text-xs text-slate-500 italic">
            Select a notebook from the panel, or create a new one.
          </div>
        )}
      </div>

      {/* Create Note Modal popup */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-white/5 text-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-sm font-bold">Create New Shared Notebook</span>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Notebook Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Travel Plans: Goa 2026"
                  className="w-full rounded-xl py-3 px-4 text-xs glass-input font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Notebook Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full rounded-xl py-3 px-4 text-xs bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                >
                  <option value="richtext">Rich Text Notepad</option>
                  <option value="todo">To-Do list</option>
                  <option value="shopping">Shopping / Grocery Checklist</option>
                  <option value="travel">Travel Planner</option>
                  <option value="checklist">General Checklist</option>
                </select>
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl text-xs font-bold text-white transition-all shadow-md mt-2 cursor-pointer ${getAccentBtn()}`}
              >
                Create Notebook
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SharedNotes;
