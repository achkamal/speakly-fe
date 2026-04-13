import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAppContext();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    register(name, username, email, password);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <MessageCircle size={32} color="var(--accent-color)" />
          Speakly
        </div>
        <p className="auth-subtitle">Bergabunglah dan bagikan ceritamu.</p>
        
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="name">Nama Lengkap</label>
            <input 
              type="text" 
              id="name" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              placeholder="johndoe" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="nama@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Kata Sandi</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary auth-button">Daftar</button>
        </form>

        <div className="auth-footer">
          Sudah punya akun? <Link to="/login" className="auth-link">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
