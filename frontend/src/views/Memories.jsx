import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  Heart, MessageCircle, Download, Calendar as CalIcon, 
  Plus, X, Image as ImageIcon, Send, ArrowLeft, ArrowRight, Play
} from 'lucide-react';

export const Memories = () => {
  const { user } = useAuth();
  const { themeColor } = useTheme();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState('All');

  // Slide modal states
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Comment overlay states
  const [showCommentModal, setShowCommentModal] = useState(null); // memory object
  const [commentText, setCommentText] = useState('');

  // Upload memory states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [albumName, setAlbumName] = useState('General');
  const [takenAt, setTakenAt] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-700';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700';
      case 'girls': return 'bg-pink-400 hover:bg-pink-500 text-slate-950 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-700';
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

  const fetchMemories = async () => {
    try {
      const res = await api.get('/memories');
      setMemories(res.data);
    } catch (error) {
      console.error('Fetch memories error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!mediaFile || !title) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', mediaFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('albumName', albumName);
    if (takenAt) formData.append('takenAt', takenAt);

    try {
      await api.post('/memories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setMediaFile(null);
      setMediaPreview('');
      setTitle('');
      setDescription('');
      setAlbumName('General');
      setTakenAt('');
      fetchMemories();
    } catch (error) {
      console.error('Upload memory error:', error.message);
      alert('Failed to upload memory.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await api.post(`/memories/${id}/like`);
      // Update memory in list
      setMemories((prev) => prev.map((m) => (m._id === id ? res.data : m)));
      if (showCommentModal && showCommentModal._id === id) {
        setShowCommentModal(res.data);
      }
    } catch (error) {
      console.error('Like memory error:', error.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !showCommentModal) return;

    try {
      const res = await api.post(`/memories/${showCommentModal._id}/comment`, {
        text: commentText,
      });
      setMemories((prev) => prev.map((m) => (m._id === showCommentModal._id ? res.data : m)));
      setShowCommentModal(res.data);
      setCommentText('');
    } catch (error) {
      console.error('Add comment error:', error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await api.delete(`/memories/${showCommentModal._id}/comment/${commentId}`);
      setMemories((prev) => prev.map((m) => (m._id === showCommentModal._id ? res.data : m)));
      setShowCommentModal(res.data);
    } catch (error) {
      console.error('Delete comment error:', error.message);
    }
  };

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Delete this memory album item permanently?')) return;
    try {
      await api.delete(`/memories/${id}`);
      fetchMemories();
    } catch (error) {
      console.error('Delete memory error:', error.message);
    }
  };

  // Get list of unique albums
  const albumNames = ['All', ...new Set(memories.map((m) => m.albumName))];

  // Filter memories by album
  const filteredMemories = selectedAlbum === 'All' 
    ? memories 
    : memories.filter((m) => m.albumName === selectedAlbum);

  const imagesOnlyForSlideshow = filteredMemories.filter((m) => m.type === 'image');

  const startSlideshow = () => {
    if (imagesOnlyForSlideshow.length === 0) return;
    setActiveSlideIdx(0);
    setShowSlideshow(true);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Circle Trip Albums</span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Shared Memories</h1>
        </div>

        <div className="flex gap-2.5">
          {imagesOnlyForSlideshow.length > 0 && (
            <button
              onClick={startSlideshow}
              className="rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-indigo-300 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="h-4 w-4 text-indigo-400" /> Start Slideshow
            </button>
          )}

          <button
            onClick={() => setShowUploadModal(true)}
            className={`rounded-xl px-4 py-2.5 text-xs text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${getAccentBtn()}`}
          >
            <Plus className="h-4.5 w-4.5" /> Upload Media
          </button>
        </div>
      </div>

      {/* Album Filters */}
      <div className="flex flex-wrap gap-2 text-xs border-b border-slate-900 pb-3">
        {albumNames.map((name) => (
          <button
            key={name}
            onClick={() => setSelectedAlbum(name)}
            className={`rounded-xl px-4 py-1.5 font-bold transition-all border ${
              selectedAlbum === name 
                ? 'bg-slate-900 border-slate-700 text-white' 
                : 'border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Media Grid (timeline styled) */}
      {loading ? (
        <Loader />
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-20 text-xs text-slate-500 italic border border-slate-900 bg-slate-950/45 rounded-2xl">
          No memory items uploaded to this album. Click "Upload Media" to start!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMemories.map((mem) => {
            const isLiked = mem.likes?.includes(user._id);
            return (
              <div key={mem._id} className="rounded-2xl border border-slate-900 bg-slate-950/45 overflow-hidden flex flex-col justify-between hover:border-slate-800 transition-colors shadow-lg">
                
                {/* Media frame */}
                <div className="aspect-square bg-slate-950 flex items-center justify-center relative group">
                  {mem.type === 'video' ? (
                    <video src={mem.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={mem.url} alt={mem.title} className="w-full h-full object-cover" />
                  )}
                  
                  {/* Hover album name tag */}
                  <span className="absolute top-3.5 left-3.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 border border-white/5 backdrop-blur-sm text-slate-300">
                    {mem.albumName}
                  </span>
                </div>

                {/* Card text footer details */}
                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{mem.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{mem.description}</p>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-3">
                    <span className="flex items-center gap-1">
                      <CalIcon className="h-3.5 w-3.5" />
                      {new Date(mem.takenAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="capitalize">By: {mem.uploader?.username || 'user'}</span>
                  </div>

                  {/* Likes and comment panel actions */}
                  <div className="flex items-center justify-between border-t border-slate-900 pt-3.5 mt-0.5">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                      <button
                        onClick={() => handleLike(mem._id)}
                        className={`flex items-center gap-1.5 transition-colors ${
                          isLiked ? 'text-rose-500' : 'hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                        {mem.likes?.length || 0}
                      </button>
                      <button
                        onClick={() => setShowCommentModal(mem)}
                        className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {mem.comments?.length || 0}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={mem.url}
                        download
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Download Memory"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      {(mem.uploader?._id === user._id || user.role === 'Admin') && (
                        <button
                          onClick={() => handleDeleteMemory(mem._id)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Upload Media Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-white/5 text-slate-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-sm font-bold">Upload Trip Media Memory</span>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-500 hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Select File (Image/Video)</label>
                <div className="border border-dashed border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-900/20 hover:bg-slate-900/40 transition-colors cursor-pointer relative min-h-24">
                  <input
                    type="file"
                    onChange={handleMediaChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  {mediaPreview ? (
                    <img src={mediaPreview} alt="Preview" className="max-h-20 rounded-lg object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-slate-600 mb-1" />
                      <span className="text-[10px] text-slate-400 font-bold">Click to browse file</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Memory Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunset at Calangute Beach"
                  className="w-full rounded-xl p-2.5 text-xs glass-input font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Memory Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell the story of this photo..."
                  className="w-full rounded-xl p-2.5 text-xs glass-input font-medium min-h-16"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">Album Name</label>
                  <input
                    type="text"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    placeholder="Goa Trip 2026"
                    className="w-full rounded-xl p-2.5 text-xs glass-input font-medium"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">Date Taken</label>
                  <input
                    type="date"
                    value={takenAt}
                    onChange={(e) => setTakenAt(e.target.value)}
                    className="w-full rounded-xl p-2.5 text-xs glass-input font-medium text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md mt-2 cursor-pointer ${getAccentBtn()}`}
              >
                {isUploading ? "Uploading Memory file..." : "Post Memory"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen Slideshow Image Viewer Overlay Modal */}
      {showSlideshow && imagesOnlyForSlideshow.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 items-center justify-center p-4">
          <button
            onClick={() => setShowSlideshow(false)}
            className="absolute top-4 right-4 rounded-xl p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Slide item */}
          <div className="flex-grow flex items-center justify-center max-w-4xl max-h-[80vh] w-full relative">
            <img
              src={imagesOnlyForSlideshow[activeSlideIdx].url}
              alt={imagesOnlyForSlideshow[activeSlideIdx].title}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/5"
            />
            
            {/* Nav Arrows overlay */}
            <button
              onClick={() => setActiveSlideIdx((prev) => (prev > 0 ? prev - 1 : imagesOnlyForSlideshow.length - 1))}
              className="absolute left-2 rounded-full p-3 bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveSlideIdx((prev) => (prev < imagesOnlyForSlideshow.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 rounded-full p-3 bg-slate-900/60 hover:bg-slate-900 text-slate-300 border border-slate-800"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center mt-4 max-w-xl">
            <h3 className="text-sm font-bold text-white">{imagesOnlyForSlideshow[activeSlideIdx].title}</h3>
            <p className="text-xs text-slate-400 mt-1">{imagesOnlyForSlideshow[activeSlideIdx].description}</p>
            <span className="text-[10px] text-slate-500 mt-2 block font-semibold">
              Slide {activeSlideIdx + 1} of {imagesOnlyForSlideshow.length} &bull; Album: {imagesOnlyForSlideshow[activeSlideIdx].albumName}
            </span>
          </div>
        </div>
      )}

      {/* Detailed Comments Overlay Drawer Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl glass-card border border-white/5 text-slate-100 flex flex-col md:flex-row h-[500px] shadow-2xl overflow-hidden">
            
            {/* Left Media frame (hidden on mobile to save space) */}
            <div className="hidden md:block md:w-1/2 bg-slate-950 border-r border-slate-900 relative">
              <img src={showCommentModal.url} alt="Target comment" className="w-full h-full object-cover" />
            </div>

            {/* Right Comment details section */}
            <div className="flex-grow flex flex-col h-full bg-slate-950/40 p-4">
              
              {/* Header block */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{showCommentModal.title}</span>
                  <span className="text-[9px] text-slate-500">Comments: {showCommentModal.comments?.length || 0}</span>
                </div>
                <button onClick={() => setShowCommentModal(null)} className="text-slate-500 hover:text-white">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Comments Timeline */}
              <div className="flex-grow overflow-y-auto py-3 flex flex-col gap-3">
                {showCommentModal.comments?.length === 0 ? (
                  <div className="my-auto text-center text-[10px] text-slate-500 italic">
                    No comments yet. Write the first response!
                  </div>
                ) : (
                  showCommentModal.comments?.map((comment) => (
                    <div key={comment._id} className="flex items-start gap-2 bg-slate-900/20 p-2 rounded-xl">
                      <img
                        src={comment.user?.avatar || 'https://via.placeholder.com/150'}
                        alt={comment.user?.username}
                        className="h-6.5 w-6.5 rounded-full object-cover mt-0.5"
                      />
                      <div className="flex-grow flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-300">{comment.user?.username}</span>
                          {(comment.user?._id === user._id || showCommentModal.uploader?._id === user._id || user.role === 'Admin') && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-[8px] text-rose-500 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Send Comment box */}
              <form onSubmit={handleAddComment} className="border-t border-slate-900 pt-3 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow rounded-xl py-2 px-3 text-[11px] glass-input font-medium"
                  required
                />
                <button
                  type="submit"
                  className={`rounded-xl px-3 flex items-center justify-center cursor-pointer ${getAccentBtn()}`}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Memories;
