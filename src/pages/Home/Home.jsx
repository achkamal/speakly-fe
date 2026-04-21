import { useAppContext } from '../../context/AppContext';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostCard from '../../components/Post/PostCard';
import './Home.css';
import { useEffect } from 'react';

const Home = () => {
  const { fetchPosts, posts, addNewPost, loading, error } = useAppContext();
  useEffect(() => {
    fetchPosts();
  }, []);
  return (
    <div className="home-container">
      {error && <div className="error-banner">{error}</div>}
      {loading && posts.length === 0 && <div className="loading-overlay">Loading...</div>}
      <CreatePost onPost={addNewPost} />

      <div className="feed">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id || Math.random()} post={post} />
          ))
        ) : !loading && (
          <div className="no-posts">No posts yet. Start the conversation!</div>
        )}
      </div>
    </div>
  );
};

export default Home;
