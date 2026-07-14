import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  FileText, Plus, BookOpen, Bookmark, 
  ExternalLink, Search, Download, Trash2, Award, ChevronDown, ChevronUp, Link as LinkIcon
} from 'lucide-react';

const mockInterviewQuestions = [
  {
    company: "Amazon / Google",
    topic: "Reverse a Linked List in Groups of K",
    difficulty: "Hard",
    question: "Given a linked list, reverse the nodes of a linked list k at a time and return its modified list. k is a positive integer and is less than or equal to the length of the linked list.",
    solution: `\`\`\`javascript
function reverseKGroup(head, k) {
  let curr = head;
  let count = 0;
  while (curr && count !== k) {
    curr = curr.next;
    count++;
  }
  if (count === k) {
    curr = reverseKGroup(curr, k);
    while (count-- > 0) {
      let temp = head.next;
      head.next = curr;
      curr = head;
      head = temp;
    }
    head = curr;
  }
  return head;
}
\`\`\``
  },
  {
    company: "Microsoft / Uber",
    topic: "Design a Rate Limiter Middleware",
    difficulty: "Medium",
    question: "Explain the token bucket algorithm and write a mock Express middleware that limits users to 100 API requests per hour.",
    solution: `Use standard Token Bucket algorithm where a user bucket starts with 100 tokens, refilling at rate of 1 token per 36 seconds.
\`\`\`javascript
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  if (!buckets[ip]) buckets[ip] = { tokens: 100, lastRefill: Date.now() };
  refill(buckets[ip]);
  if (buckets[ip].tokens > 0) {
    buckets[ip].tokens--;
    next();
  } else {
    res.status(429).send("Too many requests");
  }
}
\`\`\``
  }
];

const mockTemplates = [
  { name: "Premium ATS Resume Template (Word)", url: "#", type: "Word" },
  { name: "Full Stack SDE Cover Letter Template (PDF)", url: "#", type: "PDF" },
  { name: "Behavioral Prep Worksheet (Google Doc)", url: "https://docs.google.com", type: "Doc" }
];

export const StudyHub = () => {
  const { user } = useAuth();
  const { themeColor } = useTheme();

  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Accordions for coding problems
  const [openProblem, setOpenProblem] = useState(null);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
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

  const getAccentTabStyle = (tab) => {
    if (activeTab === tab) {
      switch (themeColor) {
        case 'violet': return 'bg-violet-600/20 text-violet-300 border-b-2 border-violet-500';
        case 'emerald': return 'bg-emerald-600/20 text-emerald-300 border-b-2 border-emerald-500';
        case 'rose': return 'bg-rose-600/20 text-rose-300 border-b-2 border-rose-500';
        case 'amber': return 'bg-amber-600/20 text-amber-300 border-b-2 border-amber-500';
        case 'girls': return 'bg-pink-400/20 text-pink-300 border-b-2 border-pink-400 font-bold';
        case 'indigo':
        default: return 'bg-indigo-600/20 text-indigo-300 border-b-2 border-indigo-500';
      }
    }
    return 'text-slate-400 hover:text-white hover:bg-slate-900/30';
  };

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/files', { params: { category: 'Study' } });
      setMaterials(res.data);
    } catch (error) {
      console.error('Fetch study files error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'materials') {
      fetchMaterials();
    }
  }, [activeTab]);

  const handleUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadName(file.name);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('category', 'Study');

    try {
      await api.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadName('');
      fetchMaterials();
    } catch (error) {
      console.error('Upload note file error:', error.message);
      alert('Failed to upload note.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this notes file?')) return;
    try {
      await api.delete(`/files/${id}`);
      fetchMaterials();
    } catch (error) {
      console.error('Delete file error:', error.message);
    }
  };

  const handleDownload = async (id, url) => {
    try {
      await api.post(`/files/${id}/download`);
      window.open(url, '_blank');
      fetchMaterials();
    } catch (error) {
      console.error('Download increment error:', error.message);
    }
  };

  const toggleBookmark = async (id) => {
    try {
      await api.post(`/files/${id}/bookmark`);
      fetchMaterials();
    } catch (error) {
      console.error('Bookmark toggle error:', error.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header with actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Workspace Education</span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Study Hub &amp; Resources</h1>
        </div>

        {activeTab === 'materials' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className={`rounded-xl px-4 py-2.5 text-xs text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${getAccentBtn()}`}
          >
            <Plus className="h-4.5 w-4.5" /> Upload Study Notes
          </button>
        )}
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-900">
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('materials')}`}
        >
          <BookOpen className="h-4 w-4" /> Study Materials
        </button>
        <button
          onClick={() => setActiveTab('coding')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('coding')}`}
        >
          <Award className="h-4 w-4" /> Interview Prep
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all ${getAccentTabStyle('links')}`}
        >
          <LinkIcon className="h-4 w-4" /> Guides &amp; Templates
        </button>
      </div>

      {/* View Content Panels */}
      {activeTab === 'materials' && (
        <div className="flex flex-col gap-4">
          {loading ? (
            <Loader />
          ) : materials.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-slate-900 bg-slate-950/45 text-xs text-slate-500 italic">
              No study notes uploaded yet. Be the first to share!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((file) => {
                const isBookmarked = file.bookmarks?.includes(user._id);
                return (
                  <div key={file._id} className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col justify-between hover:border-slate-800 transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <div className="p-2.5 rounded-xl bg-indigo-950/30 text-indigo-400 border border-indigo-900/40">
                          <FileText className="h-5.5 w-5.5" />
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

                      <h3 className="text-xs font-bold text-slate-200 mt-4 line-clamp-1">{file.name}</h3>
                      <p className="text-[10px] text-slate-500 mt-1 capitalize">Uploader: {file.uploader?.username || 'user'}</p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                      <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                      <button
                        onClick={() => handleDownload(file._id, file.url)}
                        className="flex items-center gap-1 text-indigo-400 hover:text-white transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" /> {file.downloads || 0}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'coding' && (
        <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-6 shadow-lg flex flex-col gap-6">
          <div className="border-b border-slate-900 pb-3 flex flex-col gap-1">
            <h2 className="text-sm font-extrabold text-white">Interactive Coding Exercises</h2>
            <p className="text-xs text-slate-500">Practice questions frequently asked in placement processes.</p>
          </div>

          <div className="flex flex-col gap-4">
            {mockInterviewQuestions.map((q, idx) => {
              const isOpen = openProblem === idx;
              return (
                <div key={q.topic} className="rounded-xl border border-slate-900 bg-slate-900/20 overflow-hidden">
                  <button
                    onClick={() => setOpenProblem(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-900/30 transition-colors text-left"
                  >
                    <div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        q.difficulty === 'Hard' ? 'bg-rose-950 text-rose-300 border border-rose-900/50' : 'bg-amber-950 text-amber-300 border border-amber-900/50'
                      }`}>
                        {q.difficulty}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200 mt-2">{q.topic} &bull; <span className="text-slate-500">{q.company}</span></h4>
                    </div>
                    {isOpen ? <ChevronUp className="h-4.5 w-4.5 text-slate-400" /> : <ChevronDown className="h-4.5 w-4.5 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-900 flex flex-col gap-3">
                      <p className="text-xs text-slate-400 leading-relaxed font-light">{q.question}</p>
                      
                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Optimal Solution:</span>
                        <pre className="rounded-xl bg-slate-950 border border-slate-900 p-4 text-[10px] text-indigo-300 font-mono overflow-x-auto leading-normal">
                          {q.solution}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Column */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
            <span className="text-sm font-bold text-white border-b border-slate-900 pb-2">Placement Documents</span>
            <div className="flex flex-col gap-3">
              {mockTemplates.map((tmp) => (
                <div key={tmp.name} className="flex justify-between items-center bg-slate-900/20 border border-slate-900 p-3 rounded-xl hover:border-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-300">{tmp.name}</span>
                  </div>
                  <a
                    href={tmp.url}
                    className="rounded-lg p-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Placement Guides Card */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
            <span className="text-sm font-bold text-white border-b border-slate-900 pb-2">Guides &amp; Portals</span>
            <div className="flex flex-col gap-3 text-xs">
              <a href="https://leetcode.com" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-slate-900/30 p-2.5 border border-slate-800 text-slate-300 hover:text-white">
                <span>LeetCode Practice</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              </a>
              <a href="https://geeksforgeeks.org" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-slate-900/30 p-2.5 border border-slate-800 text-slate-300 hover:text-white">
                <span>GeeksForGeeks CS Core</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              </a>
              <a href="https://resume.io" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-slate-900/30 p-2.5 border border-slate-800 text-slate-300 hover:text-white">
                <span>Resume Builder</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Upload notes overlay Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-white/5 text-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-sm font-bold">Upload Study Notes File</span>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-500 hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-semibold">Select File (PDF, DOCX, PPT, ZIP up to 100MB)</label>
                <div className="border border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-900/20 hover:bg-slate-900/40 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    onChange={handleUploadChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  <FileText className="h-10 w-10 text-slate-600 mb-2" />
                  <span className="text-xs text-slate-400 font-bold text-center">
                    {uploadName ? uploadName : "Drag & Drop or Click to browse"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md mt-2 cursor-pointer ${getAccentBtn()}`}
              >
                {isUploading ? "Uploading file..." : "Publish Notes"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudyHub;
