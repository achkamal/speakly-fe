import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Search, Bell, User, X, LogOut } from 'lucide-react';
import SidebarRight from '../SidebarRight/SidebarRight';
import CreatePost from '../CreatePost/CreatePost';
import { useAppContext } from '../../context/AppContext';
import './Layout.css';

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addNewPost, logout } = useAppContext();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/explore', icon: Search, label: 'Explore' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
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
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon strokeWidth={2} size={22} className="nav-icon" />
              <span className="nav-text">{item.label}</span>
            </NavLink>
          ))}
          
          <button className="sidebar-post-btn" onClick={() => setIsModalOpen(true)}>
            Post
          </button>
          
          <button className="nav-item" style={{ marginTop: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'flex-start' }} onClick={handleLogout}>
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
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon strokeWidth={2} size={24} />
          </NavLink>
        ))}
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
            {/* Reuse CreatePost inside the modal */}
            <CreatePost onPost={handlePostSubmit} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
