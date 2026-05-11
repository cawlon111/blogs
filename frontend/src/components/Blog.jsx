import { useState } from 'react'

const Blog = ({ blog, handleLike, handleDelete, user }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle} className="blog">
      <div className="blog-title-author">
        {blog.title} - {blog.author}
        <button onClick={() => setVisible(!visible)} className="view-button">
          {visible ? 'ocultar' : 'ver'}
        </button>
      </div>
      {visible && (
        <div className="blog-details">
          <div className="blog-url">url: {blog.url}</div>
          <div className="blog-likes">
            likes: {blog.likes} 
            <button onClick={() => handleLike(blog)} className="like-button">like</button>
          </div>
          <div className="blog-user">añadido por: {blog.user?.name || blog.user?.username}</div>
          {user && blog.user && user.username === blog.user.username && (
            <button onClick={() => handleDelete(blog)} className="remove-button">eliminar</button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog