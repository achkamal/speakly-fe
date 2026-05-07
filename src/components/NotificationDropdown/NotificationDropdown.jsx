import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, UserPlus, Bell, Trash2, CheckCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './NotificationDropdown.css';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useAppContext();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Tutup dropdown kalau klik di luar (pakai pointerdown agar tidak bentrok dengan onClick item)
  useEffect(() => {
    const handlePointerDown = (e) => {
      // Cek apakah klik di luar dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Defer sedikit agar onClick item sempat terpanggil duluan
        setTimeout(onClose, 0);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'like':    return <Heart size={14} className="nd-type-icon nd-icon-like" fill="currentColor" />;
      case 'comment': return <MessageCircle size={14} className="nd-type-icon nd-icon-comment" />;
      case 'follow':  return <UserPlus size={14} className="nd-type-icon nd-icon-follow" />;
      default:        return <Bell size={14} className="nd-type-icon" />;
    }
  };

  const handleNotifClick = (notif) => {
    // Tandai dibaca di background — tidak perlu await agar navigasi langsung
    if (!notif.isRead) {
      markNotificationRead(notif.id);
    }

    // Navigasi langsung ke postingan (like/comment) atau tutup saja (follow)
    if (notif.postId) {
      navigate(`/post/${notif.postId}`);
    }

    onClose();
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    await deleteNotification(notifId);
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}j`;
    if (diffDay < 7) return `${diffDay}h`;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="nd-overlay" ref={dropdownRef}>
      {/* Header */}
      <div className="nd-header">
        <span className="nd-title">Notifikasi</span>
        {notifications.some(n => !n.isRead) && (
          <button className="nd-mark-all" onClick={markAllNotificationsRead} title="Tandai semua dibaca">
            <CheckCheck size={16} />
            <span>Baca semua</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="nd-list">
        {notifications.length === 0 ? (
          <div className="nd-empty">
            <Bell size={32} strokeWidth={1.5} className="nd-empty-icon" />
            <p>Belum ada notifikasi</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`nd-item ${!notif.isRead ? 'nd-item--unread' : ''}`}
              onClick={() => handleNotifClick(notif)}
            >
              {/* Avatar + type icon */}
              <div className="nd-avatar-wrap">
                <img
                  src={notif.actor?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.actor?.name || 'User')}&background=random`}
                  alt={notif.actor?.name}
                  className="nd-avatar"
                />
                <span className="nd-type-badge">
                  {getIcon(notif.type)}
                </span>
              </div>

              {/* Content */}
              <div className="nd-content">
                <p className="nd-message">{notif.message}</p>
                <span className="nd-time">{formatTime(notif.createdAt)}</span>
              </div>

              {/* Unread dot + delete */}
              <div className="nd-actions">
                {!notif.isRead && <span className="nd-dot" />}
                <button
                  className="nd-delete-btn"
                  onClick={(e) => handleDelete(e, notif.id)}
                  title="Hapus notifikasi"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
