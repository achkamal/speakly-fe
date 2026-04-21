import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useState, useEffect } from 'react';
import './PostCard.css';

const PostCard = ({ post }) => {
  if (!post) return null;

  const navigate = useNavigate();
  const { deletePost, updatePost, currentUser, toggleLike, getLikeStatus } = useAppContext();
  const [showOptions, setShowOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  
  const [likeInfo, setLikeInfo] = useState({
    count: post.likeCount || 0,
    isLiked: false
  });

  // Load like status dari backend (apakah user sudah like)
  useEffect(() => {
    if (!currentUser) return;
    const fetchStatus = async () => {
      const status = await getLikeStatus(post.id || post._id);
      if (status) setLikeInfo(status);
    };
    fetchStatus();
  }, [post.id, currentUser]);

  // Sync likeCount realtime dari socket (via context post updates)
  useEffect(() => {
    setLikeInfo(prev => ({ ...prev, count: post.likeCount ?? prev.count }));
  }, [post.likeCount]);

  const handleLike = async (e) => {
    e.stopPropagation();
    const data = await toggleLike(post.id || post._id);
    if (data) {
      setLikeInfo({
        count: data.count,
        isLiked: data.isLiked
      });
    }
  };

  const handleNavigate = () => {
    if (!isEditing && (post.id || post._id)) {
      navigate(`/post/${post.id || post._id}`, { state: { post } });
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost(post.id || post._id);
    }
    setShowOptions(false);
  };

  const handleEditToggle = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setShowOptions(false);
  };

  const handleUpdate = async (e) => {
    e.stopPropagation();
    if (!editContent.trim()) return;
    const success = await updatePost(post.id || post._id, { content: editContent });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditContent(post.content || '');
  };

  const isAuthor = currentUser && post?.author &&
    (currentUser.id && currentUser.id === post.author.id);

  return (
    <div className="post-card" onClick={handleNavigate}>
      <div className="post-header-container">
        <div className="post-header-info">
          <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.name || 'User'}&background=random`} alt="" className="avatar-sm" />
          <span className="post-username">{post.author?.username || '@user'}</span>
          <span className="post-time">{post.time || 'now'}</span>
        </div>
        <div className="post-options-container">
          <button className="post-options-btn" onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}>
            <MoreHorizontal size={20} color="var(--text-secondary)" />
          </button>
          
          {showOptions && isAuthor && (
            <div className="post-dropdown">
              <button className="dropdown-item" onClick={handleEditToggle}>
                <span style={{fontSize: '14px'}}>✏️</span>
                <span>Edit</span>
              </button>
              <button className="dropdown-item delete" onClick={handleDelete}>
                <span style={{fontSize: '14px'}}>🗑️</span>
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <div className="edit-post-container" onClick={(e) => e.stopPropagation()}>
          <textarea
            className="edit-input"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            autoFocus
          />
          <div className="edit-actions">
            <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
            <button className="save-btn" onClick={handleUpdate}>Save</button>
          </div>
        </div>
      ) : (
        <>
          <div className="post-text">{post.content}</div>
          
          {post.image && (
            <div className="post-image">
              <img src={post.image} alt="Post attachment" />
            </div>
          )}
        </>
      )}
      
      <div className="post-actions">
        <button className={`action-btn ${likeInfo.isLiked ? 'liked' : ''}`} onClick={handleLike}>
          <Heart strokeWidth={1.5} size={20} fill={likeInfo.isLiked ? "var(--danger-color)" : "none"} color={likeInfo.isLiked ? "var(--danger-color)" : "currentColor"} />
          <span>{likeInfo.count > 0 ? likeInfo.count : ''} Like</span>
        </button>
        
        <button className="action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id || post._id}`); }}>
          <MessageCircle strokeWidth={1.5} size={20} />
          <span>Comment</span>
        </button>
        
        <button className="action-btn action-btn-share" onClick={(e) => { e.stopPropagation(); }}>
          <Share strokeWidth={1.5} size={20} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
