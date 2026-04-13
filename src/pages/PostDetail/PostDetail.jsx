import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import PostCard from '../../components/Post/PostCard';
import './PostDetail.css';

const MOCK_COMMENTS = [
  {
    id: 'c1',
    author: { name: 'Designer Pro', username: '@designer_pro', avatar: 'https://ui-avatars.com/api/?name=Designer&background=random' },
    content: 'Replly our inati and a meture to tntest it\'s speakly',
    replies: [
      {
        id: 'r1',
        author: { name: 'Dev Guru', username: '@dev_guru', avatar: 'https://ui-avatars.com/api/?name=Dev&background=random' },
        content: '@dierey thoughts then it\'s Speaklty frontend',
      },
      {
        id: 'r2',
        author: { name: 'Alex Dev', username: '@alex_dev', avatar: 'https://ui-avatars.com/api/?name=Alex&background=random' },
        content: 'Thoughts loving goosh list.',
      }
    ]
  }
];

const PostDetail = () => {
  const location = useLocation();
  const post = location.state?.post || {
    id: '1',
    author: { name: 'Alex Dev', username: '@alex_dev', avatar: 'https://ui-avatars.com/api/?name=Alex&background=random' },
    time: '2h ago',
    content: 'Just started working on the Speakly frontend with React! Absolutely loving the clean CSS structure. #webdev #react',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&fit=crop',
  };

  const [replyText, setReplyText] = useState('');

  return (
    <div className="post-detail-container">
      {/* Main Post reused as a PostCard */}
      <h2 className="detail-section-title">PostCard</h2>
      <PostCard post={post} />

      {/* Threaded Comments Container */}
      <div className="thread-card">
        <div className="thread-list">
          {MOCK_COMMENTS.map((comment) => (
            <div key={comment.id} className="comment-block">
              {/* Parent Comment */}
              <div className="comment-item">
                <img src={comment.author.avatar} alt="Avatar" className="comment-avatar" />
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-username">{comment.author.username}</span>
                    <span className="comment-action-text">replied SF Pro</span>
                    <button className="post-options-btn"><MoreHorizontal size={16} /></button>
                  </div>
                  <div className="comment-text">{comment.content}</div>
                </div>
              </div>

              {/* Replies (with connecting line) */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="replies-container">
                  <div className="thread-line"></div>
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="reply-item">
                      <div className="thread-horizontal-line"></div>
                      <img src={reply.author.avatar} alt="Avatar" className="comment-avatar" />
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-username">{reply.author.username}</span>
                          <span className="comment-action-text">replied SF Pro</span>
                        </div>
                        <div className="comment-text">{reply.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comment Input Footer */}
        <div className="comment-input-area">
          <img src="https://ui-avatars.com/api/?name=You&background=random" alt="Your avatar" className="comment-avatar" />
          <div className="comment-input-box">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="comment-text-input"
            />
            <button className="submit-reply-btn">Post Reply</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
