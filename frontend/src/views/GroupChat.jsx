import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  Send, Image as ImageIcon, Paperclip, Mic, X, 
  Search, Reply, Smile, Trash2, Edit2, Check, CheckCheck, StopCircle, Play, Pause
} from 'lucide-react';

export const GroupChat = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { themeColor } = useTheme();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  
  // Channels
  const [activeChannel, setActiveChannel] = useState('#general');
  const channels = ['#general', '#study-lounge', '#trip-planning', '#memes-corner'];

  // Typing state
  const [typingUsers, setTypingUsers] = useState({}); // { username: timestamp }
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Search, Edit, Reply
  const [searchQuery, setSearchQuery] = useState('');
  const [repliedTo, setRepliedTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  // File Upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordIntervalRef = useRef(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-755 text-white';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-755 text-white';
      case 'rose': return 'bg-rose-600 hover:bg-rose-755 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-755 text-white';
      case 'girls': return 'bg-pink-400 hover:bg-pink-500 text-slate-950 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-755 text-white';
    }
  };

  const getAccentBorder = () => {
    switch (themeColor) {
      case 'violet': return 'border-violet-500/25';
      case 'emerald': return 'border-emerald-500/25';
      case 'rose': return 'border-rose-500/25';
      case 'amber': return 'border-amber-500/25';
      case 'girls': return 'border-pink-300/25';
      case 'indigo':
      default: return 'border-indigo-500/25';
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

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get('/chat', { params: { search: searchQuery } });
      setMessages(res.data);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Fetch messages error:', error.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [searchQuery]);

  // Handle live WebSockets logic
  useEffect(() => {
    if (!socket) return;

    // Listen to new messages
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        // Avoid duplicate additions
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 50);

      // Trigger socket message seen back to database
      if (msg.sender?._id !== user._id) {
        api.post(`/chat/${msg._id}/seen`).then((res) => {
          socket.emit('message_seen', { messageId: msg._id, userId: user._id });
        });
      }
    };

    // Listen to reactions update
    const handleMessageUpdate = (updatedMsg) => {
      setMessages((prev) => prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m)));
    };

    // Listen to typing alerts
    const handleTypingStatus = (data) => {
      // data: { userId, username, isTyping }
      if (data.userId === user._id) return;

      setTypingUsers((prev) => {
        const copy = { ...prev };
        if (data.isTyping) {
          copy[data.username] = Date.now();
        } else {
          delete copy[data.username];
        }
        return copy;
      });
    };

    // Listen to seen acknowledgements
    const handleMessageSeen = (data) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id === data.messageId && !m.seenBy.includes(data.userId)) {
            return { ...m, seenBy: [...m.seenBy, data.userId] };
          }
          return m;
        })
      );
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_updated', handleMessageUpdate);
    socket.on('typing_status', handleTypingStatus);
    socket.on('message_seen_ack', handleMessageSeen);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_updated', handleMessageUpdate);
      socket.off('typing_status', handleTypingStatus);
      socket.off('message_seen_ack', handleMessageSeen);
    };
  }, [socket, user]);

  // Cleanup old typing statuses after 3 seconds of inactivity
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const copy = { ...prev };
        let changed = false;
        Object.entries(copy).forEach(([name, timestamp]) => {
          if (now - timestamp > 3500) {
            delete copy[name];
            changed = true;
          }
        });
        return changed ? copy : prev;
      });
    }, 2000);

    return () => clearInterval(checkInterval);
  }, []);

  // Handle keypress text typing indicators
  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (!socket) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { userId: user._id, username: user.username, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', { userId: user._id, username: user.username, isTyping: false });
    }, 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview('');
      }
    }
  };

  const handleCancelAttachment = () => {
    setSelectedFile(null);
    setFilePreview('');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    try {
      let responseMessage;

      if (selectedFile) {
        // Send file multipart form
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('content', content);
        if (repliedTo) formData.append('repliedTo', repliedTo._id);

        const res = await api.post('/chat', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        responseMessage = res.data;
      } else if (editingMessage) {
        // Edit existing message
        const res = await api.put(`/chat/${editingMessage._id}`, { content });
        responseMessage = res.data;
        setEditingMessage(null);
      } else {
        // Text send
        const res = await api.post('/chat', {
          content,
          repliedTo: repliedTo?._id || null,
        });
        responseMessage = res.data;
      }

      // Append and broadcast
      if (socket) {
        socket.emit('send_message', responseMessage);
      } else {
        // Fallback refresh
        fetchMessages();
      }

      // Reset fields
      setContent('');
      setRepliedTo(null);
      setSelectedFile(null);
      setFilePreview('');
      setTimeout(scrollToBottom, 50);
    } catch (error) {
      console.error('Send message error:', error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const res = await api.delete(`/chat/${id}`);
      if (socket) {
        socket.emit('edit_message', res.data); // broadcasts delete state
      }
      setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, content: 'This message was deleted', deleted: true, fileUrl: '', fileName: '' } : m)));
    } catch (error) {
      console.error('Delete message error:', error.message);
    }
  };

  const handleEmojiClick = (emoji) => {
    setContent((prev) => prev + emoji);
  };

  const handleReact = async (id, emoji) => {
    try {
      const res = await api.post(`/chat/${id}/react`, { emoji });
      if (socket) {
        socket.emit('edit_message', res.data); // broadcasts reaction
      }
      setMessages((prev) => prev.map((m) => (m._id === id ? res.data : m)));
    } catch (error) {
      console.error('Reaction error:', error.message);
    }
  };

  // Voice recording helper routines
  const startRecording = async () => {
    setErrorRecording('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const voiceFile = new File([audioBlob], `voice-msg-${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Setup file attach variables
        setSelectedFile(voiceFile);
        setFilePreview('voice_attached');
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setAudioChunks(chunks);

      setRecordDuration(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Voice record permissions denied:', err);
      alert('Microphone access is required to record voice messages.');
    }
  };

  const [errorRecording, setErrorRecording] = useState('');

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval(recordIntervalRef.current);
    }
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-3xl border border-slate-900 bg-slate-950/45 shadow-xl overflow-hidden">
      
      {/* Channels sidebar layout (Discord flavor) */}
      <div className="hidden md:flex flex-col w-56 border-r border-slate-900 bg-slate-950/80 p-4">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-3">Channels</span>
        <div className="flex flex-col gap-1">
          {channels.map((chan) => (
            <button
              key={chan}
              onClick={() => setActiveChannel(chan)}
              className={`text-left text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                activeChannel === chan 
                  ? 'bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {chan}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat window panels */}
      <div className="flex-grow flex flex-col h-full bg-slate-950/20 relative">
        
        {/* Header toolbar */}
        <div className="h-14 border-b border-slate-900 px-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">{activeChannel}</span>
            <span className="text-[10px] text-slate-500">Workspace Room Chat</span>
          </div>

          {/* Search messages */}
          <div className="relative w-44 md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-xl py-1.5 pl-8 pr-3 text-xs glass-input font-medium"
            />
          </div>
        </div>

        {/* Message timeline panel */}
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
          {loading ? (
            <Loader />
          ) : messages.length === 0 ? (
            <div className="my-auto text-center text-xs text-slate-500 italic">
              Say hello! Send the first message to the circle.
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.sender?._id === user._id;
              const hasReplied = msg.repliedTo;

              return (
                <div key={msg._id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                  
                  {/* Reply marker */}
                  {hasReplied && (
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                      <Reply className="h-3 w-3" />
                      <span>Replied to {msg.repliedTo.sender?.username || 'user'}: </span>
                      <span className="italic truncate max-w-40">"{msg.repliedTo.content}"</span>
                    </div>
                  )}

                  <div className={`flex gap-2.5 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* User avatar */}
                    <img
                      src={msg.sender?.avatar || 'https://via.placeholder.com/150'}
                      alt={msg.sender?.username}
                      className="h-8.5 w-8.5 rounded-xl object-cover mt-0.5 border border-slate-900 flex-shrink-0"
                    />

                    {/* Chat Bubble container */}
                    <div className="flex flex-col gap-1">
                      
                      {/* Name & Time */}
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="font-bold text-slate-300">{msg.sender?.username}</span>
                        <span className="text-slate-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Bubble */}
                      <div className={`rounded-2xl px-4 py-2.5 text-xs shadow-md border ${
                        msg.deleted ? 'bg-slate-900/30 border-slate-900/80 text-slate-500 italic' :
                        isOwn 
                          ? 'bg-slate-900/80 border-slate-800/60 text-slate-200' 
                          : 'bg-slate-950/80 border-slate-900 text-slate-300'
                      }`}>
                        
                        {/* Audio file layout */}
                        {msg.type === 'voice' && msg.fileUrl ? (
                          <div className="flex items-center gap-3 py-1">
                            <audio controls src={msg.fileUrl} className="h-8 w-44 md:w-56" />
                          </div>
                        ) : msg.type === 'image' && msg.fileUrl ? (
                          // Image file layout
                          <div className="flex flex-col gap-2">
                            <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                              <img src={msg.fileUrl} alt="Shared attachment" className="max-h-60 rounded-xl object-cover" />
                            </a>
                            {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                          </div>
                        ) : msg.type === 'file' && msg.fileUrl ? (
                          // General document file layout
                          <div className="flex flex-col gap-1.5">
                            <a
                              href={msg.fileUrl}
                              download
                              className="flex items-center gap-2 rounded-xl bg-slate-900 p-2.5 border border-slate-800 text-[11px] font-bold text-indigo-400 hover:text-white"
                            >
                              <Paperclip className="h-4 w-4" /> Download: {msg.fileName}
                            </a>
                            {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                          </div>
                        ) : (
                          // Standard Text content
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}

                        {/* Edited flag */}
                        {msg.edited && !msg.deleted && (
                          <span className="text-[8px] text-slate-500 italic ml-1">(edited)</span>
                        )}

                      </div>

                      {/* Tool Actions Row (Seen receipt, Reaction shortcut icons, reply buttons) */}
                      {!msg.deleted && (
                        <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          
                          {/* Seen checkmarks */}
                          {isOwn && (
                            <span className="flex items-center" title={`Seen by ${msg.seenBy?.length || 0} friends`}>
                              {msg.seenBy?.length > 1 ? (
                                <CheckCheck className="h-3.5 w-3.5 text-indigo-400" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </span>
                          )}

                          {/* Quick Reactions */}
                          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                            {['👍', '❤️', '😂'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => handleReact(msg._id, emoji)}
                                className="hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          {/* Reaction counts badges */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex gap-1">
                              {Object.entries(
                                msg.reactions.reduce((acc, curr) => {
                                  acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                                  return acc;
                                }, {})
                              ).map(([emoji, count]) => (
                                <span key={emoji} className="rounded-full bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[8px] font-bold text-slate-300">
                                  {emoji} {count}
                                </span>
                              ))}
                            </div>
                          )}

                          <button onClick={() => setRepliedTo(msg)} className="hover:text-white transition-colors">
                            Reply
                          </button>

                          {isOwn && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessage(msg);
                                  setContent(msg.content);
                                }}
                                className="hover:text-white transition-colors"
                              >
                                Edit
                              </button>
                              <button onClick={() => handleDelete(msg._id)} className="hover:text-rose-400 transition-colors">
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Live typing panel */}
        {Object.keys(typingUsers).length > 0 && (
          <div className="absolute bottom-20 left-4 text-[10px] text-indigo-400 italic font-medium">
            {Object.keys(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        {/* Reply/Edit Toolbar Header */}
        {(repliedTo || editingMessage || selectedFile) && (
          <div className="px-4 py-2 border-t border-slate-900/60 bg-slate-900/10 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              {repliedTo && (
                <>
                  <Reply className="h-4 w-4 text-indigo-400" /> Replying to{' '}
                  <span className="font-bold text-white">{repliedTo.sender?.username}</span>
                </>
              )}
              {editingMessage && (
                <>
                  <Edit2 className="h-4 w-4 text-indigo-400" /> Editing message...
                </>
              )}
              {selectedFile && (
                <>
                  <Paperclip className="h-4 w-4 text-indigo-400" /> Attached:{' '}
                  <span className="font-bold text-white truncate max-w-40">{selectedFile.name}</span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                setRepliedTo(null);
                setEditingMessage(null);
                handleCancelAttachment();
                setContent('');
              }}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Chat input form panel */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-900 flex gap-2.5 items-center">
          
          {/* File Attach controls */}
          <div className="flex items-center gap-1.5">
            <label className="rounded-xl p-2.5 bg-slate-900/80 border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer">
              <Paperclip className="h-4.5 w-4.5" />
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
            
            {/* Voice record trigger */}
            {isRecording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="rounded-xl p-2.5 bg-rose-950 border border-rose-800 text-rose-400 hover:bg-rose-900 flex items-center gap-1 animate-pulse"
                title="Stop Recording"
              >
                <StopCircle className="h-4.5 w-4.5" />
                <span className="text-[10px] font-bold">{formatDuration(recordDuration)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="rounded-xl p-2.5 bg-slate-900/80 border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                title="Record Voice"
              >
                <Mic className="h-4.5 w-4.5" />
              </button>
            )}
          </div>

          {/* Text Input area */}
          <div className="flex-grow relative">
            <input
              type="text"
              value={content}
              onChange={handleContentChange}
              placeholder="Send message to group chat..."
              className="w-full rounded-xl py-3 pl-4 pr-10 text-xs glass-input font-medium"
            />
            {/* Quick Emoji toggle overlay */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {['🔥', '🎉'].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="hover:scale-125 transition-transform text-xs"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={`rounded-xl p-3 shadow-md flex items-center justify-center cursor-pointer ${getAccentBtn()}`}
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>

      </div>

    </div>
  );
};

export default GroupChat;
