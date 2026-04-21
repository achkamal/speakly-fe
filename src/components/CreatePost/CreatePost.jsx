import { useState, useRef } from 'react';
import { Camera, X, Send } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './CreatePost.css';

const CreatePost = ({ onPost }) => {
  const { currentUser, loading } = useAppContext();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    if (onPost) {
      setSubmitting(true);
      const success = await onPost({ content });
      if (success) {
        setContent('');
        // Reset textarea height
        const textarea = document.querySelector('.create-input');
        if (textarea) textarea.style.height = 'auto';
      }
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const avatarSrc = currentUser?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=random`;

  return (
    <div className="create-post-container">
      <div className="create-post-box">
        {currentUser && (
          <img src={avatarSrc} alt="avatar" className="create-avatar" />
        )}
        <div className="create-input-wrapper">
          <textarea
            placeholder={currentUser ? "Apa yang sedang kamu pikirkan?" : "Login untuk membuat post"}
            className="create-input"
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={!currentUser || submitting}
          />
          <div className="create-actions">
            <span className="create-hint">Enter untuk kirim · Shift+Enter baris baru</span>
            <button
              className="create-post-btn"
              onClick={handleSubmit}
              disabled={!content.trim() || !currentUser || submitting}
            >
              {submitting ? (
                <div className="create-spinner" />
              ) : (
                <>
                  <Send size={15} />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
