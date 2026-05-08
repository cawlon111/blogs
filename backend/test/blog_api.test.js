const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

// Variable global para el token
let authToken = null

// Limpiar y llenar la base de datos antes de cada prueba
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  
  // Crear usuario de prueba
  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash: await bcrypt.hash('password123', 10)
  })
  await user.save()

  // Obtener token para este usuario
  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'testuser', password: 'password123' })
  authToken = loginResponse.body.token

  // Guardar blogs con referencia al usuario (sin guardar la referencia en el usuario)
  for (const blog of helper.initialBlogs) {
    const blogObject = new Blog({
      ...blog,
      user: user._id
    })
    await blogObject.save()
  }
})

// Función para obtener token (devuelve el guardado)
const getToken = () => authToken

describe('GET /api/blogs', () => {
  
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('returns the correct number of blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blogs have an id property (not _id)', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(blog => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(resultBlog.body.title, blogToView.title)
    assert.strictEqual(resultBlog.body.author, blogToView.author)
    assert.strictEqual(resultBlog.body.url, blogToView.url)
    assert.strictEqual(resultBlog.body.likes, blogToView.likes)
    assert.ok(resultBlog.body.id)
  })

  test('returns 404 if blog does not exist', async () => {
    const nonExistingId = await helper.nonExistingId()
    
    await api
      .get(`/api/blogs/${nonExistingId}`)
      .expect(404)
  })

  test('returns 400 if id is malformed', async () => {
    await api
      .get('/api/blogs/12345')
      .expect(400)
  })
})

describe('POST /api/blogs', () => {
  
  test('creates a new blog successfully with token', async () => {
    const token = getToken()
    
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://test.com',
      likes: 7
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
    
    const titles = blogsAtEnd.map(blog => blog.title)
    assert.ok(titles.includes('Test Blog'))
  })

  test('fails with 401 if no token provided', async () => {
    const newBlog = {
      title: 'Test Blog',
      author: 'Test Author',
      url: 'https://test.com',
      likes: 7
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('if likes is missing, defaults to 0', async () => {
    const token = getToken()
    
    const newBlog = {
      title: 'Blog Without Likes',
      author: 'Test Author',
      url: 'https://test.com'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('returns 400 if title is missing', async () => {
    const token = getToken()
    
    const newBlog = {
      author: 'Test Author',
      url: 'https://test.com',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('returns 400 if url is missing', async () => {
    const token = getToken()
    
    const newBlog = {
      title: 'Blog Without URL',
      author: 'Test Author',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('DELETE /api/blogs/:id', () => {
  
  test('deletes a blog successfully with token', async () => {
    const token = getToken()
    
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const ids = blogsAtEnd.map(blog => blog.id)
    assert.ok(!ids.includes(blogToDelete.id))
  })

  test('fails with 401 if no token provided', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)
  })

  test('returns 400 if id is malformed', async () => {
    const token = getToken()
    
    await api
      .delete('/api/blogs/12345')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('PUT /api/blogs/:id', () => {
  
  test('updates a blog successfully', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      title: blogToUpdate.title,
      author: blogToUpdate.author,
      url: blogToUpdate.url,
      likes: blogToUpdate.likes + 10
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
  })

  test('returns 400 if id is malformed', async () => {
    await api
      .put('/api/blogs/12345')
      .send({ likes: 5 })
      .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})