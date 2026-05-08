import { useState, useEffect } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import LoginForm from './components/LoginForm'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

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
      showNotification('Login successful')
    } catch (exception) {
      showNotification('Wrong username or password', true)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    showNotification('Logged out')
  }

  const createBlog = async (blogObject) => {
    try {
      const returnedBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(returnedBlog))
      showNotification(`A new blog "${returnedBlog.title}" by ${returnedBlog.author} added`)
    } catch (exception) {
      showNotification('Failed to add blog', true)
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
      showNotification(`Liked "${blog.title}"`)
    } catch (exception) {
      showNotification('Failed to like blog', true)
    }
  }

  const handleDelete = async (blog) => {
    if (window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`)) {
      try {
        await blogService.remove(blog.id)
        setBlogs(blogs.filter(b => b.id !== blog.id))
        showNotification(`Blog "${blog.title}" removed`)
      } catch (exception) {
        showNotification('Failed to delete blog', true)
      }
    }
  }

  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification message={errorMessage || notification} type={errorMessage ? 'error' : 'notification'} />
        <LoginForm handleLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={errorMessage || notification} type={errorMessage ? 'error' : 'notification'} />
      <p>{user.name} logged in <button onClick={handleLogout}>logout</button></p>
      <BlogForm createBlog={createBlog} />
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
  )
}

export default App