import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserPlus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './UserCard.css';

const UserCard = ({ user, currentUserId, onFollowChange }) => {
  const { toggleFollow } = useAppContext();
  const navigate = useNavigate();

  // isFollowing bisa datang dari prop user.isFollowing (hasil search) atau state lokal
  const [isFollowing, setIsFollowing] = useState(user.isFollowing ?? false);
  const [followerCount, setFollowerCount] = useState(user._count?.followers ?? 0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const handleFollow = async (e) => {
    e.stopPropagation(); // Jangan navigasi ke profil
    if (loadingFollow) return;
    setLoadingFollow(true);

    const result = await toggleFollow(user.id);
    if (result !== null) {
      const nowFollowing = result.followed;
      setIsFollowing(nowFollowing);
      setFollowerCount(prev => nowFollowing ? prev + 1 : Math.max(0, prev - 1));
      onFollowChange?.({ userId: user.id, followed: nowFollowing });
    }
    setLoadingFollow(false);
  };

  const handleCardClick = () => {
    navigate(`/user/${user.id}`);
  };

  return (
    <div className="user-card" onClick={handleCardClick} role="button" tabIndex={0}>
      {/* Avatar */}
      <div className="uc-avatar-wrap">
        <img
          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
          alt={user.name}
          className="uc-avatar"
        />
      </div>

      {/* Info */}
      <div className="uc-info">
        <span className="uc-name">{user.name}</span>
        <span className="uc-username">@{user.username}</span>
        <div className="uc-stats">
          <span>{followerCount.toLocaleString('id-ID')} <span className="uc-stat-label">pengikut</span></span>
          <span className="uc-stat-dot">·</span>
          <span>{(user._count?.following ?? 0).toLocaleString('id-ID')} <span className="uc-stat-label">mengikuti</span></span>
          <span className="uc-stat-dot">·</span>
          <span>{(user._count?.posts ?? 0).toLocaleString('id-ID')} <span className="uc-stat-label">post</span></span>
        </div>
      </div>

      {/* Follow Button — hanya tampil jika bukan profil sendiri */}
      {currentUserId && currentUserId !== user.id && (
        <button
          className={`uc-follow-btn ${isFollowing ? 'uc-follow-btn--following' : ''}`}
          onClick={handleFollow}
          disabled={loadingFollow}
          title={isFollowing ? 'Unfollow' : 'Follow'}
        >
          {loadingFollow ? (
            <span className="uc-spinner" />
          ) : isFollowing ? (
            <>
              <UserCheck size={15} />
              <span>Following</span>
            </>
          ) : (
            <>
              <UserPlus size={15} />
              <span>Follow</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default UserCard;
