import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import './CreatePost.css';

const CreatePost = ({ onPost }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!content.trim() && !image) return;
      if (onPost) onPost({ content, image });
      setContent('');
      setImage(null);
    }
  };

  return (
    <div className="create-post-container">
      <h2 className="create-post-title">Create Post</h2>
      <div className="create-post-box">
        <textarea
          placeholder="What's on your mind?"
          className="create-input"
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleSubmit}
          rows={1}
        />
        
        {image && (
          <div className="image-preview">
            <button className="remove-image-btn" onClick={removeImage}>
              <X size={18} />
            </button>
            <img src={image} alt="Preview" />
          </div>
        )}
        
        <div className="create-actions">
          <label className="camera-btn" style={{ cursor: 'pointer' }}>
            <Camera strokeWidth={1.5} size={20} />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden-file-input" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
