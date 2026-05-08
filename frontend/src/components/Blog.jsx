const Blog = ({ blog, handleLike, handleDelete, user }) => {
  return (
    <div className="blog">
      <div>
        {blog.title} - {blog.author}
      </div>
      <div>url: {blog.url}</div>
      <div>likes: {blog.likes} <button onClick={() => handleLike(blog)}>like</button></div>
      <div>added by: {blog.user?.name || blog.user?.username}</div>
      {user && blog.user && user.username === blog.user.username && (
        <button onClick={() => handleDelete(blog)}>remove</button>
      )}
    </div>
  )
}

export default Blog