import { Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import PostCard from '../../components/Post/PostCard';
import './Explore.css';

const Explore = () => {
  const { posts } = useAppContext();

  return (
    <div className="explore-container">
      <div className="explore-search-header">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search Speakly" className="search-input" />
        </div>
      </div>

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
        {/* We reuse posts just to show functional scroll feed */}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Explore;
