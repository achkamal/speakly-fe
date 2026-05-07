import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Search, Bell, User, X, LogOut } from 'lucide-react';
import SidebarRight from '../SidebarRight/SidebarRight';
import CreatePost from '../CreatePost/CreatePost';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import { useAppContext } from '../../context/AppContext';
import './Layout.css';

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { addNewPost, logout, unreadCount } = useAppContext();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const handlePostSubmit = (data) => {
    addNewPost(data);
    setIsModalOpen(false);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app-container">
      {/* Sidebar for Desktop/Tablet */}
      <nav className="sidebar">
        <Link to="/" className="logo-container">
          <span className="logo-text">Speakly</span>
        </Link>
        
        <div className="nav-links-wrapper">
          {navItems.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon strokeWidth={2} size={22} className="nav-icon" />
              <span className="nav-text">{item.label}</span>
            </NavLink>
          ))}

          {/* Bell dengan dropdown notifikasi */}
          <div className="nav-notif-wrapper">
            <button
              id="notif-bell-btn"
              className={`nav-item nav-notif-btn ${isNotifOpen ? 'active' : ''}`}
              onClick={() => setIsNotifOpen(prev => !prev)}
            >
              <div className="notif-bell-wrap">
                <Bell strokeWidth={2} size={22} className="nav-icon" />
                {unreadCount > 0 && (
                  <span className="notif-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="nav-text">Notifikasi</span>
            </button>

            {isNotifOpen && (
              <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
            )}
          </div>
          
          <button className="sidebar-post-btn" onClick={() => setIsModalOpen(true)}>
            Post
          </button>
          
          <button
            className="nav-item"
            style={{ marginTop: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'flex-start' }}
            onClick={handleLogout}
          >
            <LogOut strokeWidth={2} size={22} className="nav-icon" />
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Right Sidebar for Wide Desktop */}
      <aside className="right-sidebar">
        <SidebarRight />
      </aside>

      {/* Bottom Nav for Mobile */}
      <div className="bottom-nav glass">
        {navItems.map((item) => (
          <NavLink 
            key={item.to} 
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon strokeWidth={2} size={24} />
          </NavLink>
        ))}

        {/* Bell mobile */}
        <div className="nav-notif-wrapper">
          <button
            id="notif-bell-mobile-btn"
            className={`nav-item ${isNotifOpen ? 'active' : ''}`}
            style={{ background: 'transparent', border: 'none', padding: '12px', position: 'relative' }}
            onClick={() => setIsNotifOpen(prev => !prev)}
          >
            <div className="notif-bell-wrap">
              <Bell strokeWidth={2} size={24} />
              {unreadCount > 0 && (
                <span className="notif-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          </button>
          {isNotifOpen && (
            <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
          )}
        </div>

        <button className="nav-item" onClick={handleLogout} style={{ background: 'transparent', border: 'none', padding: '12px' }}>
          <LogOut strokeWidth={2} size={24} />
        </button>
      </div>

      {/* Post Modal Overlay */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content-wrapper" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <CreatePost onPost={handlePostSubmit} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
