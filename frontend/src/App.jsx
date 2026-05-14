import { useState, useEffect, useRef } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs.sort((a, b) => b.likes - a.likes))
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const showNotification = (message, isError = false) => {
    if (isError) {
      setErrorMessage(message)
      setTimeout(() => setErrorMessage(null), 5000)
    } else {
      setNotification(message)
      setTimeout(() => setNotification(null), 5000)
    }
  }

  const handleLogin = async (credentials) => {
    try {
      const user = await loginService.login(credentials)
      window.localStorage.setItem('loggedBlogAppUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      showNotification('Inicio de sesión exitoso')
    } catch {
      showNotification('Usuario o contraseña incorrectos', true)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    showNotification('Sesión cerrada')
  }

  const createBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      blogFormRef.current.toggleVisibility()
      showNotification(`Nuevo blog "${returnedBlog.title}" por ${returnedBlog.author} añadido`)
    } catch {
      showNotification('Error al añadir el blog', true)
    }
  }

  const handleLike = async (blog) => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id
    }
    try {
      const returnedBlog = await blogService.update(blog.id, updatedBlog)
      setBlogs(blogs.map(b => b.id === blog.id ? { ...returnedBlog, user: blog.user } : b)
        .sort((a, b) => b.likes - a.likes))
      showNotification(`Te gusta "${blog.title}"`)
    } catch {
      showNotification('Error al dar like', true)
    }
  }

  const handleDelete = async (blog) => {
    if (window.confirm(`¿Eliminar el blog "${blog.title}" por ${blog.author}?`)) {
      try {
        await blogService.remove(blog.id)
        setBlogs(blogs.filter(b => b.id !== blog.id))
        showNotification(`Blog "${blog.title}" eliminado`)
      } catch {
        showNotification('Error al eliminar el blog', true)
      }
    }
  }

  if (user === null) {
    return (
      <div className="app-container">
        <div className="app-header">
          <h1>📝 Blog App</h1>
          <p>Comparte tus ideas con el mundo</p>
        </div>
        <div className="app-content">
          <h2>Iniciar sesión en la aplicación</h2>
          <Notification message={errorMessage || notification} type={errorMessage ? 'error' : 'notification'} />
          <LoginForm handleLogin={handleLogin} />
        </div>
        <div className="app-footer">
          <em>Blog App - Full Stack Open</em>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>📝 Blog App</h1>
        <p>Comparte tus ideas con el mundo</p>
      </div>
      
      <div className="app-content">
        <div className="user-info">
          <span className="user-name">{user.name} ha iniciado sesión</span>
          <button onClick={handleLogout} className="btn-danger">cerrar sesión</button>
        </div>

        <Notification message={errorMessage || notification} type={errorMessage ? 'error' : 'notification'} />

        <Togglable buttonLabel="crear nuevo blog" ref={blogFormRef}>
          <BlogForm createBlog={createBlog} />
        </Togglable>

        <div className="blogs-list">
          {blogs.map(blog =>
            <Blog
              key={blog.id}
              blog={blog}
              handleLike={handleLike}
              handleDelete={handleDelete}
              user={user}
            />
          )}
        </div>
      </div>
      
      <div className="app-footer">
        <em>Blog App - Full Stack Open</em>
      </div>
    </div>
  )
}

export default App