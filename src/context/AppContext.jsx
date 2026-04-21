import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Helper buat header + auth token
const authHeaders = (extra = {}) => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

export const AppContextProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Helper to map backend format ke format yg dipakai frontend
  const formatPost = (p) => ({
    ...p,
    author: {
      id: p.user?.id,
      name: p.user?.name,
      username: p.user?.username ? `@${p.user.username}` : `@user`,
      avatar: p.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user?.name || 'User')}&background=random`,
    },
    time: new Date(p.createdAt).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }),
    likeCount: p._count?.likes ?? p.likeCount ?? 0,
    commentCount: p._count?.comments ?? p.commentCount ?? 0,
  });

  // Format comment dari backend
  const formatComment = (c) => ({
    ...c,
    author: {
      id: c.user?.id,
      name: c.user?.name,
      username: c.user?.username ? `@${c.user.username}` : `@user`,
      avatar: c.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || 'User')}&background=random`,
    },
    time: new Date(c.createdAt).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    }),
  });

  // ─── Fetch Posts ────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/post`);
      const body = await response.json();
      if (response.ok && body.success) {
        const postsArray = Array.isArray(body.data) ? body.data : [];
        setPosts(postsArray.map(formatPost));
      } else {
        console.warn('Failed to fetch posts:', body.message);
      }
    } catch (err) {
      console.warn('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Mount: restore session + connect socket ────────────────────────────────
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch { /* abaikan */ }
    }

    const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    // Realtime: new post ditambahkan → prepend ke feed semua client
    newSocket.on('newPost', (rawPost) => {
      const formatted = {
        ...rawPost,
        author: {
          id: rawPost.user?.id,
          name: rawPost.user?.name,
          username: rawPost.user?.username ? `@${rawPost.user.username}` : '@user',
          avatar: rawPost.user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(rawPost.user?.name || 'User')}&background=random`,
        },
        time: new Date(rawPost.createdAt).toLocaleString('id-ID', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
        likeCount: rawPost._count?.likes ?? 0,
        commentCount: rawPost._count?.comments ?? 0,
      };
      // Prepend: post terbaru di atas, skip duplikat
      setPosts(prev => {
        if (prev.some(p => p.id === formatted.id)) return prev;
        return [formatted, ...prev];
      });
    });

    // Realtime: update like count
    newSocket.on('likeUpdated', ({ postId, likeCount }) => {
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, likeCount } : post
        )
      );
    });

    // Realtime: new comment → update comment count di feed
    newSocket.on('newComment', (comment) => {
      setPosts(prev =>
        prev.map(post =>
          post.id === comment.postId
            ? { ...post, commentCount: (post.commentCount || 0) + 1 }
            : post
        )
      );
    });

    fetchPosts();

    return () => newSocket.disconnect();
  }, [fetchPosts]);

  // ─── Get Post By ID ─────────────────────────────────────────────────────────
  const getPostById = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/post/${id}`);
      const body = await response.json();
      if (response.ok && body.success) {
        return formatPost(body.data);
      } else {
        throw new Error(body.message || 'Failed to fetch post');
      }
    } catch (err) {
      console.error('Get post detail error:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ─── Auth ───────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const body = await response.json();

      if (!response.ok || !body.success) {
        throw new Error(body.message || 'Login gagal');
      }

      const userData = body.data.user;
      const user = {
        ...userData,
        name: userData.name || 'User',
        username: userData.username || 'user',
        displayUsername: userData.username ? `@${userData.username}` : '@user',
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`,
      };

      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      if (body.data.token) localStorage.setItem('token', body.data.token);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });

      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body.message || 'Registrasi gagal');
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setCurrentUser(null);
    setPosts([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // ─── Posts CRUD ─────────────────────────────────────────────────────────────
  const addNewPost = async ({ content }) => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Kamu harus login untuk posting'); return false; }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/post`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content }),
      });

      const body = await response.json();
      if (response.ok && body.success) {
        // Tidak perlu fetchPosts() — socket 'newPost' akan update semua client
        return true;
      } else {
        throw new Error(body.message || 'Gagal membuat post');
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id, updatedData) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/post/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updatedData),
      });

      const body = await response.json();
      if (response.ok && body.success) {
        await fetchPosts();
        return true;
      } else {
        throw new Error(body.message || 'Gagal memperbarui post');
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/post/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const body = await response.json();
      if (response.ok && body.success) {
        setPosts(prev => prev.filter(p => p.id !== id));
        return true;
      } else {
        throw new Error(body.message || 'Gagal menghapus post');
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ─── Like ────────────────────────────────────────────────────────────────────
  const toggleLike = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Kamu harus login untuk like'); return null; }

    try {
      const response = await fetch(`${API_BASE_URL}/like/${postId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (response.ok && body.success) {
        return {
          count: body.data.likeCount,
          isLiked: body.data.liked,
        };
      }
    } catch (err) {
      console.error('Toggle like error:', err);
    }
    return null;
  };

  const getLikeStatus = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) return { count: 0, isLiked: false };

    try {
      const response = await fetch(`${API_BASE_URL}/like/${postId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (response.ok && body.success) {
        return {
          count: body.data.count,
          isLiked: body.data.isLiked,
        };
      }
    } catch (err) {
      console.error('Get like status error:', err);
    }
    return { count: 0, isLiked: false };
  };

  // ─── Comments ────────────────────────────────────────────────────────────────
  const getComments = async (postId) => {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/comment/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (response.ok && body.success) {
        return (body.data || []).map(formatComment);
      }
    } catch (err) {
      console.error('Get comments error:', err);
    }
    return [];
  };

  const addComment = async (postId, content) => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Kamu harus login untuk berkomentar'); return null; }
    if (!content?.trim()) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/comment/${postId}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content }),
      });
      const body = await response.json();
      if (response.ok && body.success) {
        return formatComment(body.data);
      } else {
        throw new Error(body.message || 'Gagal mengirim komentar');
      }
    } catch (err) {
      console.error('Add comment error:', err);
      setError(err.message);
      return null;
    }
  };

  // ─── User Posts (untuk Profile) ──────────────────────────────────────────────
  const getUserPosts = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/post`);
      const body = await response.json();
      if (response.ok && body.success) {
        const all = Array.isArray(body.data) ? body.data : [];
        return all
          .filter(p => p.userId === userId || p.user?.id === userId)
          .map(formatPost);
      }
    } catch (err) {
      console.error('Get user posts error:', err);
    }
    return [];
  }, []);

  return (
    <AppContext.Provider value={{
      posts,
      notifications,
      currentUser,
      loading,
      error,
      socket,
      login,
      register,
      logout,
      addNewPost,
      updatePost,
      deletePost,
      fetchPosts,
      getPostById,
      toggleLike,
      getLikeStatus,
      getComments,
      addComment,
      getUserPosts,
    }}>
      {children}
    </AppContext.Provider>
  );
};
