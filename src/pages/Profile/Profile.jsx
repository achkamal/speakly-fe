import { useState, useEffect } from 'react';
import { LayoutGrid, List, MessageCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import PostCard from '../../components/Post/PostCard';
import './Profile.css';

const Profile = () => {
  const { currentUser, getUserPosts, getFollowStatus, loading } = useAppContext();
  const [viewMode, setViewMode] = useState('list');
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!currentUser) {
        setLoadingPosts(false);
        return;
      }
      setLoadingPosts(true);
      const data = await getUserPosts(currentUser.id);
      setUserPosts(data);
      setLoadingPosts(false);
    };
    fetchUserPosts();
  }, [currentUser, getUserPosts]);

  useEffect(() => {
    const fetchFollowStats = async () => {
      if (!currentUser) return;
      const status = await getFollowStatus(currentUser.id);
      if (status) {
        setFollowerCount(status.followerCount ?? 0);
        setFollowingCount(status.followingCount ?? 0);
      }
    };
    fetchFollowStats();
  }, [currentUser, getFollowStatus]);

  if (!currentUser) {
    return (
      <div className="profile-container">
        <div className="profile-empty">
          <p>Silakan login untuk melihat profil.</p>
        </div>
      </div>
    );
  }

  const displayUsername = currentUser.displayUsername || 
    (currentUser.username ? `@${currentUser.username}` : '@user');

  return (
    <div className="profile-container">
      {/* Profile Card Header */}
      <div className="profile-hero-card">
        <div className="profile-cover-placeholder" />
        <div className="profile-hero-content">
          <div className="profile-hero-top">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="profile-large-avatar"
            />
            <div className="profile-names">
              <h1 className="hero-name">{currentUser.name}</h1>
              <span className="hero-username">{displayUsername}</span>
            </div>
          </div>
          {currentUser.bio && (
            <div className="profile-bio-text">{currentUser.bio}</div>
          )}
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-count">{userPosts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-count">{followerCount.toLocaleString('id-ID')}</span>
              <span className="stat-label">Pengikut</span>
            </div>
            <div className="stat-item">
              <span className="stat-count">{followingCount.toLocaleString('id-ID')}</span>
              <span className="stat-label">Mengikuti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="profile-content-section">
        <div className="profile-controls">
          <h2 className="section-title">Postingan</h2>
          <div className="view-toggles">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={22} />
            </button>
          </div>
        </div>

        {loadingPosts ? (
          <div className="profile-loading">
            <div className="loading-spinner-sm" />
            <p>Memuat postingan...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="profile-no-posts">
            <MessageCircle size={40} opacity={0.25} />
            <p>Belum ada postingan.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="list-feed">
            {userPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="grid-feed">
            {userPosts.filter(p => p.image).map(post => (
              <div key={post.id} className="grid-post-card">
                <img src={post.image} alt="" className="grid-image" />
                <div className="grid-info">
                  <p className="grid-title">{post.content?.slice(0, 60)}...</p>
                </div>
              </div>
            ))}
            {userPosts.filter(p => !p.image).map(post => (
              <div key={post.id} className="grid-text-card">
                <p className="grid-text-content">{post.content}</p>
                <div className="grid-text-meta">
                  <span>❤️ {post.likeCount || 0}</span>
                  <span>💬 {post.commentCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
