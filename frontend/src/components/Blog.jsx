import { useState } from 'react'

const Blog = ({ blog, handleLike, handleDelete, user }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="blog-card">
      <div className="blog-header">
        <div>
          <span className="blog-title">{blog.title}</span>
          <span className="blog-author">- {blog.author}</span>
        </div>
        <div className="blog-actions">
          <button onClick={() => setVisible(!visible)}>
            {visible ? 'ocultar' : 'ver'}
          </button>
        </div>
      </div>
      {visible && (
        <div className="blog-details">
          <p>
            <strong>URL:</strong>{' '}
            <a href={blog.url} target="_blank" rel="noreferrer" className="blog-url">
              {blog.url}
            </a>
          </p>
          <p>
            <strong>Likes:</strong> {blog.likes}{' '}
            <button onClick={() => handleLike(blog)} className="like-button">
              👍 like
            </button>
          </p>
          <p className="blog-user">
            <strong>Añadido por:</strong> {blog.user?.name || blog.user?.username}
          </p>
          {user && blog.user && user.username === blog.user.username && (
            <button onClick={() => handleDelete(blog)} className="btn-danger">
              🗑️ eliminar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog