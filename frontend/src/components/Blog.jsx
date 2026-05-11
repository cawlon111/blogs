import { useState } from 'react'

const Blog = ({ blog, handleLike, handleDelete, user }) => {
  const [visible, setVisible] = useState(false)

  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle} className="blog">
      <div>
        {blog.title} - {blog.author}
        <button onClick={toggleVisibility}>
          {visible ? 'ocultar' : 'ver'}
        </button>
      </div>
      <div style={showWhenVisible}>
        <div>url: {blog.url}</div>
        <div>likes: {blog.likes} <button onClick={() => handleLike(blog)}>like</button></div>
        <div>añadido por: {blog.user?.name || blog.user?.username}</div>
        {user && blog.user && user.username === blog.user.username && (
          <button onClick={() => handleDelete(blog)}>eliminar</button>
        )}
      </div>
    </div>
  )
}

export default Blog