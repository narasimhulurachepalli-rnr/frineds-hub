import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { getFileUrl } from '../utils/helpers';
import { 
  HardDrive, Plus, Bookmark, FileText, 
  Download, Trash2, ShieldAlert, Sparkles, Filter
} from 'lucide-react';

export const FileShare = () => {
  const { user } = useAuth();
  const { themeColor } = useTheme();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files', { params: { category: 'General' } });
      setFiles(res.data);
    } catch (error) {
      console.error('Fetch drive files error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFileToServer(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFileToServer(e.target.files[0]);
    }
  };

  const uploadFileToServer = async (file) => {
    if (file.size > 100 * 1024 * 1024) {
      alert("File size exceeds 100MB limit.");
      return;
    }

    setIsUploading(true);
    setSuccessMsg('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'General');

    try {
      await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg(`"${file.name}" uploaded successfully.`);
      fetchFiles();
    } catch (error) {
      console.error('File upload error:', error.message);
      alert('Failed to upload file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await api.delete(`/files/${id}`);
      fetchFiles();
    } catch (error) {
      console.error('Delete file error:', error.message);
    }
  };

  const handleDownload = async (id, url) => {
    try {
      await api.post(`/files/${id}/download`);
      window.open(getFileUrl(url), '_blank');
      fetchFiles();
    } catch (error) {
      console.error('Increment download error:', error.message);
    }
  };

  const toggleBookmark = async (id) => {
    try {
      await api.post(`/files/${id}/bookmark`);
      fetchFiles();
    } catch (error) {
      console.error('Bookmark error:', error.message);
    }
  };

  // Filter list
  const filteredFiles = files.filter((f) => {
    if (filterType === 'all') return true;
    if (filterType === 'image') return f.type === 'image';
    if (filterType === 'video') return f.type === 'video';
    if (filterType === 'pdf') return f.type === 'pdf';
    if (filterType === 'zip') return f.type === 'zip';
    return f.type === 'other';
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header and statistics panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> General Storage Drive
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Cloud File Share</h1>
        </div>

        <div className="flex gap-2.5">
          <label className={`rounded-xl px-4 py-2.5 text-xs text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${getAccentBtn()}`}>
            <Plus className="h-4.5 w-4.5" /> Upload File
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* Upload feedbacks */}
      {successMsg && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/25 p-3.5 text-xs text-emerald-300">
          {successMsg}
        </div>
      )}

      {/* Drag and Drop Container Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-950/15' 
            : 'border-slate-800 bg-slate-950/30'
        }`}
      >
        <HardDrive className={`h-12 w-12 text-slate-600 mb-2.5 ${isUploading ? 'animate-bounce' : ''}`} />
        <span className="text-xs text-slate-400 font-bold">
          {isUploading ? "Uploading drive payload..." : "Drag & Drop files here, or click to upload (100MB limit)"}
        </span>
        <input type="file" onChange={handleFileChange} className="absolute opacity-0 cursor-pointer w-32 h-10" disabled={isUploading} />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-3">
        <div className="flex flex-wrap gap-2 text-xs">
          {['all', 'image', 'video', 'pdf', 'zip'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`rounded-xl px-3.5 py-1.5 font-semibold capitalize transition-all border ${
                filterType === type 
                  ? 'bg-slate-900 border-slate-700 text-white' 
                  : 'border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/30'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        
        <span className="text-[10px] text-slate-500 font-bold uppercase">
          Total Drive Files: {filteredFiles.length}
        </span>
      </div>

      {/* Document Grid layout */}
      {loading ? (
        <Loader />
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-16 text-xs text-slate-500 italic border border-slate-900 bg-slate-950/45 rounded-2xl">
          No files matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFiles.map((file) => {
            const isBookmarked = file.bookmarks?.includes(user._id);
            return (
              <div key={file._id} className="rounded-2xl border border-slate-900 bg-slate-950/45 p-4.5 shadow-lg flex flex-col justify-between hover:border-slate-800 transition-colors">
                
                <div className="flex justify-between items-start gap-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-indigo-400 border border-slate-850">
                    <FileText className="h-5 w-5" />
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleBookmark(file._id)}
                      className="rounded-lg p-1.5 hover:bg-slate-900 text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    {(file.uploader?._id === user._id || user.role === 'Admin') && (
                      <button
                        onClick={() => handleDelete(file._id)}
                        className="rounded-lg p-1.5 hover:bg-slate-900 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-bold text-slate-200 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-[9px] text-slate-500 mt-1 capitalize leading-normal">
                    Uploaded by: {file.uploader?.username || 'user'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-900 flex justify-between items-center text-[9px] text-slate-400 font-semibold">
                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <button
                    onClick={() => handleDownload(file._id, file.url)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-white transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> {file.downloads || 0} Downloads
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default FileShare;
