import { useState, useRef } from 'react';
import { Camera, X, Send } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './CreatePost.css';

const MAX_CHARS = 500;

const CreatePost = ({ onPost }) => {
  const { currentUser, loading } = useAppContext();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setContent(value);
    }
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

  const charPercent = (content.length / MAX_CHARS) * 100;
  const isNearLimit = content.length > MAX_CHARS * 0.8;
  const isAtLimit = content.length >= MAX_CHARS;

  return (
    <div className={`create-post-container ${isFocused ? 'focused' : ''}`}>
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
            disabled={!currentUser || submitting}
          />
          <div className="create-actions">
            <div className="create-actions-left">
              <span className="create-hint">Enter untuk kirim · Shift+Enter baris baru</span>
            </div>
            <div className="create-actions-right">
              {content.length > 0 && (
                <div className={`char-counter ${isNearLimit ? 'warning' : ''} ${isAtLimit ? 'danger' : ''}`}>
                  <svg className="char-ring" viewBox="0 0 24 24">
                    <circle className="char-ring-bg" cx="12" cy="12" r="10" />
                    <circle
                      className="char-ring-fill"
                      cx="12" cy="12" r="10"
                      strokeDasharray={`${charPercent * 0.628} 62.8`}
                    />
                  </svg>
                  <span className="char-count-text">{MAX_CHARS - content.length}</span>
                </div>
              )}
              <button
                className="create-post-btn"
                onClick={handleSubmit}
                disabled={!content.trim() || !currentUser || submitting}
              >
                {submitting ? (
                  <div className="create-spinner" />
                ) : (
                  <>
                    <Send size={14} />
                    <span className="create-post-btn-text">Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
