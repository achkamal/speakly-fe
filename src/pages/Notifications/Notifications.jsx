import { useAppContext } from '../../context/AppContext';
import { Heart, UserPlus, MessageCircle } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
  const { notifications } = useAppContext();

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={20} className="notif-icon-like" />;
      case 'follow': return <UserPlus size={20} className="notif-icon-follow" />;
      case 'mention': return <MessageCircle size={20} className="notif-icon-mention" />;
      default: return <Bell size={20} />;
    }
  };

  const getAvatar = () => {
    // Generate a random avatar based on type just to show variations
    return `https://ui-avatars.com/api/?background=random&name=User`;
  };

  return (
    <div className="notifications-container">
      <div className="notifications-header glass">
        <h2>Notifications</h2>
      </div>

      <div className="notifications-list">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification-card">
            <div className="notif-icon-wrapper">
              {getIcon(notif.type)}
            </div>
            <img src={getAvatar()} alt="avatar" className="notif-avatar" />
            
            <div className="notif-content">
              <p className="notif-text">{notif.text}</p>
              <span className="notif-time">{notif.time}</span>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="empty-state">No notifications right now</div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
