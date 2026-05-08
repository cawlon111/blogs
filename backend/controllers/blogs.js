const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

// Obtener todos los blogs (con información del usuario)
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// Obtener blog por ID
blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

// Obtener token del header Authorization
const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

// Crear nuevo blog (requiere autenticación)
blogsRouter.post('/', async (request, response, next) => {
  const body = request.body
  const token = getTokenFrom(request)

  // Verificar token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (error) {
    return response.status(401).json({ error: 'token invalid' })
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

// Eliminar blog (solo el creador puede eliminarlo)
blogsRouter.delete('/:id', async (request, response, next) => {
  const token = getTokenFrom(request)

  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  let decodedToken
  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
  } catch (error) {
    return response.status(401).json({ error: 'token invalid' })
  }

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  try {
    const blog = await Blog.findById(request.params.id)
    
    if (!blog) {
      return response.status(404).end()
    }

    // Verificar que el usuario es el creador del blog
    if (blog.user.toString() !== decodedToken.id.toString()) {
      return response.status(401).json({ error: 'only the creator can delete the blog' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    
    // Eliminar la referencia del blog en el usuario
    const user = await User.findById(decodedToken.id)
    user.blogs = user.blogs.filter(b => b.toString() !== request.params.id)
    await user.save()
    
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

// Actualizar blog
blogsRouter.put('/:id', async (request, response, next) => {
  const { title, author, url, likes } = request.body

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { title, author, url, likes },
      { returnDocument: 'after', runValidators: true, context: 'query' }
    )
    
    if (updatedBlog) {
      response.json(updatedBlog)
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter