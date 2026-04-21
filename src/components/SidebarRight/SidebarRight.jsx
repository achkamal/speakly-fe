import { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp, Users, Hash } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './SidebarRight.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const SidebarRight = () => {
  const { currentUser, posts } = useAppContext();
  const [trends, setTrends] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  // Fetch trending topics dari backend
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/topic/trending?limit=5`);
        const body = await res.json();
        if (res.ok && body.success && Array.isArray(body.data) && body.data.length > 0) {
          setTrends(body.data);
        } else {
          // Fallback: ekstrak hashtag dari posts yang ada
          generateTrendsFromPosts();
        }
      } catch {
        generateTrendsFromPosts();
      }
    };
    fetchTrending();
  }, [posts]);

  // Fallback: derive trending topics dari konten posts
  const generateTrendsFromPosts = () => {
    const hashtagCount = {};
    posts.forEach(post => {
      const tags = (post.content || '').match(/#\w+/g) || [];
      tags.forEach(tag => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
    });

    const sorted = Object.entries(hashtagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ name: tag, postCount: count }));

    if (sorted.length > 0) {
      setTrends(sorted);
    } else {
      // Truly no data → show placeholder topics
      setTrends([
        { name: '#Speakly', postCount: null },
        { name: '#ReactJS', postCount: null },
        { name: '#WebDev', postCount: null },
      ]);
    }
  };

  // Build suggested users dari posts (users yang posting, exclude currentUser)
  useEffect(() => {
    if (!posts.length) return;
    const seen = new Set();
    const users = [];
    for (const post of posts) {
      const a = post.author;
      if (!a || !a.id) continue;
      if (currentUser && a.id === currentUser.id) continue;
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      users.push(a);
      if (users.length >= 4) break;
    }
    setSuggestedUsers(users);
  }, [posts, currentUser]);

  return (
    <div className="sidebar-right-container">
      {/* User Badge (top right) */}
      {currentUser && (
        <div className="sidebar-right-header">
          <div className="user-badge">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="avatar-sm"
            />
            <div className="user-badge-info">
              <span className="user-badge-name">{currentUser.name}</span>
              <span className="user-badge-username">
                {currentUser.displayUsername || `@${currentUser.username}`}
              </span>
            </div>
            <ChevronDown size={14} className="badge-chevron" />
          </div>
        </div>
      )}

      {/* Trending Topics */}
      <div className="sidebar-right-section">
        <h3 className="section-title">
          <TrendingUp size={15} />
          Trending Topics
        </h3>
        <ul className="trending-list">
          {trends.map((topic, i) => (
            <li key={i} className="trending-item">
              <Hash size={13} className="trending-hash" />
              <span className="trending-name">
                {typeof topic === 'string'
                  ? topic
                  : topic.name?.replace('#', '') || topic.title || topic.name}
              </span>
              {topic.postCount != null && (
                <span className="trending-count">{topic.postCount} posts</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested for You */}
      {suggestedUsers.length > 0 && (
        <div className="sidebar-right-section">
          <h3 className="section-title">
            <Users size={15} />
            Suggested for You
          </h3>
          <ul className="suggested-list">
            {suggestedUsers.map((user) => (
              <li key={user.id} className="suggested-item">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                  alt={user.name}
                  className="avatar-md"
                />
                <div className="suggested-info">
                  <span className="suggested-name">{user.name}</span>
                  <span className="suggested-username">{user.username}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SidebarRight;
