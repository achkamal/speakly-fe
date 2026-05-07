import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

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

  // ─── Fetch Notifications ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/notification`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (response.ok && body.success) {
        setNotifications(body.data || []);
        setUnreadCount((body.data || []).filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.warn('Fetch notifications error:', err);
    }
  }, []);

  const markNotificationRead = async (notifId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/notification/${notifId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark notification read error:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/notification/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Mark all notifications read error:', err);
    }
  };

  const deleteNotification = async (notifId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${API_BASE_URL}/notification/${notifId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => {
        const removed = prev.find(n => n.id === notifId);
        if (removed && !removed.isRead) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n.id !== notifId);
      });
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  // ─── Mount: restore session + connect socket ────────────────────────────────
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    let user = null;
    if (savedUser) {
      try { user = JSON.parse(savedUser); setCurrentUser(user); } catch { /* abaikan */ }
    }

    const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = newSocket;
    setSocket(newSocket);

    // Join room pribadi jika sudah login
    if (user?.id) {
      newSocket.on('connect', () => {
        newSocket.emit('joinRoom', user.id);
      });
      newSocket.emit('joinRoom', user.id);
    }

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

    // 🔔 Realtime: notifikasi baru masuk ke room privat user
    newSocket.on('newNotification', (notif) => {
      setNotifications(prev => {
        if (prev.some(n => n.id === notif.id)) return prev;
        return [notif, ...prev];
      });
      setUnreadCount(prev => prev + 1);
    });

    fetchPosts();
    if (user?.id) fetchNotifications();

    return () => newSocket.disconnect();
  }, [fetchPosts, fetchNotifications]);

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

      // Join room privat setelah login
      if (socketRef.current) {
        socketRef.current.emit('joinRoom', user.id);
      }

      // Fetch notifikasi setelah login
      setTimeout(() => fetchNotifications(), 300);

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
    setNotifications([]);
    setUnreadCount(0);
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

  // ─── Follow ──────────────────────────────────────────────────────────────────
  const toggleFollow = async (targetUserId) => {
    const token = localStorage.getItem('token');
    if (!token) { setError('Kamu harus login untuk follow'); return null; }

    try {
      const response = await fetch(`${API_BASE_URL}/follow/${targetUserId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (response.ok && body.success) return body.data;
    } catch (err) {
      console.error('Toggle follow error:', err);
    }
    return null;
  };

  const getFollowStatus = async (targetUserId) => {
    const token = localStorage.getItem('token');
    if (!token) return { isFollowing: false, followerCount: 0, followingCount: 0 };

    try {
      const response = await fetch(`${API_BASE_URL}/follow/${targetUserId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();
      if (response.ok && body.success) return body.data;
    } catch (err) {
      console.error('Get follow status error:', err);
    }
    return { isFollowing: false, followerCount: 0, followingCount: 0 };
  };

  // ─── User Search & Profile ───────────────────────────────────────────────────
  const searchUsers = async (query) => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/search?q=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const body = await response.json();
      if (response.ok && body.success) return body.data || [];
    } catch (err) {
      console.error('Search users error:', err);
    }
    return [];
  };

  const getUserProfileById = async (userId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/user/${userId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const body = await response.json();
      if (response.ok && body.success) return body.data;
    } catch (err) {
      console.error('Get user profile error:', err);
    }
    return null;
  };

  return (
    <AppContext.Provider value={{
      posts,
      notifications,
      unreadCount,
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
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      toggleFollow,
      getFollowStatus,
      searchUsers,
      getUserProfileById,
    }}>
      {children}
    </AppContext.Provider>
  );
};
