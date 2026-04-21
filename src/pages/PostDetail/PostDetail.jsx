import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MoreHorizontal, Send, ArrowLeft, MessageCircle, Heart } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import PostCard from '../../components/Post/PostCard';
import './PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPostById, getComments, addComment, currentUser, socket, getLikeStatus } = useAppContext();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch post detail
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoadingPost(true);
      const data = await getPostById(id);
      setPost(data);
      setLoadingPost(false);
    };
    load();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoadingComments(true);
      const data = await getComments(id);
      setComments(data);
      setLoadingComments(false);
    };
    load();
  }, [id]);

  // Realtime: new comment arrives via socket
  useEffect(() => {
    if (!socket) return;
    const handler = (newComment) => {
      if (Number(newComment.postId) === Number(id)) {
        // Format the raw comment from socket
        const formatted = {
          ...newComment,
          author: {
            id: newComment.user?.id,
            name: newComment.user?.name,
            username: newComment.user?.username ? `@${newComment.user.username}` : '@user',
            avatar: newComment.user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(newComment.user?.name || 'User')}&background=random`,
          },
          time: new Date(newComment.createdAt).toLocaleString('id-ID', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          }),
        };
        setComments(prev => {
          // Avoid duplicate if this client's own comment already added optimistically
          if (prev.some(c => c.id === formatted.id)) return prev;
          return [...prev, formatted];
        });
      }
    };
    socket.on('newComment', handler);
    return () => socket.off('newComment', handler);
  }, [socket, id]);

  // Scroll to bottom saat comments bertambah
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments.length]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    const newComment = await addComment(id, replyText);
    if (newComment) {
      setComments(prev => {
        if (prev.some(c => c.id === newComment.id)) return prev;
        return [...prev, newComment];
      });
      setReplyText('');
    }
    setSubmitting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment(e);
    }
  };

  if (loadingPost) {
    return (
      <div className="post-detail-container">
        <div className="detail-loading">
          <div className="loading-spinner" />
          <p>Memuat post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-container">
        <div className="detail-empty">
          <MessageCircle size={48} opacity={0.3} />
          <p>Post tidak ditemukan</p>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      {/* Back Button */}
      <button className="detail-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        <span>Kembali</span>
      </button>

      {/* Main Post */}
      <PostCard post={post} />

      {/* Comments Section */}
      <div className="thread-card">
        <div className="thread-header">
          <MessageCircle size={18} />
          <span>{comments.length} Komentar</span>
        </div>

        {/* Comments List */}
        <div className="thread-list">
          {loadingComments ? (
            <div className="comments-loading">
              <div className="loading-spinner" />
              <p>Memuat komentar...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="no-comments">
              <MessageCircle size={36} opacity={0.25} />
              <p>Belum ada komentar. Jadilah yang pertama!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-block">
                <div className="comment-item">
                  <img
                    src={comment.author?.avatar}
                    alt={comment.author?.name}
                    className="comment-avatar"
                  />
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-name">{comment.author?.name}</span>
                      <span className="comment-username">{comment.author?.username}</span>
                      <span className="comment-time">{comment.time}</span>
                    </div>
                    <div className="comment-text">{comment.content}</div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Comment Input */}
        <form className="comment-input-area" onSubmit={handleSubmitComment}>
          <img
            src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'You')}&background=random`}
            alt="Your avatar"
            className="comment-avatar"
          />
          <div className="comment-input-box">
            <input
              ref={inputRef}
              type="text"
              placeholder={currentUser ? 'Tulis komentar...' : 'Login untuk berkomentar'}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="comment-text-input"
              disabled={!currentUser || submitting}
            />
            <button
              type="submit"
              className="submit-reply-btn"
              disabled={!replyText.trim() || !currentUser || submitting}
            >
              {submitting ? (
                <div className="btn-spinner" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostDetail;
