const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  }
  
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  
  const favorite = blogs.reduce((max, blog) => {
    return blog.likes > max.likes ? blog : max
  })
  
  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  
  // Contar blogs por autor
  const authorCount = {}
  
  blogs.forEach(blog => {
    if (authorCount[blog.author]) {
      authorCount[blog.author]++
    } else {
      authorCount[blog.author] = 1
    }
  })
  
  // Encontrar el autor con más blogs
  let maxAuthor = null
  let maxCount = 0
  
  for (const [author, count] of Object.entries(authorCount)) {
    if (count > maxCount) {
      maxCount = count
      maxAuthor = author
    }
  }
  
  return {
    author: maxAuthor,
    blogs: maxCount
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  
  // Sumar likes por autor
  const likesCount = {}
  
  blogs.forEach(blog => {
    if (likesCount[blog.author]) {
      likesCount[blog.author] += blog.likes
    } else {
      likesCount[blog.author] = blog.likes
    }
  })
  
  // Encontrar el autor con más likes
  let maxAuthor = null
  let maxLikes = 0
  
  for (const [author, likes] of Object.entries(likesCount)) {
    if (likes > maxLikes) {
      maxLikes = likes
      maxAuthor = author
    }
  }
  
  return {
    author: maxAuthor,
    likes: maxLikes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}