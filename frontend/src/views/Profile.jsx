import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  User, Mail, Phone, Calendar as CalIcon, 
  Briefcase, GraduationCap, Github, Linkedin, 
  Instagram, Twitter, Edit3, Save, Camera, Quote, Trophy
} from 'lucide-react';

export const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const { themeColor } = useTheme();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [college, setCollege] = useState('');
  const [job, setJob] = useState('');
  const [phone, setPhone] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [birthday, setBirthday] = useState('');
  const [socialGithub, setSocialGithub] = useState('');
  const [socialLinkedin, setSocialLinkedin] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');

  // Image files states
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  const isOwnProfile = !id || id === currentUser?._id;
  const profileId = id || currentUser?._id;

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-750';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-750';
      case 'rose': return 'bg-rose-600 hover:bg-rose-750';
      case 'amber': return 'bg-amber-600 hover:bg-amber-750';
      case 'girls': return 'bg-pink-400 hover:bg-pink-500 text-slate-950 font-bold';
      case 'indigo':
      default: return 'bg-indigo-600 hover:bg-indigo-750';
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

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Friend of the Month': return 'from-amber-500 to-yellow-600 border-amber-400 text-amber-100';
      case 'Brainiac': return 'from-purple-500 to-indigo-600 border-purple-400 text-purple-100';
      case 'Chatterbox': return 'from-rose-500 to-pink-600 border-rose-400 text-rose-100';
      case 'Scholar uploader': return 'from-emerald-500 to-teal-600 border-emerald-400 text-emerald-100';
      case 'Cloud Pioneer': return 'from-sky-500 to-blue-650 border-sky-400 text-sky-100';
      default: return 'from-slate-700 to-slate-800 border-slate-600 text-slate-300';
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/users/${profileId}`);
      setUser(res.data);
      
      // Load form defaults
      setBio(res.data.bio || '');
      setSkills(res.data.skills?.join(', ') || '');
      setCollege(res.data.college || '');
      setJob(res.data.job || '');
      setPhone(res.data.phone || '');
      setFavoriteQuote(res.data.favoriteQuote || '');
      setBirthday(res.data.birthday ? new Date(res.data.birthday).toISOString().split('T')[0] : '');
      setSocialGithub(res.data.socialLinks?.github || '');
      setSocialLinkedin(res.data.socialLinks?.linkedin || '');
      setSocialInstagram(res.data.socialLinks?.instagram || '');
      setSocialTwitter(res.data.socialLinks?.twitter || '');
      
      setAvatarPreview(res.data.avatar || '');
      setCoverPreview(res.data.coverImage || '');
    } catch (err) {
      setError('Could not load user profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    setEditMode(false);
  }, [profileId]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('college', college);
    formData.append('job', job);
    formData.append('phone', phone);
    formData.append('favoriteQuote', favoriteQuote);
    formData.append('birthday', birthday);
    
    // Parse comma separated skills
    const parsedSkills = skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    parsedSkills.forEach((s, index) => {
      formData.append(`skills[${index}]`, s);
    });

    formData.append('socialLinks[github]', socialGithub);
    formData.append('socialLinks[linkedin]', socialLinkedin);
    formData.append('socialLinks[instagram]', socialInstagram);
    formData.append('socialLinks[twitter]', socialTwitter);

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    if (coverFile) {
      formData.append('coverImage', coverFile);
    }

    const res = await updateProfile(formData);
    if (res.success) {
      setUser(res.user);
      setSuccess('Profile updated successfully.');
      setEditMode(false);
      // Clean temporary preview files
      setAvatarFile(null);
      setCoverFile(null);
    } else {
      setError(res.message);
    }
  };

  if (loading) return <Loader />;
  if (error && !user) return <div className="text-center py-12 text-rose-400">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Cover and Avatar Segment */}
      <div className="relative rounded-3xl border border-slate-900 bg-slate-950/45 shadow-xl overflow-hidden">
        {/* Cover Image banner */}
        <div className="h-44 md:h-60 bg-slate-900 relative">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 to-indigo-950 flex items-center justify-center">
              <span className="text-slate-700 text-xs font-bold uppercase tracking-wider">No Cover Image</span>
            </div>
          )}

          {editMode && (
            <label className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-slate-950/80 px-3 py-1.5 text-xs text-white border border-slate-800 hover:bg-slate-900 cursor-pointer shadow-lg backdrop-blur-sm">
              <Camera className="h-4 w-4" /> Change Cover
              <input type="file" onChange={handleCoverChange} className="hidden" accept="image/*" />
            </label>
          )}
        </div>

        {/* Profile Avatar & Details Overlay */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-4 -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
            <div className="relative h-32 w-32 md:h-36 md:w-36 rounded-3xl border-4 border-slate-950 bg-slate-900 shadow-2xl overflow-hidden">
              <img
                src={avatarPreview || 'https://via.placeholder.com/150'}
                alt={user.username}
                className="w-full h-full object-cover"
              />
              {editMode && (
                <label className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Upload</span>
                  <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
                </label>
              )}
            </div>

            <div className="pb-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-black text-white">{user.username}</h2>
                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${
                  user.role === 'Admin' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{user.bio || 'This user hasn\'t written a bio yet.'}</p>
            </div>
          </div>

          {/* Edit / Save Action Triggers */}
          {isOwnProfile && (
            <div className="pb-2">
              {editMode ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditMode(false);
                      fetchProfile(); // Reset previews and forms
                    }}
                    className="rounded-xl px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className={`rounded-xl px-4 py-2.5 text-xs text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${getAccentBtn()}`}
                  >
                    <Save className="h-4 w-4" /> Save Profile
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className={`rounded-xl px-4 py-2.5 text-xs text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${getAccentBtn()}`}
                >
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/25 p-3.5 text-xs text-emerald-300">
          {success}
        </div>
      )}

      {/* Profile Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {editMode ? (
            // Edit Mode Form
            <form onSubmit={handleSave} className="rounded-2xl border border-slate-900 bg-slate-950/45 p-6 shadow-lg flex flex-col gap-4">
              <span className="text-sm font-bold text-white border-b border-slate-900 pb-2">Edit Details</span>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Short Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your friends something about you..."
                  className="w-full rounded-xl p-3 text-xs glass-input font-medium min-h-20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">College / University</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="IIT Hyderabad"
                    className="w-full rounded-xl p-3 text-xs glass-input font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">Job / Profession</label>
                  <input
                    type="text"
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                    placeholder="Software Engineering Intern"
                    className="w-full rounded-xl p-3 text-xs glass-input font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-xl p-3 text-xs glass-input font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">Birthday</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full rounded-xl p-3 text-xs glass-input font-medium text-slate-300"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, Python, Figma"
                  className="w-full rounded-xl p-3 text-xs glass-input font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Favorite Quote</label>
                <input
                  type="text"
                  value={favoriteQuote}
                  onChange={(e) => setFavoriteQuote(e.target.value)}
                  placeholder="What inspires you?"
                  className="w-full rounded-xl p-3 text-xs glass-input font-medium"
                />
              </div>

              <span className="text-xs font-bold text-slate-400 mt-2 border-b border-slate-900 pb-1.5 uppercase tracking-wider">Social Accounts</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500 font-semibold">GitHub Username</label>
                  <input
                    type="text"
                    value={socialGithub}
                    onChange={(e) => setSocialGithub(e.target.value)}
                    placeholder="github_username"
                    className="w-full rounded-xl p-3 text-xs glass-input font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500 font-semibold">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={socialLinkedin}
                    onChange={(e) => setSocialLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-xl p-3 text-xs glass-input font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500 font-semibold">Instagram Username</label>
                  <input
                    type="text"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    placeholder="insta_id"
                    className="w-full rounded-xl p-3 text-xs glass-input font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-500 font-semibold">Twitter / X handle</label>
                  <input
                    type="text"
                    value={socialTwitter}
                    onChange={(e) => setSocialTwitter(e.target.value)}
                    placeholder="twitter_id"
                    className="w-full rounded-xl p-3 text-xs glass-input font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 rounded-xl text-xs font-bold text-white transition-all shadow-md mt-2 cursor-pointer ${getAccentBtn()}`}
              >
                Save Profile Changes
              </button>

            </form>
          ) : (
            // View Mode Details list
            <div className="flex flex-col gap-6">
              
              {/* Profile Details Card */}
              <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-6 shadow-lg flex flex-col gap-5">
                <span className="text-sm font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-indigo-400" /> About Friend
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  
                  <div className="flex items-center gap-3.5 rounded-xl bg-slate-900/35 p-3">
                    <Mail className="h-5 w-5 text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Email</span>
                      <span className="text-slate-200 mt-0.5">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-xl bg-slate-900/35 p-3">
                    <Phone className="h-5 w-5 text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Phone</span>
                      <span className="text-slate-200 mt-0.5">{user.phone || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-xl bg-slate-900/35 p-3">
                    <CalIcon className="h-5 w-5 text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Birthday</span>
                      <span className="text-slate-200 mt-0.5">
                        {user.birthday ? new Date(user.birthday).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-xl bg-slate-900/35 p-3">
                    <GraduationCap className="h-5 w-5 text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Education</span>
                      <span className="text-slate-200 mt-0.5">{user.college || 'Not provided'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 rounded-xl bg-slate-900/35 p-3 md:col-span-2">
                    <Briefcase className="h-5 w-5 text-slate-500" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Job / Profession</span>
                      <span className="text-slate-200 mt-0.5">{user.job || 'Not provided'}</span>
                    </div>
                  </div>

                </div>

                {/* Skills array list */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Expertise / Skills</span>
                  {user.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.skills.map((skill) => (
                        <span key={skill} className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-1 text-xs text-slate-300 font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 italic">No skills listed.</span>
                  )}
                </div>
              </div>

              {/* Fav Quote Card */}
              {user.favoriteQuote && (
                <div className="rounded-2xl border border-indigo-500/10 bg-indigo-950/10 p-5 shadow-lg flex gap-4 items-start">
                  <Quote className="h-6 w-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Inspirational Quote</span>
                    <p className="text-sm text-indigo-200 font-medium italic leading-relaxed mt-1">"{user.favoriteQuote}"</p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Column (Achievements & Social Links) */}
        <div className="flex flex-col gap-6">
          
          {/* Achievements Badges */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
            <span className="text-sm font-bold text-white border-b border-slate-900 pb-2 flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-indigo-400" /> Unlock Badges
            </span>

            <div className="flex flex-col gap-3">
              {user.achievements && user.achievements.length > 0 ? (
                user.achievements.map((ach) => (
                  <div
                    key={ach}
                    className={`rounded-xl border p-3 flex items-center gap-3 bg-gradient-to-r shadow-md ${getBadgeColor(ach)}`}
                  >
                    <Trophy className="h-6 w-6 flex-shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-black tracking-wide leading-tight">{ach}</span>
                      <span className="text-[10px] opacity-75 leading-relaxed font-light">
                        {ach === 'Friend of the Month' ? 'Topped the global points leaderboard!' :
                         ach === 'Brainiac' ? 'Answered a full trivia quiz correctly!' :
                         ach === 'Chatterbox' ? 'Shared over 100 chat messages!' :
                         ach === 'Scholar uploader' ? 'Shared over 5 notes items!' :
                         ach === 'Cloud Pioneer' ? 'Uploaded over 5 drive files!' :
                         'Granted for active participation in the platform.'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No achievement badges unlocked yet. Start chatting, uploading, or play quizzes to unlock!
                </div>
              )}
            </div>
          </div>

          {/* Social Profiles Connect list */}
          <div className="rounded-2xl border border-slate-900 bg-slate-950/45 p-5 shadow-lg flex flex-col gap-4">
            <span className="text-sm font-bold text-white border-b border-slate-900 pb-2">Social Connect</span>
            
            <div className="flex flex-col gap-2.5">
              {user.socialLinks?.github ? (
                <a
                  href={`https://github.com/${user.socialLinks.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-slate-900/40 border border-slate-800 p-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-700 transition-all font-medium"
                >
                  <span className="flex items-center gap-2"><Github className="h-4.5 w-4.5 text-slate-400" /> GitHub</span>
                  <span className="text-[10px] text-slate-500">@{user.socialLinks.github}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-slate-900/20 border border-dashed border-slate-800 p-2.5 text-xs text-slate-500 italic">
                  <Github className="h-4.5 w-4.5 opacity-40" /> GitHub not connected
                </div>
              )}

              {user.socialLinks?.linkedin ? (
                <a
                  href={user.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-slate-900/40 border border-slate-800 p-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-700 transition-all font-medium"
                >
                  <span className="flex items-center gap-2"><Linkedin className="h-4.5 w-4.5 text-sky-500" /> LinkedIn</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-24">Link Connected</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-slate-900/20 border border-dashed border-slate-800 p-2.5 text-xs text-slate-500 italic">
                  <Linkedin className="h-4.5 w-4.5 opacity-40" /> LinkedIn not connected
                </div>
              )}

              {user.socialLinks?.instagram ? (
                <a
                  href={`https://instagram.com/${user.socialLinks.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-slate-900/40 border border-slate-800 p-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-700 transition-all font-medium"
                >
                  <span className="flex items-center gap-2"><Instagram className="h-4.5 w-4.5 text-pink-500" /> Instagram</span>
                  <span className="text-[10px] text-slate-500">@{user.socialLinks.instagram}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-slate-900/20 border border-dashed border-slate-800 p-2.5 text-xs text-slate-500 italic">
                  <Instagram className="h-4.5 w-4.5 opacity-40" /> Instagram not connected
                </div>
              )}

              {user.socialLinks?.twitter ? (
                <a
                  href={`https://twitter.com/${user.socialLinks.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl bg-slate-900/40 border border-slate-800 p-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-900 hover:border-slate-700 transition-all font-medium"
                >
                  <span className="flex items-center gap-2"><Twitter className="h-4.5 w-4.5 text-slate-400" /> Twitter / X</span>
                  <span className="text-[10px] text-slate-500">@{user.socialLinks.twitter}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-slate-900/20 border border-dashed border-slate-800 p-2.5 text-xs text-slate-500 italic">
                  <Twitter className="h-4.5 w-4.5 opacity-40" /> Twitter not connected
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
