import { Bell, ChevronDown } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './SidebarRight.css';

const MOCK_SUGGESTED = [
  { id: 1, name: '@hello_dev', username: '@alex_dev', avatar: 'https://ui-avatars.com/api/?name=Alex&background=random' },
  { id: 2, name: '@alex_dev', username: '@alex_dev', avatar: 'https://ui-avatars.com/api/?name=Bob&background=random' },
  { id: 3, name: '@alex_dev', username: '@alex_dev', avatar: 'https://ui-avatars.com/api/?name=Charlie&background=random' },
  { id: 4, name: '@alex_dev', username: '@alex_dev', avatar: 'https://ui-avatars.com/api/?name=Dave&background=random' },
];

const SidebarRight = () => {
  const { currentUser } = useAppContext();

  return (
    <div className="sidebar-right-container">
      <div className="sidebar-right-header">
        <button className="btn-icon">
          <Bell size={20} />
        </button>
        <div className="user-dropdown">
          <img src={currentUser?.avatar || "https://ui-avatars.com/api/?name=User&background=random"} alt="Your avatar" className="avatar-sm" />
          <ChevronDown size={16} />
        </div>
      </div>

      <div className="sidebar-right-section">
        <h3 className="section-title">Trending Topics</h3>
        <ul className="trending-list">
          <li className="trending-item">Speakly Topics</li>
          <li className="trending-item">Detivatting Content</li>
          <li className="trending-item">Trending Topics</li>
          <li className="trending-item">Speakly Topics</li>
        </ul>
      </div>

      <div className="sidebar-right-section">
        <h3 className="section-title">Suggested for You</h3>
        <ul className="suggested-list">
          {MOCK_SUGGESTED.map((user) => (
            <li key={user.id} className="suggested-item">
              <img src={user.avatar} alt="User" className="avatar-md" />
              <div className="suggested-info">
                <span className="suggested-name">{user.name}</span>
                <span className="suggested-username">{user.username}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SidebarRight;
