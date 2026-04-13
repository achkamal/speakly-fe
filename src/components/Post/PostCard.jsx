import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/post/${post.id}`, { state: { post } });
  };

  return (
    <div className="post-card" onClick={handleNavigate}>
      <div className="post-header-container">
        <div className="post-header-info">
          <img src={post.author.avatar || `https://ui-avatars.com/api/?name=${post.author.name}&background=random`} alt="" className="avatar-sm" />
          <span className="post-username">{post.author.username}</span>
          <span className="post-time">{post.time}</span>
        </div>
        <button className="post-options-btn" onClick={(e) => { e.stopPropagation(); }}>
          <MoreHorizontal size={20} color="var(--text-secondary)" />
        </button>
      </div>
      
      <div className="post-text">{post.content}</div>
      
      {post.image && (
        <div className="post-image">
          <img src={post.image} alt="Post attachment" />
        </div>
      )}
      
      <div className="post-actions">
        <button className="action-btn" onClick={(e) => { e.stopPropagation(); }}>
          <Heart strokeWidth={1.5} size={20} />
          <span>Like</span>
        </button>
        
        <button className="action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }}>
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
