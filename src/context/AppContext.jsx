import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// ... existing mocks ...
const MOCK_INITIAL_POSTS = [
  {
    id: '1',
    author: { name: 'Alex Dev', username: '@alex_dev', avatar: 'https://ui-avatars.com/api/?name=Alex&background=random' },
    time: '2h ago',
    content: 'Just started working on the Speakly frontend with React! Absolutely loving the clean CSS structure. #webdev #react',
    image: null,
  },
  {
    id: '2',
    author: { name: 'Alex Dev', username: '@alex_dev', avatar: 'https://ui-avatars.com/api/?name=Alex&background=random' },
    time: '2h ago',
    content: 'Just started working on the Speakly frontend with React! Absolutely contisnt loving the clean CSS structure. #webdev #react',
    image: null, 
  }
];

const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'like', text: 'Alex Dev liked your post about Speakly', time: '10m ago' },
  { id: 'n2', type: 'follow', text: 'Designer Pro started following you', time: '1h ago' },
  { id: 'n3', type: 'mention', text: 'Dev Guru mentioned you in a reply', time: '2h ago' },
];

export const AppContextProvider = ({ children }) => {
  const [posts, setPosts] = useState(MOCK_INITIAL_POSTS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [currentUser, setCurrentUser] = useState(null);

  const login = (email, password) => {
    // Mock login 
    setCurrentUser({
      name: 'User',
      username: '@user_speakly',
      email: email,
      avatar: `https://ui-avatars.com/api/?name=User&background=random`
    });
  };

  const register = (name, username, email, password) => {
    // Mock register
    setCurrentUser({
      name: name,
      username: `@${username}`,
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addNewPost = ({ content, image }) => {
    const newPost = {
      id: Date.now().toString(),
      author: currentUser || { name: 'You', username: '@your_username', avatar: 'https://ui-avatars.com/api/?name=You&background=random' },
      time: 'Just now',
      content,
      image,
    };
    
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      posts,
      notifications,
      currentUser,
      login,
      register,
      logout,
      addNewPost
    }}>
      {children}
    </AppContext.Provider>
  );
};
