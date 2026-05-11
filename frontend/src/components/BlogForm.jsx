import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({ title, author, url })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <form onSubmit={addBlog} className="blog-form">
      <h2>crear nuevo</h2>
      <div>
        título:
        <input
          type="text"
          value={title}
          name="Title"
          className="title-input"
          placeholder="título"
          onChange={({ target }) => setTitle(target.value)}
        />
      </div>
      <div>
        autor:
        <input
          type="text"
          value={author}
          name="Author"
          className="author-input"
          placeholder="autor"
          onChange={({ target }) => setAuthor(target.value)}
        />
      </div>
      <div>
        url:
        <input
          type="text"
          value={url}
          name="Url"
          className="url-input"
          placeholder="url"
          onChange={({ target }) => setUrl(target.value)}
        />
      </div>
      <button type="submit" className="create-button">crear</button>
    </form>
  )
}

export default BlogForm