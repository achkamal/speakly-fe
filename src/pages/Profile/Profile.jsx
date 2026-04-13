import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import './Profile.css';

const MOCK_USER = {
  name: 'Alex Dev',
  username: '@alex_dev',
  bio: 'Uncanited working. find Speakly frontend with React!\n\nBio CSS structure. #webdev #react',
  avatar: 'https://ui-avatars.com/api/?name=Alex&background=random',
};

// Based on the dark mode mock screenshot where PostCard area is full of grid images
const MOCK_GRID_POSTS = [
  { id: 1, image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&fit=crop', title: 'Just started working on the Speakly frontend w...' },
  { id: 2, image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400&fit=crop', title: 'Just started working on the Speakly frontend w...' },
  { id: 3, image: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400&fit=crop', title: 'Just started working on the Speakly frontend w...' },
  { id: 4, image: 'https://images.unsplash.com/photo-1542261777448-23d2a287091c?q=80&w=400&fit=crop', title: 'Just started working on the Speakly frontend w...' },
];

const Profile = () => {
  const [viewMode, setViewMode] = useState('grid');

  return (
    <div className="profile-container">
      {/* Profile Card Header (Rounded) */}
      <div className="profile-hero-card">
        <div className="profile-cover-placeholder"></div>
        <div className="profile-hero-content">
          <div className="profile-hero-top">
            <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="profile-large-avatar" />
            <div className="profile-names">
              <h1 className="hero-name">{MOCK_USER.name}</h1>
              <span className="hero-username">{MOCK_USER.username}</span>
            </div>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
          <div className="profile-bio-text">
            {MOCK_USER.bio}
          </div>
        </div>
      </div>

      <div className="profile-content-section">
        <div className="profile-controls">
          <h2 className="section-title">PostCard</h2>
          <div className="view-toggles">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List size={22} />
            </button>
          </div>
        </div>

        {viewMode === 'grid' && (
          <div className="grid-feed">
            {MOCK_GRID_POSTS.map(post => (
              <div key={post.id} className="grid-post-card">
                <img src={post.image} alt="" className="grid-image" />
                <div className="grid-info">
                  <p className="grid-title">{post.title}</p>
                  <div className="grid-actions">
                    <span className="grid-action-item"><HeartIcon /> Like</span>
                    <span className="grid-action-item"><CommentIcon /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Mini icons for the grid view
const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);
const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
);

export default Profile;
