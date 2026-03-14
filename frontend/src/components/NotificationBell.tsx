import { useState, useEffect, useRef } from 'react';
import { notificationAPI } from '../services/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

const typeIcon: Record<string, string> = {
  preference_submitted: '✅',
  new_preference: '📝',
  allocation_result: '🎯',
  default: '🔔',
};

const typeColor: Record<string, string> = {
  preference_submitted: 'from-green-400 to-teal-400',
  new_preference: 'from-blue-400 to-indigo-400',
  allocation_result: 'from-pink-400 to-purple-400',
  default: 'from-gray-400 to-gray-500',
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications);
      setUnread(res.data.unread);
    } catch {
      // silently fail
    }
  };

  // Poll every 15 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: number) => {
    await notificationAPI.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnread(0);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationAPI.delete(id);
    const n = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (n && !n.is_read) setUnread(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-sm border border-white/50 hover:bg-white/80 transition-all duration-200 hover:scale-110"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, #FF9AB7, #e0ff70ff)' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] rounded-3xl shadow-2xl overflow-hidden z-50 animate-fadeIn"
          style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,154,183,0.2)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #FF9AB7 0%, #93C5FD 100%)' }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-white font-bold">Notifications</span>
              {unread > 0 && (
                <span className="bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} new</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={handleMarkAllRead}
                className="text-white/80 hover:text-white text-xs font-medium transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`flex gap-3 px-4 py-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-pink-50/50 ${!n.is_read ? 'bg-pink-50/30' : ''}`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center text-lg bg-gradient-to-br ${typeColor[n.type] || typeColor.default}`}>
                    {typeIcon[n.type] || typeIcon.default}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold text-gray-900 ${!n.is_read ? 'font-bold' : ''}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #FF9AB7, #FF7096)' }} />
                        )}
                        <button onClick={(e) => handleDelete(n.id, e)}
                          className="text-gray-300 hover:text-red-400 transition-colors p-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">{notifications.length} total notification{notifications.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
