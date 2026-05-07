import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCheck, UserPlus, MessageCircle, LayoutGrid, List } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import PostCard from '../../components/Post/PostCard';
import './UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, getUserProfileById, getUserPosts, toggleFollow } = useAppContext();

  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  const userId = Number(id);

  useEffect(() => {
    const load = async () => {
      setLoadingProfile(true);
      const data = await getUserProfileById(userId);
      if (data) {
        setProfile(data);
        setIsFollowing(data.isFollowing ?? false);
        setFollowerCount(data._count?.followers ?? 0);
        setFollowingCount(data._count?.following ?? 0);
      }
      setLoadingProfile(false);
    };
    load();
  }, [userId, getUserProfileById]);

  useEffect(() => {
    const load = async () => {
      setLoadingPosts(true);
      const data = await getUserPosts(userId);
      setUserPosts(data);
      setLoadingPosts(false);
    };
    load();
  }, [userId, getUserPosts]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const result = await toggleFollow(userId);
    if (result !== null) {
      const nowFollowing = result.followed;
      setIsFollowing(nowFollowing);
      setFollowerCount(prev => nowFollowing ? prev + 1 : Math.max(0, prev - 1));
    }
    setFollowLoading(false);
  };

  const isSelf = currentUser?.id === userId;

  if (loadingProfile) {
    return (
      <div className="up-container">
        <div className="up-loading">
          <div className="up-spinner" />
          <p>Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="up-container">
        <button className="up-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> <span>Kembali</span>
        </button>
        <div className="up-not-found">
          <p>Pengguna tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="up-container">
      {/* Back Button */}
      <button className="up-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        <span>{profile.name}</span>
      </button>

      {/* Profile Hero */}
      <div className="up-hero">
        <div className="up-cover" />
        <div className="up-hero-content">
          <div className="up-hero-top">
            <img
              src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
              alt={profile.name}
              className="up-avatar"
            />
            <div className="up-names">
              <h1 className="up-name">{profile.name}</h1>
              <span className="up-username">@{profile.username}</span>
            </div>

            {/* Follow / Edit button */}
            {!isSelf && currentUser && (
              <button
                className={`up-follow-btn ${isFollowing ? 'up-follow-btn--following' : ''}`}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <span className="up-btn-spinner" />
                ) : isFollowing ? (
                  <><UserCheck size={16} /> <span>Following</span></>
                ) : (
                  <><UserPlus size={16} /> <span>Follow</span></>
                )}
              </button>
            )}
          </div>

          {/* Stats: Followers, Following, Posts */}
          <div className="up-stats">
            <div className="up-stat">
              <span className="up-stat-count">{userPosts.length}</span>
              <span className="up-stat-label">Posts</span>
            </div>
            <div className="up-stat up-stat--clickable" title="Followers">
              <span className="up-stat-count">{followerCount.toLocaleString('id-ID')}</span>
              <span className="up-stat-label">Pengikut</span>
            </div>
            <div className="up-stat up-stat--clickable" title="Following">
              <span className="up-stat-count">{followingCount.toLocaleString('id-ID')}</span>
              <span className="up-stat-label">Mengikuti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="up-posts-section">
        <div className="up-posts-header">
          <h2>Postingan</h2>
          <div className="up-view-toggles">
            <button
              className={`up-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List size={20} />
            </button>
            <button
              className={`up-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        {loadingPosts ? (
          <div className="up-loading">
            <div className="up-spinner" />
            <p>Memuat postingan...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="up-empty-posts">
            <MessageCircle size={40} strokeWidth={1.3} style={{ opacity: 0.25 }} />
            <p>Belum ada postingan.</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="up-list-feed">
            {userPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="up-grid-feed">
            {userPosts.map(post => (
              <div key={post.id} className="up-grid-card" onClick={() => navigate(`/post/${post.id}`)}>
                <p className="up-grid-text">{post.content}</p>
                <div className="up-grid-meta">
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

export default UserProfile;
