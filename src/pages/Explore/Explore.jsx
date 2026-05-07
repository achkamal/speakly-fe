import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Users, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import UserCard from '../../components/UserCard/UserCard';
import PostCard from '../../components/Post/PostCard';
import './Explore.css';

const Explore = () => {
  const { posts, searchUsers, currentUser } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);

  // Debounced search — 350ms setelah ketik
  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        setHasSearched(true);
        const data = await searchUsers(value.trim());
        setResults(data);
        setSearching(false);
      }, 350);
    },
    [searchUsers]
  );

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const isSearchMode = query.trim().length > 0;

  return (
    <div className="explore-container">
      {/* Sticky Search Header */}
      <div className="explore-search-header">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            id="explore-search-input"
            type="text"
            placeholder="Cari pengguna Speakly..."
            className="search-input"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoComplete="off"
          />
          {query && (
            <button className="search-clear-btn" onClick={clearSearch}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Mode */}
      {isSearchMode ? (
        <div className="search-results-section">
          <div className="search-results-header">
            <Users size={16} />
            <span>
              {searching
                ? 'Mencari...'
                : hasSearched
                ? `${results.length} pengguna ditemukan`
                : ''}
            </span>
          </div>

          {searching && (
            <div className="search-loading">
              <div className="search-spinner" />
            </div>
          )}

          {!searching && hasSearched && results.length === 0 && (
            <div className="search-empty">
              <Users size={40} strokeWidth={1.3} style={{ opacity: 0.3 }} />
              <p>Tidak ada pengguna dengan nama "<strong>{query}</strong>"</p>
            </div>
          )}

          {!searching && results.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              currentUserId={currentUser?.id}
            />
          ))}
        </div>
      ) : (
        /* Default: Explore Feed */
        <>
          <div className="trending-section">
            <h2 className="trending-header">Topics Explorer</h2>
            <div className="topic-card">
              <span className="topic-category">Technology · Trending</span>
              <p className="topic-title">React 19 Release</p>
              <span className="topic-stats">24.5K posts</span>
            </div>
            <div className="topic-card">
              <span className="topic-category">Design · Trending</span>
              <p className="topic-title">Glassmorphism UI</p>
              <span className="topic-stats">12.1K posts</span>
            </div>
            <div className="topic-card">
              <span className="topic-category">Entertainment · Trending</span>
              <p className="topic-title">New Apple Event</p>
              <span className="topic-stats">85.9K posts</span>
            </div>
          </div>

          <div className="explore-feed">
            <h3 className="feed-title">Recommended for You</h3>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Explore;
