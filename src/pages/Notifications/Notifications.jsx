import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, UserPlus, MessageCircle, Bell, Trash2, CheckCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Notifications.css';

const Notifications = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    fetchNotifications,
  } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'like':    return <Heart size={18} className="notif-icon-like" fill="currentColor" />;
      case 'comment': return <MessageCircle size={18} className="notif-icon-comment" />;
      case 'follow':  return <UserPlus size={18} className="notif-icon-follow" />;
      default:        return <Bell size={18} />;
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay < 7) return `${diffDay} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handleClick = (notif) => {
    // Tandai dibaca di background, navigasi langsung
    if (!notif.isRead) markNotificationRead(notif.id);
    if (notif.postId) navigate(`/post/${notif.postId}`);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-container">
      {/* Header */}
      <div className="notifications-header">
        <div className="notif-header-left">
          <h2>Notifikasi</h2>
          {unreadCount > 0 && (
            <span className="notif-header-badge">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="notif-read-all-btn" onClick={markAllNotificationsRead}>
            <CheckCheck size={16} />
            Baca semua
          </button>
        )}
      </div>

      {/* List */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} strokeWidth={1.2} className="empty-icon" />
            <p className="empty-title">Belum ada notifikasi</p>
            <p className="empty-sub">Notifikasi akan muncul saat ada yang like, komentar, atau follow kamu</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-card ${!notif.isRead ? 'notification-card--unread' : ''}`}
              onClick={() => handleClick(notif)}
            >
              {/* Avatar + type badge */}
              <div className="notif-avatar-wrap">
                <img
                  src={
                    notif.actor?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.actor?.name || 'User')}&background=random`
                  }
                  alt={notif.actor?.name}
                  className="notif-avatar"
                />
                <span className={`notif-type-badge notif-type-${notif.type}`}>
                  {getIcon(notif.type)}
                </span>
              </div>

              {/* Content */}
              <div className="notif-content">
                <p className="notif-text">{notif.message}</p>
                {notif.post?.content && (
                  <p className="notif-preview">
                    "{notif.post.content.slice(0, 60)}{notif.post.content.length > 60 ? '…' : ''}"
                  </p>
                )}
                <span className="notif-time">{formatTime(notif.createdAt)}</span>
              </div>

              {/* Right: unread + delete */}
              <div className="notif-right">
                {!notif.isRead && <span className="notif-unread-dot" />}
                <button
                  className="notif-delete-btn"
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                  title="Hapus notifikasi"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
