import { useAppContext } from '../../context/AppContext';
import CreatePost from '../../components/CreatePost/CreatePost';
import PostCard from '../../components/Post/PostCard';
import './Home.css';

const Home = () => {
  const { posts, addNewPost } = useAppContext();

  return (
    <div className="home-container">
      <CreatePost onPost={addNewPost} />
      
      <div className="feed">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;
