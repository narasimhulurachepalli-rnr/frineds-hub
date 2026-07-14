import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Loader from '../components/Loader';
import { 
  ChevronLeft, ChevronRight, Calendar as CalIcon, Plus, 
  X, Check, Clock, User, Info, MapPin
} from 'lucide-react';

export const CalendarView = () => {
  const { user } = useAuth();
  const { themeColor } = useTheme();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar navigations
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Selected detail modal / creation states
  const [selectedDay, setSelectedDay] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // New Event Forms
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('other');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');

  const getAccentBtn = () => {
    switch (themeColor) {
      case 'violet': return 'bg-violet-600 hover:bg-violet-700';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'rose': return 'bg-rose-600 hover:bg-rose-700';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700';
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
      case 'indigo':
      default: return 'text-indigo-400';
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Fetch calendar events error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Helper arrays for calendar grids
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday etc.
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const blankCells = Array(firstDayIndex).fill(null);
  
  const monthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    monthDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const calendarGridCells = [...blankCells, ...monthDays];

  // Match events to specific days
  const getEventsForDay = (date) => {
    if (!date) return [];
    return events.filter((evt) => {
      const evtStart = new Date(evt.start);
      return (
        evtStart.getDate() === date.getDate() &&
        evtStart.getMonth() === date.getMonth() &&
        evtStart.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!title || !selectedDay) return;

    // Combine date and time
    const startStr = `${selectedDay.toISOString().split('T')[0]}T${startTime}:00`;
    const endStr = `${selectedDay.toISOString().split('T')[0]}T${endTime}:00`;

    try {
      await api.post('/events', {
        title,
        description,
        type,
        start: new Date(startStr),
        end: new Date(endStr),
      });

      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setType('other');
      setStartTime('18:00');
      setEndTime('20:00');
      fetchEvents();
    } catch (error) {
      console.error('Create event error:', error.message);
    }
  };

  const handleAttendToggle = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/attend`);
      // Update selected event in view
      setSelectedEvent(res.data);
      // Synchronize dashboard / calendar lists
      fetchEvents();
    } catch (error) {
      console.error('Toggle attendance error:', error.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Delete event error:', error.message);
    }
  };

  const getEventBadgeClass = (type) => {
    switch (type) {
      case 'birthday': return 'bg-rose-950/40 text-rose-400 border border-rose-900/50';
      case 'trip': return 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50';
      case 'movie': return 'bg-purple-950/40 text-purple-400 border border-purple-900/50';
      case 'match': return 'bg-amber-950/40 text-amber-400 border border-amber-900/50';
      case 'other':
      default: return 'bg-slate-900/60 text-slate-400 border border-slate-800';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Title Header toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Workspace Calendars</span>
          <h1 className="text-2xl font-extrabold text-white mt-1">Calendar &amp; Scheduling</h1>
        </div>

        {/* Date Month switcher */}
        <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-1.5 self-stretch md:self-auto justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-bold text-white uppercase tracking-wider px-3">
            {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        /* Calendar Grid frame */
        <div className="rounded-3xl border border-slate-900 bg-slate-950/45 overflow-hidden shadow-xl">
          
          {/* Weekday titles */}
          <div className="grid grid-cols-7 border-b border-slate-900 bg-slate-950/80 text-center py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Monthly grid cell blocks */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {calendarGridCells.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isToday = day && new Date().setHours(0,0,0,0) === day.setHours(0,0,0,0);

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (day) {
                      setSelectedDay(day);
                      setShowCreateModal(true);
                    }
                  }}
                  className={`border-b border-r border-slate-900/60 p-2.5 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-900/10 min-h-20 md:min-h-24 ${
                    day ? 'bg-transparent' : 'bg-slate-950/10 cursor-default'
                  } ${isToday ? 'bg-indigo-950/10' : ''}`}
                >
                  {day && (
                    <span className={`text-[10px] font-bold rounded-lg px-2 py-1 ${
                      isToday 
                        ? 'bg-indigo-600 text-white shadow-inner font-mono' 
                        : 'text-slate-500 font-mono'
                    }`}>
                      {day.getDate()}
                    </span>
                  )}

                  {/* Day events badges overlay */}
                  <div className="w-full mt-2 flex flex-col gap-1 overflow-hidden">
                    {dayEvents.slice(0, 3).map((evt) => (
                      <button
                        key={evt._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className={`w-full text-left truncate text-[8px] font-extrabold rounded-lg px-1.5 py-1 ${getEventBadgeClass(evt.type)}`}
                      >
                        {evt.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[7px] text-indigo-400 font-bold self-center">
                        +{dayEvents.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-white/5 text-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-900">
              <span className="text-sm font-bold flex items-center gap-1.5">
                <CalIcon className="h-4.5 w-4.5 text-indigo-400" /> Add Event for{' '}
                {selectedDay.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. India vs Pak Match Screening"
                  className="w-full rounded-xl p-2.5 text-xs glass-input font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Event Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about where, when, and who..."
                  className="w-full rounded-xl p-2.5 text-xs glass-input font-medium min-h-16"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-semibold">Event Classification</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl p-2.5 text-xs bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                >
                  <option value="other">Other / Hangout</option>
                  <option value="movie">Movie Night</option>
                  <option value="match">Cricket Match Schedule</option>
                  <option value="trip">Trip Planning</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl p-2.5 text-xs glass-input font-medium text-slate-300"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400 font-semibold">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl p-2.5 text-xs glass-input font-medium text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md mt-2 cursor-pointer ${getAccentBtn()}`}
              >
                Create Group Event
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-2xl glass-card border border-white/5 text-slate-100 flex flex-col gap-5">
            
            {/* Header Details */}
            <div className="flex justify-between items-start pb-2 border-b border-slate-900">
              <div className="flex flex-col gap-1">
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full self-start ${getEventBadgeClass(selectedEvent.type)}`}>
                  {selectedEvent.type}
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-500 hover:text-white">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              {selectedEvent.description || 'No description provided.'}
            </p>

            {/* Time & Creator analytics */}
            <div className="flex flex-col gap-2 bg-slate-900/35 border border-slate-900 rounded-xl p-3.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>
                  {new Date(selectedEvent.start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              {selectedEvent.creator && (
                <div className="flex items-center gap-2 text-slate-300">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Scheduled by: <span className="font-bold text-slate-200">{selectedEvent.creator.username}</span></span>
                </div>
              )}
            </div>

            {/* Attendees list (for hangouts) */}
            {selectedEvent.type !== 'birthday' && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>Attendees ({selectedEvent.attendees?.length || 0})</span>
                  <button
                    onClick={() => handleAttendToggle(selectedEvent._id)}
                    className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                      selectedEvent.attendees?.find((a) => a._id === user._id) 
                        ? 'bg-rose-950 text-rose-400 border border-rose-900/40' 
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-900/40'
                    }`}
                  >
                    {selectedEvent.attendees?.find((a) => a._id === user._id) ? 'Leave Event' : 'Join Event'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedEvent.attendees?.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic">No one attending yet.</span>
                  ) : (
                    selectedEvent.attendees?.map((att) => (
                      <span key={att._id} className="flex items-center gap-1 bg-slate-900 border border-slate-850 rounded-full px-2 py-0.5 text-[9px] font-bold text-slate-300">
                        <img src={att.avatar || 'https://via.placeholder.com/150'} alt="Att" className="h-4 w-4 rounded-full object-cover" />
                        {att.username}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Delete events */}
            {!selectedEvent.dynamic && (selectedEvent.creator?._id === user._id || user.role === 'Admin') && (
              <button
                onClick={() => handleDeleteEvent(selectedEvent._id)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-950 border border-rose-900/50 hover:bg-rose-900 text-rose-300 transition-colors cursor-pointer mt-1"
              >
                Delete Event
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default CalendarView;
